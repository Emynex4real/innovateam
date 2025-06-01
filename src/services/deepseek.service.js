import axios from 'axios';

class DeepSeekService {
  constructor() {
    console.log('Environment variables:', {
      REACT_APP_DEEPSEEK_API_KEY: process.env.REACT_APP_DEEPSEEK_API_KEY,
      NODE_ENV: process.env.NODE_ENV
    });
    
    this.apiKey = process.env.REACT_APP_DEEPSEEK_API_KEY;
    
    // Use proxy in development, direct URL in production
    this.baseURL = process.env.NODE_ENV === 'development' 
      ? '/api/deepseek' 
      : 'https://api.deepseek.ai/v1';
    
    if (!this.apiKey) {
      console.error('DeepSeek API key is not configured. Please check your .env file.');
    }

    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 30000,
      validateStatus: function (status) {
        return status >= 200 && status < 500;
      },
      // Remove withCredentials since we're using a proxy
      withCredentials: false
    });

    this.client.interceptors.request.use(
      config => {
        // Add API key to headers for each request
        config.headers['Authorization'] = `Bearer ${this.apiKey}`;
        
        // Log request details
        console.log('Making API request with key:', this.apiKey);
        console.log('To URL:', config.url);
        return config;
      },
      error => {
        console.error('Request error:', error);
        return Promise.reject(error);
      }
    );

    this.client.interceptors.response.use(
      response => {
        // Log successful response
        console.log('Response received:', {
          status: response.status,
          headers: response.headers
        });
        return response;
      },
      error => {
        console.error('Response error:', error);
        
        // Network errors
        if (!error.response) {
          if (error.code === 'ECONNABORTED') {
            throw new Error('Request timed out. Please try again.');
          }
          if (error.code === 'ERR_NAME_NOT_RESOLVED') {
            throw new Error('Could not connect to DeepSeek API. Please check your internet connection and proxy settings.');
          }
          if (error.code === 'ERR_NETWORK') {
            throw new Error('Network error. Please check your internet connection and proxy settings.');
          }
          throw new Error('Network error: ' + error.message);
        }

        // HTTP errors
        if (error.response.status === 401) {
          throw new Error('Authentication failed. Please check your API key.');
        }
        if (error.response.status === 403) {
          throw new Error('Access forbidden. Please check your API key permissions.');
        }
        if (error.response.status === 429) {
          throw new Error('Rate limit exceeded. Please try again later.');
        }
        if (error.response.status >= 500) {
          throw new Error('DeepSeek API server error. Please try again later.');
        }

        return Promise.reject(error);
      }
    );
  }

  async generateResponse(messages) {
    try {
      if (!this.apiKey) {
        throw new Error('DeepSeek API key is not configured. Please check your .env file.');
      }

      // Log the messages being sent
      console.log('Sending messages to DeepSeek API:', messages);

      const response = await this.client.post('/chat/completions', {
        model: 'deepseek-chat',
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        temperature: 0.7,
        max_tokens: 1000,
        stream: false,
        top_p: 0.95
      });

      // Log the response data
      console.log('Received response from DeepSeek API:', {
        status: response.status,
        data: response.data
      });

      if (!response.data) {
        throw new Error('No response data received from DeepSeek API');
      }

      if (!response.data.choices || !response.data.choices.length) {
        throw new Error('No choices received in DeepSeek API response');
      }

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('DeepSeek API Error:', error);
      throw error;
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