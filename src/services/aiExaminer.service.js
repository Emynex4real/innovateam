import api from './api.service';

const aiExaminerService = {
  // 1. Upload File
  uploadDocument: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      // FIX: Return the WHOLE response, don't strip .data
      const response = await api.post('/api/ai-examiner/upload', formData);
      return response; 
    } catch (error) {
      if (error.response && error.response.status === 404) {
         const retry = await api.post('/ai-examiner/upload', formData);
         return retry;
      }
      throw error.response?.data || error;
    }
  },

  // 2. Submit Text
  submitText: async (text, title) => {
    try {
      // FIX: Return 'response', NOT 'response.data'
      const response = await api.post('/api/ai-examiner/submit-text', { text, title });
      return response;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        const retry = await api.post('/ai-examiner/submit-text', { text, title });
        return retry;
      }
      throw error.response?.data || error;
    }
  },

  // 3. Generate Questions
  generateQuestions: async (documentId, options) => {
    try {
      // FIX: Return 'response', NOT 'response.data'
      const response = await api.post('/api/ai-examiner/generate', { documentId, ...options });
      return response;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        const retry = await api.post('/ai-examiner/generate', { documentId, ...options });
        return retry;
      }
      throw error.response?.data || error;
    }
  },

  // 4. Submit Answers
  submitAnswers: async (examId, answers) => {
    try {
      // FIX: Return 'response', NOT 'response.data'
      const response = await api.post(`/api/ai-examiner/submit/${examId}`, { answers });
      return response;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        const retry = await api.post(`/ai-examiner/submit/${examId}`, { answers });
        return retry;
      }
      throw error.response?.data || error;
    }
  },
  
  // 5. History
  getExamHistory: async () => {
    try {
      const response = await api.get('/api/ai-examiner/history');
      return response;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        const retry = await api.get('/ai-examiner/history');
        return retry;
      }
      throw error.response?.data || error;
    }
  }
};

export default aiExaminerService;