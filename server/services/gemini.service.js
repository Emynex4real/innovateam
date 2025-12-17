const { GoogleGenerativeAI } = require("@google/generative-ai");

class GeminiService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    if (!this.apiKey) console.error('⚠️ GEMINI_API_KEY not found');
    this.genAI = new GoogleGenerativeAI(this.apiKey);
    this.cachedModelName = null;
  }

  /**
   * 🔍 DYNAMIC MODEL FINDER
   * Auto-detects the best available Gemini model
   */
  async getBestModelName() {
    if (this.cachedModelName) return this.cachedModelName;

    console.log("🔍 Auto-detecting best available Gemini model...");
    
    try {
      // 1. Ask Google what models you have access to
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${this.apiKey}`);
      const data = await response.json();
      
      if (!data.models) throw new Error("No models returned from Google API");

      const models = data.models;

      // 2. Priority Search: Look for '2.5-flash', then '1.5-flash', then any 'flash'
      let chosen = models.find(m => m.name.includes('gemini-2.5-flash'));
      if (!chosen) chosen = models.find(m => m.name.includes('gemini-1.5-flash'));
      if (!chosen) chosen = models.find(m => m.name.includes('flash'));
      if (!chosen) chosen = models.find(m => m.name.includes('gemini-pro'));
      
      // Fallback to the first available model if nothing matches
      if (!chosen) chosen = models[0];

      // 3. Clean the name (remove "models/" prefix)
      this.cachedModelName = chosen.name.replace("models/", "");
      
      console.log(`✅ Selected Model: ${this.cachedModelName}`);
      return this.cachedModelName;

    } catch (error) {
      console.error("❌ Model Discovery Failed:", error.message);
      // Fallback hardcoded if discovery fails (network issue)
      return "gemini-2.5-flash"; 
    }
  }

  /**
   * 🎯 DOMAIN-SPECIFIC INSTRUCTIONS
   * Returns tailored instructions based on the subject
   * 
   * @param {string} subject - The subject/domain for question generation
   * @returns {string} Domain-specific instructions
   */
  getDomainInstructions(subject) {
    // 🔒 DEFENSIVE CHECK: Handle undefined, null, or non-string subjects
    if (!subject || typeof subject !== 'string') {
      console.warn('⚠️ Invalid subject provided to getDomainInstructions:', subject);
      return `DOMAIN: GENERAL ACADEMIC. Generate well-structured examination questions.`;
    }

    const s = subject.toLowerCase().trim();
    
    // Subject-specific instructions
    if (s.includes('english')) {
      return `DOMAIN: JAMB USE OF ENGLISH
- Focus on Lexis and Structure (vocabulary, grammar)
- Include Oral English (pronunciation, stress patterns)
- Test comprehension and language usage
- Include sentence completion and error identification`;
    }
    
    if (s.includes('math') || s.includes('mathematics')) {
      return `DOMAIN: MATHEMATICS
- 40% should involve numerical calculations
- Cover algebra, geometry, trigonometry, and calculus
- Include word problems and real-world applications
- Test problem-solving and analytical skills`;
    }
    
    if (s.includes('physics')) {
      return `DOMAIN: PHYSICS
- 40% should involve calculations and formulas
- Cover mechanics, electricity, waves, and modern physics
- Include practical applications and real-world scenarios
- Test understanding of concepts and problem-solving`;
    }
    
    if (s.includes('chemistry')) {
      return `DOMAIN: CHEMISTRY
- 40% should involve calculations (moles, equations, etc.)
- Cover organic, inorganic, and physical chemistry
- Include practical applications and reactions
- Test understanding of concepts and numerical reasoning`;
    }
    
    if (s.includes('biology')) {
      return `DOMAIN: BIOLOGY
- Focus on life processes, ecology, genetics, and anatomy
- Include diagrams and practical scenarios where applicable
- Test comprehension and application of biological concepts
- Cover both plant and animal biology`;
    }
    
    if (s.includes('economics')) {
      return `DOMAIN: ECONOMICS
- Focus on micro and macroeconomics concepts
- Include practical applications and real-world scenarios
- Test understanding of economic principles and theories
- Cover production, consumption, and market systems`;
    }
    
    if (s.includes('commerce') || s.includes('accounting')) {
      return `DOMAIN: COMMERCE/ACCOUNTING
- Focus on business concepts, accounting principles
- Include practical business scenarios
- Test understanding of financial concepts
- Cover trade, business operations, and bookkeeping`;
    }
    
    if (s.includes('government') || s.includes('civic')) {
      return `DOMAIN: GOVERNMENT/CIVIC EDUCATION
- Focus on political systems, democracy, and governance
- Include Nigerian government structure and constitution
- Test understanding of political concepts and institutions
- Cover rights, duties, and political participation`;
    }
    
    if (s.includes('literature')) {
      return `DOMAIN: LITERATURE
- Focus on literary devices, themes, and analysis
- Include questions on prose, drama, and poetry
- Test comprehension and interpretation skills
- Cover African and non-African literature`;
    }
    
    if (s.includes('geography')) {
      return `DOMAIN: GEOGRAPHY
- Cover physical and human geography
- Include map reading and spatial analysis
- Test understanding of geographical concepts
- Cover landforms, climate, and environmental issues`;
    }
    
    // Default fallback for any other subject
    return `DOMAIN: ${subject.toUpperCase()}
Generate well-structured academic examination questions that test:
- Comprehension and understanding
- Application of concepts
- Analytical and critical thinking skills`;
  }

  /**
   * 🧹 CLEAN AND PARSE JSON
   * Extracts and parses JSON from AI response
   */
  cleanAndParseJSON(text) {
    // Remove markdown code blocks
    let cleaned = text.replace(/```json/g, '').replace(/```/g, '');
    
    // Find JSON array boundaries
    const firstBracket = cleaned.indexOf('[');
    const lastBracket = cleaned.lastIndexOf(']');
    
    if (firstBracket === -1) {
      // No array found, check if it's a single object
      return cleaned.trim().startsWith('{') ? [JSON.parse(cleaned)] : [];
    }
    
    // Extract the JSON array
    cleaned = cleaned.substring(firstBracket, lastBracket + 1);
    
    try {
      return JSON.parse(cleaned);
    } catch (e) {
      console.error('❌ JSON Parse Error:', e.message);
      
      // Try to fix common JSON issues with control characters
      try {
        // Replace problematic control characters in strings
        const fixed = cleaned
          .replace(/\n/g, '\\n')    // Escape newlines
          .replace(/\r/g, '\\r')    // Escape carriage returns
          .replace(/\t/g, '\\t')    // Escape tabs
          .replace(/\f/g, '\\f')    // Escape form feeds
          .replace(/\b/g, '\\b');   // Escape backspaces
        
        return JSON.parse(fixed);
      } catch (e2) {
        console.error('❌ JSON Fix Failed:', e2.message);
        return [];
      }
    }
  }

  /**
   * 🎓 GENERATE QUESTIONS FROM DOCUMENT CONTENT
   * Generates questions based on actual document content
   * 
   * @param {Object} params - Generation parameters
   * @param {string} params.content - The actual document text content
   * @param {string} params.subject - Subject/domain for categorization
   * @param {string} params.topic - Specific topic/document title
   * @param {string} params.difficulty - Difficulty level (easy/medium/hard)
   * @param {number} params.totalQuestions - Total number of questions to generate
   * @returns {Promise<Array>} Array of question objects
   */
  async generateQuestionsFromContent(params) {
    const { 
      content,
      subject, 
      topic, 
      difficulty = 'hard', 
      totalQuestions = 45 
    } = params;
    
    // 🔒 VALIDATION
    if (!content || content.length < 10) {
      throw new Error('Document content is required and must be at least 10 characters');
    }

    // Log the request for debugging
    console.log('📝 Question Generation from Content:', {
      contentLength: content.length,
      subject,
      topic,
      difficulty,
      totalQuestions
    });
    
    // Truncate content if too long (Gemini has token limits)
    const MAX_CONTENT_LENGTH = 30000; // ~7500 words
    const truncatedContent = content.length > MAX_CONTENT_LENGTH 
      ? content.substring(0, MAX_CONTENT_LENGTH) + '...' 
      : content;
    
    console.log(`📄 Using ${truncatedContent.length} characters of content`);
    
    // "STUDENT SAVER" BATCHING (5 questions per batch to avoid rate limits)
    const BATCH_SIZE = 5; 
    const batchesNeeded = Math.ceil(totalQuestions / BATCH_SIZE);
    let allQuestions = [];

    // 1. Resolve the correct model name
    const modelName = await this.getBestModelName();

    console.log(`🤖 [AI EXAMINER] Generating ${totalQuestions} questions from document using ${modelName}...`);

    const model = this.genAI.getGenerativeModel({ 
      model: modelName,
      generationConfig: { 
        responseMimeType: "application/json",
        temperature: 0.7,
      }
    });

    // 2. Generate questions in batches
    for (let i = 0; i < batchesNeeded; i++) {
      const remaining = totalQuestions - allQuestions.length;
      const currentBatchSize = Math.min(BATCH_SIZE, remaining);
      
      const prompt = `
ACT AS: Expert Examination Designer

TASK: Analyze the provided document content and generate ${currentBatchSize} ${difficulty}-level multiple choice questions.

DOCUMENT CONTENT:
${truncatedContent}

SUBJECT/TOPIC: ${topic || subject || 'General Knowledge'}

${this.getDomainInstructions(subject)}

CRITICAL REQUIREMENTS:
1. Questions MUST be based ONLY on the content provided above
2. Each question must test comprehension of specific information from the document
3. All 4 options (A, B, C, D) must be plausible based on the document
4. Only ONE option should be correct
5. Difficulty level: ${difficulty}
6. Include brief explanations that reference the document content

STRICTLY RETURN A JSON ARRAY IN THIS EXACT FORMAT:
[
  {
    "question": "Question text based on document content",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "answer": "Correct option letter (A/B/C/D)",
    "explanation": "Brief explanation referencing the document"
  }
]

Generate exactly ${currentBatchSize} questions now based on the document content above.
      `.trim();

      try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const batchData = this.cleanAndParseJSON(response.text());
        
        if (Array.isArray(batchData) && batchData.length > 0) {
          // Validate each question has required fields
          const validQuestions = batchData.filter(q => 
            q.question && 
            Array.isArray(q.options) && 
            q.options.length === 4 && 
            q.answer &&
            q.explanation
          );
          
          allQuestions = [...allQuestions, ...validQuestions];
          console.log(`   ✅ Batch ${i + 1}/${batchesNeeded} success (${validQuestions.length} valid questions)`);
        } else {
          console.warn(`   ⚠️ Batch ${i + 1} returned empty or invalid data.`);
        }

        // SAFETY DELAY: 5 seconds between requests to avoid 429 errors
        if (i < batchesNeeded - 1) {
          console.log("   ⏳ Waiting 5s (Rate Limit Safety)...");
          await new Promise(r => setTimeout(r, 5000));
        }

      } catch (error) {
        console.error(`   ❌ Batch ${i + 1} failed:`, error.message);
        
        // Handle rate limiting with exponential backoff
        if (error.message.includes('429') || error.message.includes('quota')) {
          console.log("   🛑 Rate Limit hit. Pausing for 60 seconds...");
          await new Promise(r => setTimeout(r, 60000));
          i--; // Retry this batch
        } else if (error.message.includes('500') || error.message.includes('503')) {
          // Server error - wait and retry
          console.log("   🛑 Server error. Waiting 30 seconds before retry...");
          await new Promise(r => setTimeout(r, 30000));
          i--; // Retry this batch
        }
        // For other errors, continue to next batch
      }
    }

    // 3. Validate final results
    if (allQuestions.length === 0) {
      throw new Error("Failed to generate any questions from document content. Please try again.");
    }

    console.log(`✅ Successfully generated ${allQuestions.length} questions from document`);
    
    // Return exactly the requested number (in case we got extras)
    return allQuestions.slice(0, totalQuestions);
  }

  /**
   * 🎓 GENERATE QUESTIONS (Legacy method for backward compatibility)
   * Main method to generate examination questions
   * 
   * @param {Object} params - Generation parameters
   * @param {string} params.subject - Subject/domain for questions
   * @param {string} params.topic - Specific topic to focus on
   * @param {string} params.difficulty - Difficulty level (easy/medium/hard)
   * @param {number} params.totalQuestions - Total number of questions to generate
   * @returns {Promise<Array>} Array of question objects
   */
  async generateQuestions(params) {
    const { 
      subject, 
      topic, 
      difficulty = 'hard', 
      totalQuestions = 45 
    } = params;
    
    // 🔒 VALIDATION: Ensure required parameters are present
    if (!subject) {
      throw new Error('Subject is required for question generation');
    }
    
    if (!topic) {
      throw new Error('Topic is required for question generation');
    }

    // Log the request for debugging
    console.log('📝 Question Generation Request:', {
      subject,
      topic,
      difficulty,
      totalQuestions
    });
    
    // "STUDENT SAVER" BATCHING (5 questions per batch to avoid rate limits)
    const BATCH_SIZE = 5; 
    const batchesNeeded = Math.ceil(totalQuestions / BATCH_SIZE);
    let allQuestions = [];

    // 1. Resolve the correct model name
    const modelName = await this.getBestModelName();

    console.log(`🤖 [JAMB SIMULATOR] Generating ${totalQuestions} questions using ${modelName}...`);

    const model = this.genAI.getGenerativeModel({ 
      model: modelName,
      generationConfig: { 
        responseMimeType: "application/json",
        temperature: 0.7, // Add some creativity while maintaining accuracy
      }
    });

    // 2. Generate questions in batches
    for (let i = 0; i < batchesNeeded; i++) {
      const remaining = totalQuestions - allQuestions.length;
      const currentBatchSize = Math.min(BATCH_SIZE, remaining);
      
      const prompt = `
ACT AS: JAMB Chief Examiner with 20+ years of experience.

TASK: Generate ${currentBatchSize} ${difficulty}-level multiple choice questions for ${subject}.

TOPIC: ${topic}

${this.getDomainInstructions(subject)}

REQUIREMENTS:
1. Each question must be clear, unambiguous, and grammatically correct
2. All options (A, B, C, D) must be plausible but only ONE correct
3. Avoid "All of the above" or "None of the above" options
4. Difficulty level: ${difficulty}
5. Include brief explanations for the correct answers

STRICTLY RETURN A JSON ARRAY IN THIS EXACT FORMAT:
[
  {
    "question": "Question text here",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "answer": "Correct option letter (A/B/C/D)",
    "explanation": "Brief explanation of why this answer is correct"
  }
]

Generate exactly ${currentBatchSize} questions now.
      `.trim();

      try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const batchData = this.cleanAndParseJSON(response.text());
        
        if (Array.isArray(batchData) && batchData.length > 0) {
          // Validate each question has required fields
          const validQuestions = batchData.filter(q => 
            q.question && 
            Array.isArray(q.options) && 
            q.options.length === 4 && 
            q.answer &&
            q.explanation
          );
          
          allQuestions = [...allQuestions, ...validQuestions];
          console.log(`   ✅ Batch ${i + 1}/${batchesNeeded} success (${validQuestions.length} valid questions)`);
        } else {
          console.warn(`   ⚠️ Batch ${i + 1} returned empty or invalid data.`);
        }

        // SAFETY DELAY: 5 seconds between requests to avoid 429 errors
        if (i < batchesNeeded - 1) {
          console.log("   ⏳ Waiting 5s (Rate Limit Safety)...");
          await new Promise(r => setTimeout(r, 5000));
        }

      } catch (error) {
        console.error(`   ❌ Batch ${i + 1} failed:`, error.message);
        
        // Handle rate limiting with exponential backoff
        if (error.message.includes('429') || error.message.includes('quota')) {
          console.log("   🛑 Rate Limit hit. Pausing for 60 seconds...");
          await new Promise(r => setTimeout(r, 60000));
          i--; // Retry this batch
        } else if (error.message.includes('500') || error.message.includes('503')) {
          // Server error - wait and retry
          console.log("   🛑 Server error. Waiting 30 seconds before retry...");
          await new Promise(r => setTimeout(r, 30000));
          i--; // Retry this batch
        }
        // For other errors, continue to next batch
      }
    }

    // 3. Validate final results
    if (allQuestions.length === 0) {
      throw new Error("Failed to generate any questions. Please try again or check your API quota.");
    }

    console.log(`✅ Successfully generated ${allQuestions.length} questions`);
    
    // Return exactly the requested number (in case we got extras)
    return allQuestions.slice(0, totalQuestions);
  }
}

module.exports = new GeminiService();