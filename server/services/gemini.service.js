class GeminiService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    if (!this.apiKey) console.error('⚠️ GEMINI_API_KEY not found in environment variables');
    this.baseUrl = "https://generativelanguage.googleapis.com/v1beta";
  }

  /**
   * Selects the best available model (Flash 1.5 is prioritized for speed/cost)
   */
  async getValidModel() {
    try {
      const response = await fetch(`${this.baseUrl}/models?key=${this.apiKey}`);
      const data = await response.json();
      
      if (!data.models) {
        return "models/gemini-1.5-flash"; 
      }

      const viable = data.models.filter(m => m.supportedGenerationMethods?.includes("generateContent"));
      
      // Priority: Flash 1.5 -> Pro 1.5 -> Any
      let chosen = viable.find(m => m.name.includes("gemini-1.5-flash"));
      if (!chosen) chosen = viable.find(m => m.name.includes("gemini-1.5-pro"));
      if (!chosen) chosen = viable[0];

      return chosen ? chosen.name : "models/gemini-1.5-flash";
    } catch (error) {
      return "models/gemini-1.5-flash"; 
    }
  }

  /**
   * ROBUST JSON CLEANER
   * Fixes "Bad control character", "SyntaxError", and "500 Internal Server Error" crashes.
   */
  cleanAndParseJSON(text) {
    if (!text) throw new Error("Empty response from AI");

    // 1. Remove Markdown code blocks
    let cleaned = text.replace(/```json/g, '').replace(/```/g, '');

    // 2. Extract strictly the Array [...] part
    const firstBracket = cleaned.indexOf('[');
    const lastBracket = cleaned.lastIndexOf(']');
    
    if (firstBracket === -1 || lastBracket === -1) {
      if (cleaned.trim().startsWith('{')) return [JSON.parse(cleaned)];
      throw new Error("AI did not return a valid JSON structure.");
    }

    cleaned = cleaned.substring(firstBracket, lastBracket + 1);

    // 3. Attempt Standard Parse
    try {
      return JSON.parse(cleaned);
    } catch (e) {
      console.warn("⚠️ Standard JSON parse failed. Attempting strict cleanup...");
      
      // 4. Fix formatting issues (newlines inside strings)
      cleaned = cleaned
        .replace(/(?:\r\n|\r|\n)/g, ' ') // Replace all hard newlines with spaces
        .replace(/\s+/g, ' '); // Collapse multiple spaces

      try {
        return JSON.parse(cleaned);
      } catch (finalError) {
        console.error("❌ Final JSON Parse Error. Raw Text:", text);
        throw new Error(`Failed to parse AI response. The AI generated invalid JSON.`);
      }
    }
  }

  /**
   * GENERATE QUESTIONS (High Educational Standard)
   */
  async generateQuestions(text, options = {}) {
    const { questionCount = 10, difficulty = 'medium', questionTypes = ['multiple-choice'] } = options;
    
    if (!text || text.length < 10) throw new Error("Text is too short to generate questions.");
    
    const processedText = text.substring(0, 30000); 
    const modelName = await this.getValidModel();
    const url = `${this.baseUrl}/${modelName}:generateContent?key=${this.apiKey}`;

    const promptText = `
    ROLE: Act as an expert University Professor and Examiner.
    TASK: Create a rigorous exam based strictly on the provided text.
    
    TARGET AUDIENCE: Students who need to master this subject.
    DIFFICULTY: ${difficulty} (Adjust complexity of logic, not just obscure facts).
    
    INSTRUCTIONS FOR QUALITY:
    1. **Deep Understanding:** Do not ask surface-level questions. Ask "How", "Why", and "Analyze".
    2. **Plausible Distractors:** For Multiple Choice, wrong options must be realistic misconceptions.
    3. **Educational Explanations:** The 'explanation' field is CRITICAL. It must be a mini-lesson explaining WHY the answer is correct.
    
    REQUIRED QUESTION TYPES:
    ${questionTypes.join(', ')}
    
    SOURCE MATERIAL:
    """
    ${processedText}
    """
    
    OUTPUT FORMAT:
    Return a RAW JSON Array of objects. No Markdown. No conversational text.
    
    CRITICAL SYNTAX RULES:
    - Do NOT use real newlines inside strings.
    - Escape all quotes properly.
    
    JSON STRUCTURE PER QUESTION:
    {
      "type": "multiple-choice" | "true-false" | "fill-in-blank" | "flashcard",
      "question": "The question text",
      "options": ["A", "B", "C", "D"] (Required for MC/TrueFalse),
      "correct_answer": "Exact string matching one option",
      "explanation": "Detailed pedagogical explanation (mini-lesson)",
      "difficulty": "${difficulty}"
    }
    
    Generate exactly ${questionCount} questions.
    `;

    const payload = {
      contents: [{ parts: [{ text: promptText }] }],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 8192,
        responseMimeType: "application/json"
      }
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error?.message || response.statusText);
      }

      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      return this.cleanAndParseJSON(rawText);

    } catch (error) {
      console.error('AI Service Error:', error);
      throw error;
    }
  }

  /**
   * VALIDATE ANSWER (Grading)
   */
  async validateAnswer(userAnswer, correctAnswer, question) {
    const modelName = await this.getValidModel();
    const url = `${this.baseUrl}/${modelName}:generateContent?key=${this.apiKey}`;

    const prompt = `
    Context: Educational Grading.
    Question: "${question}"
    Correct Answer: "${correctAnswer}"
    Student Answer: "${userAnswer}"

    Task: Determine if the Student Answer is semantically correct.
    
    Output JSON: { "isCorrect": boolean, "feedback": "string", "issues": ["string"] }
    `;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { 
            temperature: 0.1, 
            responseMimeType: "application/json" 
          }
        })
      });

      if (!response.ok) throw new Error('AI validation failed');

      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      return this.cleanAndParseJSON(rawText);
      
    } catch (error) {
      console.error('Validation error:', error);
      return { isCorrect: false, feedback: "Could not validate answer automatically.", issues: ["AI Error"] };
    }
  }
}

module.exports = new GeminiService();