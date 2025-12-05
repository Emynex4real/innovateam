import api from '../config/api';

export class AIQuestionsService {
  static async generateQuestions(data) {
    const response = await api.post('/admin/ai-questions/generate', data);
    return response.data;
  }

  static async getQuestionBanks() {
    const response = await api.get('/admin/ai-questions/banks');
    return response.data;
  }

  static async getQuestionsByBank(bankId) {
    const response = await api.get(`/admin/ai-questions/banks/${bankId}/questions`);
    return response.data;
  }

  static async updateQuestion(id, data) {
    const response = await api.put(`/admin/ai-questions/questions/${id}`, data);
    return response.data;
  }

  static async deleteQuestion(id) {
    const response = await api.delete(`/admin/ai-questions/questions/${id}`);
    return response.data;
  }

  static async deleteQuestionBank(id) {
    const response = await api.delete(`/admin/ai-questions/banks/${id}`);
    return response.data;
  }

  static async bulkDeleteQuestions(questionIds) {
    const response = await api.post('/admin/ai-questions/questions/bulk-delete', { questionIds });
    return response.data;
  }

  static async toggleQuestionStatus(id) {
    const response = await api.patch(`/admin/ai-questions/questions/${id}/toggle`);
    return response.data;
  }

  static async getQuestionStats() {
    const response = await api.get('/admin/ai-questions/stats');
    return response.data;
  }
}

export default AIQuestionsService;
