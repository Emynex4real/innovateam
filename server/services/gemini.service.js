const { GoogleGenerativeAI } = require("@google/generative-ai");

class GeminiService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    if (!this.apiKey) console.error('⚠️ GEMINI_API_KEY not found');
    this.genAI = new GoogleGenerativeAI(this.apiKey);
    this.cachedModelName = null;
  }

  /**
   * 🔍 DYNAMIC MODEL FINDER (The Fix)
   * This uses the exact logic from your successful test script.
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

  getDomainInstructions(subject) {
    const s = subject.toLowerCase();
    if (s.includes('english')) return `DOMAIN: JAMB USE OF ENGLISH. Include Lexis, Structure, Oral English.`;
    if (['physics', 'chemistry', 'math'].some(x => s.includes(x))) return `DOMAIN: SCIENCES. 40% Calculations.`;
    return `DOMAIN: GENERAL ACADEMIC.`;
  }

  cleanAndParseJSON(text) {
    let cleaned = text.replace(/```json/g, '').replace(/```/g, '');
    const firstBracket = cleaned.indexOf('[');
    const lastBracket = cleaned.lastIndexOf(']');
    if (firstBracket === -1) return cleaned.trim().startsWith('{') ? [JSON.parse(cleaned)] : [];
    cleaned = cleaned.substring(firstBracket, lastBracket + 1);
    try { return JSON.parse(cleaned); } catch (e) { return []; }
  }

  async generateQuestions(params) {
    const { subject, topic, difficulty = 'hard', totalQuestions = 45 } = params;
    
    // "STUDENT SAVER" BATCHING (5 questions per batch)
    const BATCH_SIZE = 5; 
    const batchesNeeded = Math.ceil(totalQuestions / BATCH_SIZE);
    let allQuestions = [];

    // 1. Resolve the correct model name
    const modelName = await this.getBestModelName();

    console.log(`🤖 [JAMB SIMULATOR] Generating ${totalQuestions} questions using ${modelName}...`);

    const model = this.genAI.getGenerativeModel({ 
        model: modelName,
        generationConfig: { responseMimeType: "application/json" }
    });

    for (let i = 0; i < batchesNeeded; i++) {
      const remaining = totalQuestions - allQuestions.length;
      const currentBatchSize = Math.min(BATCH_SIZE, remaining);
      
      const prompt = `
        ACT AS: JAMB Chief Examiner.
        TASK: Generate ${currentBatchSize} ${difficulty} questions for ${subject} on "${topic}".
        ${this.getDomainInstructions(subject)}
        STRICTLY RETURN JSON ARRAY: [{ "question": "...", "options": ["A","B","C","D"], "answer": "...", "explanation": "..." }]
      `;

      try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const batchData = this.cleanAndParseJSON(response.text());
        
        if (Array.isArray(batchData) && batchData.length > 0) {
          allQuestions = [...allQuestions, ...batchData];
          console.log(`   ✅ Batch ${i + 1}/${batchesNeeded} success`);
        } else {
           console.warn(`   ⚠️ Batch ${i + 1} returned empty data.`);
        }

        // SAFETY DELAY: 5 seconds between requests to avoid 429 errors
        if (i < batchesNeeded - 1) {
            console.log("   ⏳ Waiting 5s (Rate Limit Safety)...");
            await new Promise(r => setTimeout(r, 5000));
        }

      } catch (error) {
        console.error(`   ❌ Batch ${i + 1} failed:`, error.message);
        // If we hit a rate limit, wait 60s and retry the batch (simple retry logic)
        if (error.message.includes('429')) {
             console.log("   🛑 Rate Limit hit. Pausing for 60 seconds...");
             await new Promise(r => setTimeout(r, 60000));
             i--; // Retry this batch
        }
      }
    }

    if (allQuestions.length === 0) throw new Error("Failed to generate questions. API might be overloaded.");
    
    return allQuestions;
  }
}

module.exports = new GeminiService();