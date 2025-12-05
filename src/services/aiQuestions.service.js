import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const getAuthHeaders = () => {
  const token = localStorage.getItem('jamb_auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

export class AIQuestionsService {
  static async generateQuestions(data) {
    const response = await axios.post(`${API_BASE_URL}/api/admin/ai-questions/generate`, data, { headers: getAuthHeaders() });
    return response.data;
  }

  static async getQuestionBanks() {
    const response = await axios.get(`${API_BASE_URL}/api/admin/ai-questions/banks`, { headers: getAuthHeaders() });
    return response.data;
  }

  static async getQuestionsByBank(bankId) {
    const response = await axios.get(`${API_BASE_URL}/api/admin/ai-questions/banks/${bankId}/questions`, { headers: getAuthHeaders() });
    return response.data;
  }

  static async updateQuestion(id, data) {
    const response = await axios.put(`${API_BASE_URL}/api/admin/ai-questions/questions/${id}`, data, { headers: getAuthHeaders() });
    return response.data;
  }

  static async deleteQuestion(id) {
    const response = await axios.delete(`${API_BASE_URL}/api/admin/ai-questions/questions/${id}`, { headers: getAuthHeaders() });
    return response.data;
  }

  static async deleteQuestionBank(id) {
    const response = await axios.delete(`${API_BASE_URL}/api/admin/ai-questions/banks/${id}`, { headers: getAuthHeaders() });
    return response.data;
  }

  static async bulkDeleteQuestions(questionIds) {
    const response = await axios.post(`${API_BASE_URL}/api/admin/ai-questions/questions/bulk-delete`, { questionIds }, { headers: getAuthHeaders() });
    return response.data;
  }

  static async toggleQuestionStatus(id) {
    const response = await axios.patch(`${API_BASE_URL}/api/admin/ai-questions/questions/${id}/toggle`, {}, { headers: getAuthHeaders() });
    return response.data;
  }

  static async getQuestionStats() {
    const response = await axios.get(`${API_BASE_URL}/api/admin/ai-questions/stats`, { headers: getAuthHeaders() });
    return response.data;
  }
}

export default AIQuestionsService;
