import apiService from './api.service';

class AIExaminerService {
  async uploadDocument(file) {
    try {
      const formData = new FormData();
      formData.append('document', file);
      
      const response = await apiService.post('/ai-examiner/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to upload document');
    }
  }

  async generateQuestions(options) {
    try {
      const response = await apiService.post('/ai-examiner/generate', options);
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to generate questions');
    }
  }

  async submitAnswers(examId, answers) {
    try {
      const response = await apiService.post(`/ai-examiner/submit/${examId}`, { answers });
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to submit answers');
    }
  }

  async getExamHistory() {
    try {
      const response = await apiService.get('/ai-examiner/history');
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get exam history');
    }
  }

  async getExamResults(examId) {
    try {
      const response = await apiService.get(`/ai-examiner/results/${examId}`);
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get exam results');
    }
  }
}

const aiExaminerService = new AIExaminerService();
export default aiExaminerService;