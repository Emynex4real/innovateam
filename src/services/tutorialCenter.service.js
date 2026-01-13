import api from './api';

const API_BASE = '/tutorial-centers';

export const tutorialCenterService = {
  createCenter: async (data) => {
    const response = await api.post(API_BASE, data);
    return response.data;
  },

  getMyCenter: async () => {
    const response = await api.get(`${API_BASE}/my-center?t=${Date.now()}`);
    return response.data;
  },

  updateCenter: async (data) => {
    const response = await api.put(API_BASE, data);
    return response.data;
  },

  deleteCenter: async (data) => {
    const response = await api.delete(API_BASE, { data });
    return response.data;
  },

  getStudents: async () => {
    const response = await api.get(`${API_BASE}/students`);
    return response.data;
  },

  createQuestion: async (data) => {
    const response = await api.post(`${API_BASE}/tc-questions`, data);
    return response.data;
  },

  generateQuestionsAI: async (data) => {
    const response = await api.post(`${API_BASE}/tc-questions/generate-ai`, data);
    return response.data;
  },

  parseBulkQuestions: async (data) => {
    const response = await api.post(`${API_BASE}/tc-questions/parse-bulk`, data);
    return response.data;
  },

  saveBulkQuestions: async (questions) => {
    const response = await api.post(`${API_BASE}/tc-questions/save-bulk`, { questions });
    return response.data;
  },

  getQuestions: async (filters = {}) => {
    const response = await api.get(`${API_BASE}/tc-questions`, { params: filters });
    return response.data;
  },

  updateQuestion: async (id, data) => {
    const response = await api.put(`${API_BASE}/tc-questions/${id}`, data);
    return response.data;
  },

  deleteQuestion: async (id) => {
    const response = await api.delete(`${API_BASE}/tc-questions/${id}`);
    return response.data;
  },

  createQuestionSet: async (data) => {
    const response = await api.post(`${API_BASE}/tc-question-sets`, data);
    return response.data;
  },

  getQuestionSets: async () => {
    const response = await api.get(`${API_BASE}/tc-question-sets`);
    return response.data;
  },

  getQuestionSet: async (id) => {
    const response = await api.get(`${API_BASE}/tc-question-sets/${id}`);
    return response.data;
  },

  updateQuestionSet: async (id, data) => {
    const response = await api.put(`${API_BASE}/tc-question-sets/${id}`, data);
    return response.data;
  },

  toggleAnswers: async (id, show_answers) => {
    const response = await api.put(`${API_BASE}/tc-question-sets/${id}/toggle-answers`, { show_answers });
    return response.data;
  },

  deleteQuestionSet: async (id) => {
    const response = await api.delete(`${API_BASE}/tc-question-sets/${id}`);
    return response.data;
  },

  getCenterAttempts: async () => {
    const response = await api.get(`${API_BASE}/tc-attempts/center-attempts`);
    return response.data;
  },

  getLeaderboard: async (questionSetId, filter = 'all') => {
    const response = await api.get(`${API_BASE}/leaderboard/${questionSetId}?filter=${filter}`);
    return response.data;
  },

  getMyAnalytics: async (centerId) => {
    const response = await api.get(`${API_BASE}/analytics/${centerId}`);
    return response.data;
  },

  getAdvancedAnalytics: async (timeRange = 'week') => {
    const response = await api.get(`${API_BASE}/advanced-analytics?timeRange=${timeRange}`);
    return response.data;
  },

  getMyAchievements: async () => {
    const response = await api.get(`${API_BASE}/achievements`);
    return response.data;
  },

  getAllAchievements: async () => {
    const response = await api.get(`${API_BASE}/achievements/all`);
    return response.data;
  },

  getStudentProfile: async (studentId) => {
    const response = await api.get(`${API_BASE}/students/${studentId}/profile`);
    return response.data;
  },

  getStudentTestHistory: async (studentId) => {
    const response = await api.get(`${API_BASE}/students/${studentId}/test-history`);
    return response.data;
  },

  getStudentAnalytics: async (studentId) => {
    const response = await api.get(`${API_BASE}/students/${studentId}/analytics`);
    return response.data;
  },

  getStudentProgress: async (studentId, period = 'month') => {
    const response = await api.get(`${API_BASE}/students/${studentId}/progress?period=${period}`);
    return response.data;
  },

  generateStudentReport: async (studentId, period = 'week') => {
    const response = await api.post(`${API_BASE}/students/${studentId}/report`, { period });
    return response.data;
  },

  getStudentNotes: async (studentId) => {
    const response = await api.get(`${API_BASE}/students/${studentId}/notes`);
    return response.data;
  },

  addStudentNote: async (studentId, note) => {
    const response = await api.post(`${API_BASE}/students/${studentId}/notes`, { note });
    return response.data;
  },

  getStudentAlerts: async () => {
    const response = await api.get(`${API_BASE}/students/alerts/all`);
    return response.data;
  },

  // Question set questions management
  addQuestionsToTest: async (testId, questionIds) => {
    const response = await api.post(`${API_BASE}/tc-question-sets/${testId}/questions`, { question_ids: questionIds });
    return response.data;
  },

  removeQuestionFromTest: async (testId, questionId) => {
    const response = await api.delete(`${API_BASE}/tc-question-sets/${testId}/questions/${questionId}`);
    return response.data;
  },

  getTestQuestions: async (testId) => {
    const response = await api.get(`${API_BASE}/tc-question-sets/${testId}/questions`);
    return response.data;
  },

  getStudentAttempts: async (studentId) => {
    const response = await api.get(`${API_BASE}/students/${studentId}/attempts`);
    return response.data;
  },

  // Adaptive Learning
  checkTestAccess: async (testId) => {
    const response = await api.get(`${API_BASE}/tests/${testId}/access`);
    return response.data;
  },

  getMyMastery: async () => {
    const response = await api.get(`${API_BASE}/mastery`);
    return response.data;
  },

  generateRemedialTest: async (attemptId) => {
    // DEBUG: Uncomment for debugging
    console.log('📡 [SERVICE] generateRemedialTest called', { attemptId });
    
    try {
      const response = await api.post(`${API_BASE}/remedial/generate`, { attempt_id: attemptId });
      console.log('✅ [SERVICE] generateRemedialTest response', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [SERVICE] generateRemedialTest error', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw error;
    }
  },

  // Gamification
  getMyStreak: async (centerId) => {
    const response = await api.get(`${API_BASE}/streak/${centerId}`);
    return response.data;
  },

  getMyLeague: async (centerId) => {
    const response = await api.get(`${API_BASE}/league/${centerId}`);
    return response.data;
  },

  // White Label
  updateTheme: async (theme) => {
    const response = await api.put(`${API_BASE}/theme`, { theme_config: theme });
    return response.data;
  },

  // Check test access (attempt limits)
  checkTestAccess: async (testId) => {
    const response = await api.get(`${API_BASE}/tests/${testId}/check-access`);
    return response.data;
  }
};

export default tutorialCenterService;
