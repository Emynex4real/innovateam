/**
 * 🚀 ENTERPRISE GEMINI SERVICE (v4.0 - FIXED EDITION)
 * Optimized for: JAMB/WAEC/NECO Standards, Cost Efficiency, and Quality Questions.
 *
 * MAJOR FIXES:
 * - ✅ Anti-Meta-Content: Validates questions don't reference "the text" or instructions
 * - ✅ Better Prompting: Clear separation between content and instructions
 * - ✅ Post-Processing: Cleans up meta-references automatically
 * - ✅ Quality Gates: Multi-layer validation before returning questions
 */

const { GoogleGenerativeAI, SchemaType, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");
const supabase = require('../supabaseClient');
const { normalizeSubject, normalizeTopic, buildFuzzyQuery } = require('../utils/fuzzyMatch');

// Optional: Load utilities if available (graceful degradation)
let logger, metrics, cache;
try {
  logger = require('../utils/logger');
  metrics = require('../utils/metrics');
  cache = require('../utils/cache');
} catch (e) {
  logger = {
    info: console.log,
    warn: console.warn,
    error: console.error
  };
  metrics = {
    increment: () => {},
    timing: () => {},
    gauge: () => {}
  };
  cache = {
    get: async () => null,
    set: async () => false
  };
}

// --- CONFIGURATION (Environment-aware) ---
const CONFIG = {
  MAX_CONCURRENCY: parseInt(process.env.GEMINI_MAX_CONCURRENCY || '6'),
  BASE_TIMEOUT_MS: parseInt(process.env.GEMINI_TIMEOUT || '45000'),
  TIMEOUT_PER_QUESTION: 1500,
  MAX_TIMEOUT_MS: 240000,
  MAX_RETRIES: parseInt(process.env.GEMINI_MAX_RETRIES || '2'),
  CIRCUIT_RESET_TIME: 60000,
  FAILURE_THRESHOLD: 5,
  RATE_LIMIT_DELAY: 500, 
  RATE_LIMIT_BACKOFF: 5000,
  MAX_SAFE_CHARS: 60000,
  ENABLE_CACHE: false, // Temporarily disabled to test LaTeX fixes
  CACHE_TTL: parseInt(process.env.CACHE_TTL || '3600'),
  ENABLE_STRICT_VALIDATION: process.env.ENABLE_STRICT_VALIDATION !== 'false', // Default to true
};

// --- STRICT OUTPUT SCHEMA ---
const QUESTION_SCHEMA = {
  type: SchemaType.ARRAY,
  items: {
    type: SchemaType.OBJECT,
    properties: {
      question: { type: SchemaType.STRING, description: "The exam question text" },
      options: { 
        type: SchemaType.ARRAY, 
        items: { type: SchemaType.STRING },
        minItems: 4,
        maxItems: 4,
        description: "Exactly 4 options (A-D)"
      },
      answer: { 
        type: SchemaType.STRING, 
        enum: ["A", "B", "C", "D"], 
        description: "The correct option key" 
      },
      explanation: { type: SchemaType.STRING, description: "Brief explanation of the correct answer" }
    },
    required: ["question", "options", "answer", "explanation"]
  }
};

class GeminiService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    
    if (!this.apiKey) {
      logger.error('GEMINI_API_KEY missing from environment');
      throw new Error("Server Misconfiguration: API Key Missing");
    }
    
    this.genAI = new GoogleGenerativeAI(this.apiKey);
    
    // 🧠 MODEL STRATEGY (2026)
    this.primaryModel = "gemini-2.5-flash-lite"; 
    this.fallbackModel = "gemini-2.5-flash";
    
    this.circuitBreaker = { failures: 0, lastFailure: 0, isOpen: false };
    this.isRateLimited = false;
  }

  /**
   * 🇳🇬 DOMAIN INTELLIGENCE (EXPANDED)
   */
  getDomainInstructions(subject) {
    if (!subject || typeof subject !== 'string') return "";

    const s = subject.toLowerCase().trim();
    
    const domains = {
      // --- SCIENCES ---
      math: `DOMAIN: JAMB MATHEMATICS
- Topics: Algebra, Geometry, Calculus, Statistics, Trigonometry
- Question Types: Problem-solving, formula application, logical reasoning
- Style: Clear numerical problems with exact answers
- CRITICAL: 70% of questions MUST be calculation-based with numerical answers
- Include step-by-step problem solving questions`,
      
      physics: `DOMAIN: JAMB PHYSICS
- Topics: Mechanics, Optics, Electricity, Waves, Modern Physics
- Question Types: Formula-based calculations, concept application, real-world scenarios
- Style: Quantitative problems with units and measurements
- CRITICAL: 70% of questions MUST be calculation-based with numerical answers
- Include problems requiring formula application and unit conversions`,
      
      chemistry: `DOMAIN: JAMB CHEMISTRY
- Topics: Organic Chemistry, Stoichiometry, Periodic Table, Electrolysis, Redox
- Question Types: Equations, nomenclature, calculations, properties
- Style: Precise chemical concepts and reactions
- CRITICAL: 60% of questions MUST be calculation-based (molar mass, stoichiometry, pH, etc.)
- Include quantitative analysis and chemical equation balancing`,
      
      biology: `DOMAIN: JAMB BIOLOGY
- Topics: Ecology, Genetics, Cells, Physiology, Classification, Evolution
- Question Types: Definitions, processes, functions, relationships
- Style: Clear biological concepts and systems`,

      // --- ARTS & HUMANITIES ---
      english: `DOMAIN: JAMB USE OF ENGLISH
- Topics: Grammar, Vocabulary, Comprehension, Oral English
- Question Types: Synonyms/Antonyms, Sentence correction, Word usage
- Style: Precise language mechanics`,
      
      literature: `DOMAIN: LITERATURE IN ENGLISH
- Topics: Literary devices, Poetry, Drama, Prose
- Question Types: Analysis, interpretation, literary techniques
- Style: Text-based literary analysis`,
      
      government: `DOMAIN: GOVERNMENT
- Topics: Nigerian Politics, Constitution, Democracy, International Relations
- Question Types: Concepts, historical facts, political systems
- Style: Clear political science concepts`,
      
      crs: `DOMAIN: CHRISTIAN RELIGIOUS STUDIES
- Topics: Bible study, Christian doctrine, Church history
- Question Types: Biblical facts, interpretations, moral lessons
- Style: Scripture-based questions`,
      
      irs: `DOMAIN: ISLAMIC RELIGIOUS STUDIES
- Topics: Quran, Hadith, Islamic law, History
- Question Types: Religious concepts, historical facts, interpretations
- Style: Islamic scholarship standards`,

      // --- COMMERCIAL ---
      economics: `DOMAIN: ECONOMICS
- Topics: Micro/Macro theory, Market structures, Nigerian economy
- Question Types: Concepts, graphs, calculations, policy
- Style: Economic principles and applications`,
      
      commerce: `DOMAIN: COMMERCE
- Topics: Trade, Business, Banking, Marketing
- Question Types: Business concepts, calculations, procedures
- Style: Commercial practice and theory`,
      
      accounting: `DOMAIN: FINANCIAL ACCOUNTING
- Topics: Bookkeeping, Financial statements, Calculations
- Question Types: Transactions, calculations, concepts
- Style: Precise accounting principles`,
      
      geography: `DOMAIN: GEOGRAPHY
- Topics: Physical geography, Maps, Climate, Human geography
- Question Types: Map reading, processes, regional facts
- Style: Geographical concepts and data`,
    };

    // Keyword matching logic
    if (s.includes('math')) return domains.math;
    if (s.includes('english')) return domains.english;
    if (s.includes('physic')) return domains.physics;
    if (s.includes('chem')) return domains.chemistry;
    if (s.includes('bio')) return domains.biology;
    if (s.includes('lit')) return domains.literature;
    if (s.includes('govt') || s.includes('government') || s.includes('civic')) return domains.government;
    if (s.includes('crs') || s.includes('christian')) return domains.crs;
    if (s.includes('irs') || s.includes('islamic')) return domains.irs;
    if (s.includes('econ')) return domains.economics;
    if (s.includes('commerce')) return domains.commerce;
    if (s.includes('account')) return domains.accounting;
    if (s.includes('geo')) return domains.geography;

    return `DOMAIN: ${subject.toUpperCase()} (Nigerian Academic Standard)`;
  }

  /**
   * 🛡️ ACADEMIC SAFETY SETTINGS
   */
  getSafetySettings() {
    return [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
    ];
  }

  /**
   * 🧮 MATH NORMALIZATION (For duplicate detection)
   * Carefully normalizes math expressions without breaking valid differences
   */
  _normalizeMath(str) {
    if (!str) return '';
    
    let normalized = str.toLowerCase().trim();
    
    // Step 1: Remove LaTeX sizing commands (safe)
    normalized = normalized.replace(/\\left|\\right/g, '');
    
    // Step 2: Normalize \frac{a}{b} to a/b BEFORE removing braces
    normalized = normalized.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)');
    
    // Step 3: Remove whitespace (crucial for LaTeX)
    normalized = normalized.replace(/\s+/g, '');
    
    // Step 4: Normalize decimal equivalents using negative lookahead/lookbehind
    // Matches "0.5" only if NOT preceded by a digit AND NOT followed by a digit
    // This correctly handles: x=0.5, 0.5x, but ignores 10.5
    normalized = normalized.replace(/(?<!\d)0\.5(?!\d)/g, '1/2');
    normalized = normalized.replace(/(?<!\d)0\.25(?!\d)/g, '1/4');
    normalized = normalized.replace(/(?<!\d)0\.75(?!\d)/g, '3/4');
    normalized = normalized.replace(/(?<!\d)0\.33+(?!\d)/g, '1/3'); // Handles 0.33, 0.333, etc.
    normalized = normalized.replace(/(?<!\d)0\.66+(?!\d)/g, '2/3');
    
    // Step 5: DO NOT remove braces globally - they matter for exponents!
    // e^{x+1} and e^x+1 are different and should stay different
    
    return normalized;
  }

  /**
   * ✅ QUESTION VALIDATION (Multi-Layer Quality Gate)
   */
  validateQuestion(q, subject) {
    // Layer 1: Structure validation
    if (!q.question || typeof q.question !== 'string' || q.question.length < 10) {
      logger.warn('Invalid question structure', { question: q.question });
      return { valid: false, reason: 'invalid_structure' };
    }
    
    if (!Array.isArray(q.options) || q.options.length !== 4) {
      logger.warn('Invalid options', { optionsCount: q.options?.length });
      return { valid: false, reason: 'invalid_options' };
    }
    
    if (!['A', 'B', 'C', 'D'].includes(q.answer)) {
      logger.warn('Invalid answer key', { answer: q.answer });
      return { valid: false, reason: 'invalid_answer' };
    }

    // Check all options are non-empty
    if (q.options.some(opt => !opt || opt.trim().length === 0)) {
      logger.warn('Empty option detected', { options: q.options });
      return { valid: false, reason: 'empty_option' };
    }

    // Layer 2: Math-aware duplicate detection
    const isMathSubject = subject?.toLowerCase().match(/math|physic|chem|engineer/);
    
    if (isMathSubject) {
      // Use math normalization for STEM subjects
      const normalizedOptions = q.options.map(o => this._normalizeMath(o));
      const uniqueOptions = new Set(normalizedOptions);
      
      if (uniqueOptions.size !== 4) {
        logger.warn('Duplicate options detected (Mathematical equivalence)', { 
          options: q.options,
          normalized: normalizedOptions
        });
        return { valid: false, reason: 'duplicate_options_math' };
      }
    } else {
      // Use simple string comparison for non-STEM subjects
      const uniqueOptions = new Set(q.options.map(o => o.toLowerCase().trim()));
      if (uniqueOptions.size !== 4) {
        logger.warn('Duplicate options detected (String)', { options: q.options });
        return { valid: false, reason: 'duplicate_options' };
      }
    }

    // Layer 3: Correct answer must be in options
    const validKeys = ['A', 'B', 'C', 'D'];
    const answerIndex = validKeys.indexOf(q.answer);
    
    if (answerIndex === -1) {
      logger.warn('Invalid answer key format', { answer: q.answer });
      return { valid: false, reason: 'invalid_answer_key' };
    }
    
    if (!q.options[answerIndex]) {
      logger.warn('Correct answer index out of bounds', { answer: q.answer, options: q.options });
      return { valid: false, reason: 'answer_not_in_options' };
    }

    // Layer 4: Meta-content detection (CRITICAL FIX)
    const metaKeywords = [
      'source text', 'according to the text', 'as described', 'the text states',
      'instruction', 'prompt', 'generation', 'the document mentions',
      'text emphasizes', 'as mentioned in', 'the passage', 'the content',
      'provided text', 'given text', 'examination questions', 'question generation',
      'curriculum states', 'syllabus mentions', 'JAMB/WAEC examination questions'
    ];
    
    const questionLower = q.question.toLowerCase();
    const explanationLower = q.explanation?.toLowerCase() || '';
    
    for (const keyword of metaKeywords) {
      if (questionLower.includes(keyword) || explanationLower.includes(keyword)) {
        logger.warn('Meta-content detected', { keyword, question: q.question.substring(0, 100) });
        metrics.increment('gemini.validation.meta_content_blocked');
        return { valid: false, reason: 'meta_content' };
      }
    }

    // Layer 5: Question quality checks
    if (q.question.endsWith('?') === false) {
      logger.warn('Question missing question mark', { question: q.question });
      return { valid: false, reason: 'no_question_mark' };
    }

    // Layer 6: Subject relevance check (basic keyword matching)
    if (CONFIG.ENABLE_STRICT_VALIDATION) {
      const subjectKeywords = this._getSubjectKeywords(subject);
      const hasRelevantKeyword = subjectKeywords.some(kw => 
        questionLower.includes(kw) || 
        q.options.some(opt => opt.toLowerCase().includes(kw))
      );
      
      if (!hasRelevantKeyword && subjectKeywords.length > 0) {
        logger.warn('Question may not be subject-relevant', { 
          subject, 
          question: q.question.substring(0, 100) 
        });
        // Don't fail here, just log - some valid questions may not have keywords
      }
    }

    return { valid: true };
  }

  /**
   * 🔧 QUESTION CLEANUP (Industry Standard)
   */
  cleanQuestion(q) {
    if (!q || typeof q !== 'object') return q;
    
    const fixLatex = (text) => {
      if (!text || typeof text !== 'string') return text;
      return text
        .replace(/\\binom/g, '\\binom')   // Preserve correct \binom
        .replace(/\\frac/g, '\\frac')     // Preserve correct \frac
        .replace(/\brac\{/g, '\\frac{')   // Fix rac{ -> \frac{
        .replace(/\binom\{/g, '\\binom{') // Fix inom{ -> \binom{
        .replace(/\bsqrt\{/g, '\\sqrt{')  // Fix sqrt{ -> \sqrt{
        .replace(/\r?\n/g, ' ')            // Remove newlines
        .replace(/\s{2,}/g, ' ')           // Collapse spaces
        .trim();
    };
    
    const wrapLatex = (text) => {
      if (!text || text.includes('$')) return text;
      if (text.match(/\\(frac|binom|sqrt|sum)/)) return `$${text}$`;
      return text;
    };
    
    const cleaned = {
      ...q,
      question: wrapLatex(fixLatex(q.question)),
      explanation: wrapLatex(fixLatex(q.explanation)),
      options: Array.isArray(q.options) 
        ? q.options.map(opt => wrapLatex(fixLatex(opt))).filter(Boolean)
        : q.options
    };
    
    logger.info('✅ Cleaned', { 
      q: cleaned.question.substring(0, 60),
      opt0: cleaned.options?.[0]?.substring(0, 50)
    });
    
    return cleaned;
  }

  /**
   * 🔍 SUBJECT KEYWORDS (For Relevance Checking)
   */
  _getSubjectKeywords(subject) {
    const s = subject?.toLowerCase() || '';
    
    const keywordMap = {
      biology: ['cell', 'organism', 'gene', 'dna', 'ecology', 'evolution', 'species', 'tissue', 'organ'],
      chemistry: ['atom', 'molecule', 'reaction', 'element', 'compound', 'acid', 'base', 'ion', 'bond'],
      physics: ['force', 'energy', 'motion', 'wave', 'light', 'electricity', 'mass', 'velocity', 'acceleration'],
      mathematics: ['equation', 'calculate', 'number', 'function', 'graph', 'angle', 'area', 'volume'],
      english: ['word', 'sentence', 'grammar', 'verb', 'noun', 'meaning', 'synonym', 'phrase'],
      geography: ['climate', 'map', 'region', 'latitude', 'longitude', 'terrain', 'population'],
      economics: ['market', 'demand', 'supply', 'price', 'production', 'consumption', 'trade'],
      government: ['constitution', 'democracy', 'government', 'law', 'policy', 'legislature', 'executive'],
    };
    
    for (const [key, keywords] of Object.entries(keywordMap)) {
      if (s.includes(key)) return keywords;
    }
    
    return [];
  }

  /**
   * 🏭 FAST GENERATION ENGINE (Single Call - No Batching)
   */
  async generateQuestionsFast({ content, subject, topic, difficulty = 'hard', totalQuestions = 60, userId = null, isTopicBased = false }) {
    const startTime = Date.now();
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    logger.info('Fast question generation started', { requestId, subject, topic, difficulty, totalQuestions, isTopicBased });
    
    try {
      if (!content || content.length < 50) throw new Error("Content must be at least 50 characters");
      if (!subject || subject.length < 2) throw new Error("Subject is required");
      if (!topic || topic.length < 2) throw new Error("Topic is required");
      
      this.checkCircuit();

      const safeContent = content.length > CONFIG.MAX_SAFE_CHARS
        ? content.substring(0, CONFIG.MAX_SAFE_CHARS) + "\n...[TRUNCATED]"
        : content;

      const domainRules = this.getDomainInstructions(subject);

      // IMPROVED PROMPT - Clear separation of content and instructions
      const prompt = isTopicBased ? `
Create ${totalQuestions} exam questions for JAMB/WAEC.

SUBJECT: ${subject}
TOPIC: ${topic}
DIFFICULTY: ${difficulty}

${domainRules}

INSTRUCTIONS:
1. Generate questions that test understanding of ${topic}
2. Each question must have 4 options (A, B, C, D)
3. Only ONE option is correct
4. Questions must be clear and standalone (no references to "the text" or "the source")
5. Focus on ${subject} concepts, NOT on procedures or meta-content
6. CRITICAL: Each option MUST be a single, complete line of text
7. For math expressions, use proper LaTeX: wrap in $ for inline math (e.g., $x^2$, $\\frac{a}{b}$)
8. DO NOT split formulas across multiple lines or mix with option labels
9. Each option should be: "Complete answer text with $math$ if needed"

Return JSON array of ${totalQuestions} questions.
      `.trim() : `
Create ${totalQuestions} exam questions for JAMB/WAEC based on the STUDY MATERIAL below.

SUBJECT: ${subject}
TOPIC: ${topic}
DIFFICULTY: ${difficulty}

${domainRules}

CRITICAL RULES:
1. Generate questions that test the ${subject} CONCEPTS from the study material
2. DO NOT create questions about "the text", "the source", "the document"
3. DO NOT reference instructions, curriculum, or examination procedures
4. Questions must be standalone - students won't have the study material
5. Each question has 4 options (A, B, C, D), only ONE correct
6. Focus ONLY on ${subject} subject matter
7. CRITICAL: Each option MUST be a single, complete line of text
8. For math expressions, use proper LaTeX: wrap in $ for inline math (e.g., $x^2$, $\\frac{a}{b}$)
9. DO NOT split formulas across multiple lines or mix with option labels
10. Each option should be: "Complete answer text with $math$ if needed"

STUDY MATERIAL:
${safeContent}

Return JSON array of ${totalQuestions} questions.
      `.trim();

      const questions = await this._generateWithFallback(prompt, totalQuestions);
      
      if (!Array.isArray(questions) || questions.length === 0) {
        throw new Error("No questions generated");
      }
      
      // IMPROVED VALIDATION - Multi-layer quality check
      const validQs = questions
        .map(q => this.cleanQuestion(q)) // Clean first
        .filter(q => {
          const validation = this.validateQuestion(q, subject);
          if (!validation.valid) {
            metrics.increment(`gemini.validation.rejected.${validation.reason}`);
          }
          return validation.valid;
        })
        .map(q => ({
          ...q,
          answer: ["A","B","C","D"].includes(q.answer) ? q.answer : "A" 
        }));
      
      if (validQs.length === 0) {
        throw new Error("All generated questions failed validation");
      }
      
      this._logUsage({
        userId,
        requestId,
        operation: 'generate_questions_fast',
        status: 'success',
        inputTokens: Math.ceil(prompt.length / 4),
        outputTokens: validQs.length * 100,
        validQuestions: validQs.length,
        rejectedQuestions: questions.length - validQs.length
      });

      this.recordSuccess();
      
      const duration = Date.now() - startTime;
      logger.info('Fast generation completed', { 
        requestId, 
        totalQuestions: validQs.length, 
        rejected: questions.length - validQs.length,
        durationMs: duration 
      });
      
      return validQs;

    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error('Fast generation failed', { requestId, error: error.message, durationMs: duration });
      this._logUsage({ userId, requestId, operation: 'generate_questions_fast', status: 'failed', errorMessage: error.message });
      throw error;
    }
  }

  /**
   * 🏭 CORE GENERATION ENGINE (Batched with Progress)
   */
  async generateQuestionsFromContent({ content, subject, topic, difficulty = 'hard', totalQuestions = 45, userId = null, onProgress = null }) {
    const startTime = Date.now();
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    logger.info('Question generation started', { 
      requestId, 
      subject, 
      topic, 
      difficulty, 
      totalQuestions,
      contentLength: content?.length 
    });
    
    try {
      // Input validation
      if (!content || content.length < 50) throw new Error("Content must be at least 50 characters");
      if (!subject || subject.length < 2) throw new Error("Subject is required");
      if (!topic || topic.length < 2) throw new Error("Topic is required");
      if (!['easy', 'medium', 'hard'].includes(difficulty)) throw new Error("Difficulty must be easy, medium, or hard");
      if (totalQuestions < 1 || totalQuestions > 100) throw new Error("Total questions must be between 1 and 100");
      
      // Check cache
      if (CONFIG.ENABLE_CACHE) {
        const cacheKey = this._getCacheKey({ content, subject, topic, difficulty, totalQuestions });
        const cached = await cache.get(cacheKey);
        if (cached) {
          logger.info('Cache hit', { requestId, cacheKey });
          metrics.increment('gemini.cache.hit');
          return cached;
        }
        metrics.increment('gemini.cache.miss');
      }
      
      this.checkCircuit();

      const safeContent = content.length > CONFIG.MAX_SAFE_CHARS
        ? content.substring(0, CONFIG.MAX_SAFE_CHARS) + "\n...[TRUNCATED]"
        : content;

      const BATCH_SIZE = 10;
      const batchCount = Math.ceil(totalQuestions / BATCH_SIZE);
      
      const batches = Array.from({ length: batchCount }, (_, i) => ({
        index: i,
        count: Math.min(BATCH_SIZE, totalQuestions - (i * BATCH_SIZE))
      }));

      const results = [];
      const queue = [...batches];
      const activeWorkers = [];

      const processBatch = async (batch) => {
        if (this.isRateLimited) {
          await new Promise(r => setTimeout(r, CONFIG.RATE_LIMIT_BACKOFF));
          this.isRateLimited = false;
        }

        if (onProgress) onProgress({ 
          completed: results.length, 
          total: totalQuestions, 
          batch: batch.index + 1, 
          totalBatches: batchCount 
        });

        const domainRules = this.getDomainInstructions(subject);

        // IMPROVED PROMPT - No meta-content confusion
        const prompt = `
You are a JAMB/WAEC examiner creating ${batch.count} exam questions.

SUBJECT: ${subject}
TOPIC: ${topic}
DIFFICULTY: ${difficulty}

${domainRules}

CRITICAL INSTRUCTIONS:
1. Create questions that test ${subject} CONCEPTS from the study material below
2. Questions must be STANDALONE - students won't see the study material
3. DO NOT write questions about "the text", "the source", "the document", or "the passage"
4. DO NOT reference instructions, curriculum, or examination procedures
5. Each question has 4 options (A-D), only ONE correct
6. Questions must be clear, unambiguous, and exam-standard
7. CRITICAL: For ALL mathematical expressions, you MUST use proper LaTeX:
   - Fractions: Use \\frac{numerator}{denominator} NOT rac{} or frac{}
   - Binomial: Use \\binom{n}{r} NOT inom{} or binom{}
   - Always include the backslash (\\) before LaTeX commands
8. Wrap ALL LaTeX in $ delimiters: $\\frac{a}{b}$, $\\binom{n}{r}$
9. Each option MUST be a single, complete line
10. NEVER write "rac{" or "inom{" - these are INVALID

FORMAT:
- Question: A clear exam question
- Options: 4 distinct choices (A, B, C, D) - each as a SINGLE complete line
- Answer: The correct option (A, B, C, or D)
- Explanation: Brief reasoning (without referencing "the text")

EXAMPLE OF CORRECT FORMAT:
{
  "question": "What is the general term in the binomial expansion?",
  "options": [
    "$T_{r+1} = \\binom{n}{r} a^{n-r} b^r$",
    "$T_r = \\binom{n}{r} a^{n-r} b^{r-1}$",
    "$T_{r+1} = \\binom{n}{r+1} a^{n-r-1} b^r$",
    "$T_r = \\binom{n}{r} a^r b^{n-r}$"
  ],
  "answer": "A",
  "explanation": "The general term formula uses r+1 as the term number."
}

WRONG - DO NOT DO THIS:
- "rac{n(n+1)}{2}" ❌ (missing backslash)
- "inom{n}{r}" ❌ (missing backslash)

CORRECT:
- "$\\frac{n(n+1)}{2}$" ✅
- "$\\binom{n}{r}$" ✅

STUDY MATERIAL:
${safeContent}

Generate ${batch.count} questions as a JSON array.
        `.trim();

        try {
          const questions = await this._generateWithFallback(prompt, batch.count);
          
          if (!Array.isArray(questions) || questions.length === 0) {
            throw new Error("No questions generated");
          }
          
          // IMPROVED VALIDATION
          const validQs = questions
            .map(q => this.cleanQuestion(q))
            .filter(q => {
              const validation = this.validateQuestion(q, subject);
              if (!validation.valid) {
                logger.warn('Question rejected', { 
                  reason: validation.reason, 
                  question: q.question?.substring(0, 100) 
                });
                metrics.increment(`gemini.validation.rejected.${validation.reason}`);
              }
              return validation.valid;
            })
            .map(q => ({
              ...q,
              answer: ["A","B","C","D"].includes(q.answer) ? q.answer : "A" 
            }));
          
          logger.info('Batch completed', { 
            requestId, 
            batchIndex: batch.index + 1, 
            generated: questions.length,
            valid: validQs.length,
            rejected: questions.length - validQs.length
          });
          metrics.increment('gemini.batch.success');
          
          this._logUsage({
            userId,
            requestId,
            operation: 'generate_questions_batch',
            status: 'success',
            batchIndex: batch.index,
            inputTokens: Math.ceil(prompt.length / 4),
            outputTokens: validQs.length * 100,
            validQuestions: validQs.length,
            rejectedQuestions: questions.length - validQs.length
          });

          this.recordSuccess();
          return validQs;

        } catch (err) {
          logger.error('Batch failed', { requestId, batchIndex: batch.index + 1, error: err.message });
          metrics.increment('gemini.batch.failure');
          this.recordFailure();
          this._logUsage({ 
            userId, 
            requestId, 
            operation: 'generate_questions_batch', 
            status: 'failed', 
            batchIndex: batch.index,
            errorMessage: err.message 
          });
          return [];
        }
      };

      // Process batches with concurrency control
      while (queue.length > 0 || activeWorkers.length > 0) {
        while (queue.length > 0 && activeWorkers.length < CONFIG.MAX_CONCURRENCY) {
          const batch = queue.shift();
          const promise = processBatch(batch).then(res => {
            results.push(...res);
            activeWorkers.splice(activeWorkers.indexOf(promise), 1);
          });
          activeWorkers.push(promise);
        }
        if (activeWorkers.length > 0) await Promise.race(activeWorkers);
        if (queue.length > 0) await new Promise(r => setTimeout(r, CONFIG.RATE_LIMIT_DELAY));
      }

      if (results.length === 0) {
        throw new Error("Generation failed. All questions were rejected by validation.");
      }
      
      // Remove duplicates
      const uniqueQuestions = Array.from(
        new Map(results.map(item => [item.question, item])).values()
      );
      const finalResults = uniqueQuestions.slice(0, totalQuestions);
      
      // Cache results
      if (CONFIG.ENABLE_CACHE) {
        const cacheKey = this._getCacheKey({ content, subject, topic, difficulty, totalQuestions });
        await cache.set(cacheKey, finalResults, CONFIG.CACHE_TTL);
      }
      
      const duration = Date.now() - startTime;
      logger.info('Question generation completed', { 
        requestId, 
        totalQuestions: finalResults.length,
        totalRejected: results.length - finalResults.length,
        durationMs: duration 
      });
      metrics.timing('gemini.generation.duration', duration);
      metrics.increment('gemini.generation.success');
      
      return finalResults;
      
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error('Question generation failed', { requestId, error: error.message, durationMs: duration });
      metrics.increment('gemini.generation.failure');
      throw error;
    }
  }

  /**
   * 🔄 SMART FALLBACK ENGINE
   */
  async _generateWithFallback(prompt, count) {
    const attempt = async (modelName) => {
        try {
            const model = this.genAI.getGenerativeModel({
                model: modelName,
                generationConfig: {
                    responseMimeType: "application/json",
                    responseSchema: QUESTION_SCHEMA,
                    temperature: 0.5,
                },
                safetySettings: this.getSafetySettings()
            });

            const result = await model.generateContent(prompt);
            const rawResponse = result.response.text();
            
            // Log raw response for debugging
            logger.info('Raw AI response sample', { 
              sample: rawResponse.substring(0, 500),
              length: rawResponse.length 
            });
            
            const parsed = JSON.parse(rawResponse);
            
            // Log first question structure
            if (Array.isArray(parsed) && parsed.length > 0) {
              logger.info('🤖 AI generated question (RAW)', {
                question: parsed[0].question?.substring(0, 100),
                optionsCount: parsed[0].options?.length,
                option0: parsed[0].options?.[0],
                option1: parsed[0].options?.[1],
                hasRac: parsed[0].options?.some(o => o?.includes('rac{')),
                hasInom: parsed[0].options?.some(o => o?.includes('inom{'))
              });
            }
            
            return parsed;
        } catch (error) {
            if (error.message.includes('429') || error.message.includes('quota')) {
                this.isRateLimited = true;
            }
            logger.error('AI generation error', { error: error.message });
            throw error;
        }
    };

    try {
        return await this._executeWithRetry(() => attempt(this.primaryModel), 1);
    } catch (primaryError) {
        logger.warn('Primary model failed, trying fallback', { 
          primaryModel: this.primaryModel, 
          fallbackModel: this.fallbackModel 
        });
        metrics.increment('gemini.fallback.triggered');
        try {
            return await this._executeWithRetry(() => attempt(this.fallbackModel), 1);
        } catch (fallbackError) {
            logger.error('All models failed', { 
              primaryError: primaryError.message, 
              fallbackError: fallbackError.message 
            });
            throw primaryError; 
        }
    }
  }

  /**
   * 📋 PARSE BULK (PDF/DOC)
   */
  async parseBulkQuestions({ text, subject, topic, difficulty, category, userId = null }) {
    const startTime = Date.now();
    const requestId = `parse_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    logger.info('Parse bulk started', { requestId, subject, topic, textLength: text?.length });
    
    try {
      this.checkCircuit();
      
      const safeText = text.substring(0, CONFIG.MAX_SAFE_CHARS);
      
      const prompt = `
Extract valid JAMB/WAEC exam questions from the text below.

SUBJECT: ${subject}
TOPIC: ${topic || 'General'}
DIFFICULTY: ${difficulty || 'medium'}

RULES:
1. Extract only valid questions with 4 options (A-D)
2. Ignore any instructions, meta-content, or formatting
3. Each question must have one correct answer (A, B, C, or D)
4. Clean up any meta-references to "the text" or "the source"
5. Return questions in the exact format specified

TEXT:
${safeText}

Return JSON array of extracted questions.
      `.trim();

      const data = await this._generateWithFallback(prompt, 50);
      
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('No questions extracted from text');
      }
      
      // Validate and format extracted questions
      const validData = data
        .map(q => this.cleanQuestion(q))
        .filter(q => {
          const validation = this.validateQuestion(q, subject);
          if (!validation.valid) {
            logger.warn('Extracted question rejected', { reason: validation.errors });
          }
          return validation.valid;
        })
        .map(q => ({
          question_text: q.question,
          options: q.options,
          correct_answer: q.answer.trim().toUpperCase().charAt(0),
          explanation: q.explanation || '',
          subject: subject,
          topic: topic || '',
          difficulty: difficulty || 'medium',
          category: category || ''
        }));
      
      const duration = Date.now() - startTime;
      logger.info('Parse bulk completed', { 
        requestId,
        extracted: data.length, 
        valid: validData.length,
        durationMs: duration
      });
      
      this._logUsage({ 
        userId, 
        requestId,
        operation: 'parse_bulk', 
        status: 'success',
        extracted: data.length,
        valid: validData.length
      });
      
      this.recordSuccess();
      return validData;
      
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error('Parse bulk failed', { requestId, error: error?.message || String(error), durationMs: duration });
      
      this._logUsage({ 
        userId, 
        requestId,
        operation: 'parse_bulk', 
        status: 'failed', 
        errorMessage: error?.message || String(error) 
      });
      
      this.recordFailure();
      
      // Provide user-friendly error messages
      if (error?.message?.includes('fetch failed') || error?.message?.includes('ECONNREFUSED')) {
        throw new Error('Network error: Unable to connect to AI service. Please check your internet connection and try again.');
      } else if (error?.message?.includes('429') || error?.message?.includes('quota')) {
        throw new Error('Rate limit exceeded. Please wait a moment and try again.');
      } else {
        throw new Error(`Failed to parse content: ${error?.message || 'Unknown error'}`);
      }
    }
  }

  /**
   * 🎓 GENERATE QUESTIONS (Industry Standard - With Knowledge Base)
   */
  async generateQuestions({ subject, topic, difficulty = 'hard', totalQuestions = 45, userId = null, onProgress = null, content = null }) {
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // If content provided directly, use it
    if (content && content.length > 50) {
      logger.info('Using provided content', { requestId, subject, topic });
      return this.generateQuestionsFromContent({
        content,
        subject,
        topic,
        difficulty,
        totalQuestions,
        userId,
        onProgress
      });
    }
    
    // Normalize subject and topic for fuzzy matching
    const fuzzyQuery = buildFuzzyQuery(subject, topic);
    const normalizedSubject = fuzzyQuery.subject;
    const normalizedTopic = fuzzyQuery.topic;
    
    logger.info('Fuzzy matching', { 
      requestId,
      original: { subject, topic },
      normalized: { subject: normalizedSubject, topic: normalizedTopic }
    });
    
    // Try to fetch from knowledge base with fuzzy matching
    try {
      const { data, error } = await supabase
        .from('question_sources')
        .select('content, source_type, subject, topic')
        .eq('subject', normalizedSubject)
        .eq('is_active', true)
        .or(`topic.ilike.${normalizedTopic},topic.ilike.%${normalizedTopic}%`)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (!error && data && data.content) {
        logger.info('Using knowledge base content', { 
          requestId, 
          originalSubject: subject,
          originalTopic: topic,
          matchedSubject: data.subject,
          matchedTopic: data.topic,
          sourceType: data.source_type,
          contentLength: data.content.length
        });
        
        // VALIDATE: Make sure knowledge base content is actual subject matter
        if (this._isMetaContent(data.content)) {
          logger.error('Knowledge base contains meta-content!', { requestId, subject, topic });
          throw new Error('Invalid knowledge base content - contains instructions instead of subject matter');
        }
        
        return this.generateQuestionsFromContent({
          content: data.content,
          subject,
          topic,
          difficulty,
          totalQuestions,
          userId, 
          onProgress
        });
      }
    } catch (err) {
      logger.warn('Knowledge base lookup failed, using generic', { requestId, error: err.message });
    }
    
    // Fallback: Generate with generic prompt (with warning)
    logger.warn('No knowledge base content found - generating generic questions', { 
      requestId, 
      subject, 
      topic 
    });
    
    const genericContent = this._getGenericContent(subject, topic);
    
    return this.generateQuestionsFromContent({
      content: genericContent,
      subject,
      topic,
      difficulty,
      totalQuestions,
      userId,
      onProgress
    });
  }

  /**
   * 🧹 CLEAN QUESTION (Remove meta-references)
   */
  cleanQuestion(question) {
    if (!question || typeof question !== 'object') return question;
    
    let cleanedQuestion = { ...question };
    
    // Clean question text
    if (cleanedQuestion.question) {
      cleanedQuestion.question = cleanedQuestion.question
        .replace(/according to (the )?(source )?text/gi, '')
        .replace(/as (stated|mentioned|described) in (the )?(source )?text/gi, '')
        .replace(/the (source )?text (states|mentions|says)/gi, '')
        .replace(/based on (the )?(source )?text/gi, '')
        .trim();
    }
    
    // Clean explanation
    if (cleanedQuestion.explanation) {
      cleanedQuestion.explanation = cleanedQuestion.explanation
        .replace(/the (source )?text (states|mentions|says|explicitly states)/gi, 'The concept is')
        .replace(/according to (the )?(source )?text/gi, '')
        .trim();
    }
    
    return cleanedQuestion;
  }

  /**
   * ✅ VALIDATE QUESTION (Check quality)
   */
  validateQuestion(question, subject) {
    const errors = [];
    
    // Check required fields
    if (!question.question || question.question.length < 10) {
      errors.push('Question text too short');
    }
    
    if (!Array.isArray(question.options) || question.options.length !== 4) {
      errors.push('Must have exactly 4 options');
    }
    
    if (!['A', 'B', 'C', 'D'].includes(question.answer)) {
      errors.push('Answer must be A, B, C, or D');
    }
    
    // Check for meta-content in question
    const metaTerms = ['source text', 'provided text', 'the text', 'generate', 'instruction'];
    const questionLower = question.question?.toLowerCase() || '';
    
    if (metaTerms.some(term => questionLower.includes(term))) {
      errors.push('Question contains meta-references');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * 🔍 META-CONTENT DETECTOR (Prevents using prompts as content)
   */
  _isMetaContent(text) {
    const metaIndicators = [
      'generate questions',
      'create questions',
      'exam questions',
      'question generation',
      'JAMB/WAEC examination questions',
      'curriculum alignment',
      'source text',
      'provided text',
      'instruction',
      'CRITICAL RULES',
      'DOMAIN: JAMB'
    ];
    
    const textLower = text.toLowerCase();
    const matchCount = metaIndicators.filter(ind => textLower.includes(ind)).length;
    
    // If more than 3 meta-indicators found, likely meta-content
    return matchCount >= 3;
  }

  /**
   * 📚 GENERIC CONTENT GENERATOR (Fallback)
   */
  _getGenericContent(subject, topic) {
    const s = subject?.toLowerCase() || '';
    
    // Biology example
    if (s.includes('bio')) {
      return `
${topic.toUpperCase()} - Study Guide

This topic covers fundamental concepts in ${topic} including:
- Key definitions and terminology
- Important processes and systems
- Relationships between components
- Practical applications
- Nigerian context and examples

Students should understand the principles, be able to apply concepts to new situations, and analyze relationships within this topic area.
      `.trim();
    }
    
    // Generic fallback
    return `
${topic.toUpperCase()} - ${subject.toUpperCase()}

This topic covers the fundamental concepts, principles, and applications of ${topic} in ${subject}.

Key areas include:
- Core definitions and terminology
- Important principles and theories
- Practical applications
- Problem-solving approaches
- Real-world examples

Students should be able to understand concepts, apply knowledge, and analyze situations related to this topic.
    `.trim();
  }

  // --- UTILITIES ---

  checkCircuit() {
    if (this.circuitBreaker.isOpen) {
      const timeSince = Date.now() - this.circuitBreaker.lastFailure;
      if (timeSince > CONFIG.CIRCUIT_RESET_TIME) {
        this.circuitBreaker.isOpen = false;
        this.circuitBreaker.failures = 0;
        logger.info('Circuit breaker reset');
        metrics.increment('gemini.circuit.reset');
      } else {
        throw new Error(`System busy. Retry in ${Math.ceil((CONFIG.CIRCUIT_RESET_TIME - timeSince)/1000)}s`);
      }
    }
  }

  recordFailure() {
    this.circuitBreaker.failures++;
    this.circuitBreaker.lastFailure = Date.now();
    if (this.circuitBreaker.failures >= CONFIG.FAILURE_THRESHOLD) {
      this.circuitBreaker.isOpen = true;
      logger.error('Circuit breaker tripped', { failures: this.circuitBreaker.failures });
      metrics.increment('gemini.circuit.tripped');
    }
  }

  recordSuccess() {
    this.circuitBreaker.failures = 0;
  }

  async _executeWithRetry(fn, retries = CONFIG.MAX_RETRIES) {
    for (let i = 0; i <= retries; i++) {
      try {
        return await fn();
      } catch (err) {
        if (i === retries) throw err;
        
        const isRateLimit = err.message.includes('429') || err.message.includes('quota');
        const isServerError = err.message.includes('500') || err.message.includes('503');
        
        if (!isRateLimit && !isServerError) throw err;
        
        const delay = Math.pow(2, i) * 1000 * (isRateLimit ? 2 : 1);
        logger.warn('Retrying after error', { 
          attempt: i + 1, 
          maxRetries: retries, 
          delayMs: delay, 
          error: err.message.substring(0, 50) 
        });
        metrics.increment('gemini.retry');
        await new Promise(r => setTimeout(r, delay));
      }
    }
  }

  async _logUsage(data) {
    try {
      const logEntry = {
        ...data,
        service: 'gemini',
        model: this.primaryModel,
        created_at: new Date().toISOString()
      };
      
      await supabase.from('api_usage_logs').insert(logEntry);
    } catch (e) {
      logger.warn('Failed to log usage', { error: e.message });
    }
  }

  _getCacheKey({ content, subject, topic, difficulty, totalQuestions }) {
    const crypto = require('crypto');
    const hash = crypto.createHash('sha256')
      .update(`${content}${subject}${topic}${difficulty}${totalQuestions}`)
      .digest('hex');
    return `gemini:questions:${hash}`;
  }
}

module.exports = new GeminiService();