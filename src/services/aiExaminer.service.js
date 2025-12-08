import api from './api.service';

const aiExaminerService = {
  // 1. Upload File
  uploadDocument: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      console.log('📤 Uploading file:', file.name);
      const response = await api.post('/api/ai-examiner/upload', formData, {
        timeout: 300000
      });
      console.log('✅ Upload response:', response);
      return response;
    } catch (error) {
      console.error('❌ Upload error:', error);
      throw error;
    }
  },

  // 2. Submit Text
  submitText: async (text, title) => {
    try {
      console.log('📝 Submitting text:', title);
      console.log('📝 Text length:', text.length);
      const response = await api.post('/api/ai-examiner/submit-text', { text, title });
      console.log('✅ Text submit response:', response);
      console.log('✅ Response success:', response?.success);
      console.log('✅ Response data:', response?.data);
      return response;
    } catch (error) {
      console.error('❌ Text submit error:', error);
      console.error('❌ Error details:', error.message, error.stack);
      throw error;
    }
  },

  // 3. Generate Questions
  generateQuestions: async (documentId, options) => {
    try {
      console.log('🤖 Generating questions for:', documentId);
      const response = await api.post('/api/ai-examiner/generate', { documentId, ...options });
      console.log('✅ Generate response:', response);
      return response;
    } catch (error) {
      console.error('❌ Generate error:', error);
      throw error;
    }
  },

  // 4. Submit Answers
  submitAnswers: async (examId, answers) => {
    try {
      console.log('📊 Submitting answers for exam:', examId);
      const response = await api.post(`/api/ai-examiner/submit/${examId}`, { answers });
      console.log('✅ Submit response:', response);
      return response;
    } catch (error) {
      console.error('❌ Submit error:', error);
      throw error;
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