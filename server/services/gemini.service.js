class GeminiService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    if (!this.apiKey) console.error('⚠️ GEMINI_API_KEY not found');
    this.baseUrl = "https://generativelanguage.googleapis.com/v1beta";
  }

  async getValidModel() {
    try {
      const response = await fetch(`${this.baseUrl}/models?key=${this.apiKey}`);
      const data = await response.json();
      if (!data.models) throw new Error("No models found.");

      const viable = data.models.filter(m => m.supportedGenerationMethods?.includes("generateContent"));
      if (viable.length === 0) throw new Error("No generative models available.");

      // Priority: Flash -> Pro -> Any
      let chosen = viable.find(m => m.name.includes("gemini-1.5-flash"));
      if (!chosen) chosen = viable.find(m => m.name.includes("gemini-1.5-pro"));
      if (!chosen) chosen = viable[0];

      return chosen.name;
    } catch (error) {
      return "models/gemini-pro"; // Backup
    }
  }

  async generateQuestions(text, options = {}) {
    const { questionCount = 10, difficulty = 'medium' } = options;
    if (!text || text.length < 10) throw new Error("Text too short.");

    const modelName = await this.getValidModel();
    const url = `${this.baseUrl}/${modelName}:generateContent?key=${this.apiKey}`;

    const promptText = `You are an expert educator. Generate exactly ${questionCount} exam questions.
    TEXT: ${text.substring(0, 30000)}
    
    OUTPUT: Valid JSON Array only. No Markdown.
    [{"type":"multiple-choice","question":"...","options":["A","B"],"correct_answer":"A","explanation":"..."}]`;

    const isModern = modelName.includes("1.5");
    
    const payload = {
      contents: [{ parts: [{ text: promptText }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 8192,
        ...(isModern ? { responseMimeType: "application/json" } : {})
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
      let responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!responseText) throw new Error("Empty response from AI");

      responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(responseText);

    } catch (error) {
      console.error('AI Service Error:', error);
      throw new Error(`AI Generation Failed: ${error.message}`);
    }
  }
}

module.exports = new GeminiService();