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
    const { questionCount = 10, difficulty = 'medium', questionTypes = ['multiple-choice'] } = options;
    if (!text || text.length < 10) throw new Error("Text too short.");

    const modelName = await this.getValidModel();
    const url = `${this.baseUrl}/${modelName}:generateContent?key=${this.apiKey}`;

    const typeInstructions = questionTypes.map(type => {
      if (type === 'multiple-choice') return 'Multiple choice with 4 options (A, B, C, D)';
      if (type === 'true-false') return 'True/False questions with options ["True", "False"]';
      if (type === 'fill-in-blank') return 'Fill in the blank with the answer as correct_answer';
      if (type === 'flashcard') return 'Flashcard with question and answer (no options needed)';
      return 'Multiple choice';
    }).join(', ');

    const questionsPerType = Math.ceil(questionCount / questionTypes.length);
    const typeExamples = questionTypes.map(type => {
      if (type === 'multiple-choice') return `{"type":"multiple-choice","question":"What is X?","options":["A","B","C","D"],"correct_answer":"A","explanation":"..."}`;
      if (type === 'true-false') return `{"type":"true-false","question":"Statement is correct?","options":["True","False"],"correct_answer":"True","explanation":"..."}`;
      if (type === 'fill-in-blank') return `{"type":"fill-in-blank","question":"The capital is ___","correct_answer":"Paris","explanation":"..."}`;
      if (type === 'flashcard') return `{"type":"flashcard","question":"Define X?","correct_answer":"X is...","explanation":"..."}`;
    }).join(',\n');

    const promptText = `Generate exactly ${questionCount} exam questions from this text.

REQUIREMENTS:
- Difficulty: ${difficulty}
- Question types to use: ${questionTypes.join(', ')}
- Generate approximately ${questionsPerType} questions for EACH type
- Mix the question types in the output

TEXT:
${text.substring(0, 30000)}

OUTPUT FORMAT (Valid JSON Array ONLY, no markdown):
[
${typeExamples}
]

IMPORTANT:
- For multiple-choice: Include 4 options ["A","B","C","D"]
- For true-false: Include options ["True","False"]
- For fill-in-blank: No options, just correct_answer
- For flashcard: No options, just correct_answer
- MUST include "type" field for each question
- Generate ${questionCount} questions total`;}

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