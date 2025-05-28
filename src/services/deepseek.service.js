import axios from 'axios';

class DeepSeekService {
  constructor() {
    this.apiKey = process.env.REACT_APP_DEEPSEEK_API_KEY;
    this.baseURL = 'https://api.deepseek.ai/v1';
    
    if (!this.apiKey) {
      console.error('DeepSeek API key is not configured. Please check your .env file.');
    }

    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
  }

  async generateResponse(messages) {
    try {
      if (!this.apiKey) {
        throw new Error('DeepSeek API key is not configured. Please check your .env file.');
      }

      const response = await this.client.post('/chat/completions', {
        model: 'deepseek-coder',
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        temperature: 0.7,
        max_tokens: 1000,
        stream: false,
        top_p: 0.95
      });

      if (response.data.choices && response.data.choices.length > 0) {
        return response.data.choices[0].message.content;
      } else {
        throw new Error('No response generated from DeepSeek API');
      }
    } catch (error) {
      console.error('DeepSeek API Error:', error);
      
      if (error.response?.status === 401) {
        throw new Error('Authentication error with DeepSeek. Please check the API key.');
      } else if (error.response?.status === 429) {
        throw new Error('Too many requests to DeepSeek. Please try again in a moment.');
      } else if (error.response?.status >= 500) {
        throw new Error('DeepSeek service is currently experiencing issues. Please try again later.');
      }
      
      throw new Error('Failed to generate response: ' + (error.response?.data?.error?.message || error.message));
    }
  }

  async generateCourseRecommendations(waecGrades, jambScore, interests) {
    const prompt = `Based on the following student information:
WAEC Grades: ${JSON.stringify(waecGrades)}
JAMB Score: ${jambScore}
Interests and Career Goals: ${interests}

Please provide detailed course recommendations considering:
1. The student's academic performance
2. Their JAMB score
3. Their stated interests and career goals
4. Potential career paths
5. Universities that offer these courses

Format the response in a clear, structured way.`;

    const messages = [
      { role: 'system', content: 'You are a knowledgeable educational advisor specializing in Nigerian university admissions.' },
      { role: 'user', content: prompt }
    ];

    return this.generateResponse(messages);
  }

  async generateQuestions(text) {
    const prompt = `Based on the following text, generate comprehensive study questions that test understanding:

${text}

Please generate:
1. Multiple choice questions
2. Short answer questions
3. Discussion questions

Format the questions clearly and include answers where appropriate.`;

    const messages = [
      { role: 'system', content: 'You are an experienced educator specializing in creating educational assessments.' },
      { role: 'user', content: prompt }
    ];

    return this.generateResponse(messages);
  }
}

const deepseekService = new DeepSeekService();
export default deepseekService; 