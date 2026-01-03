import api from './api';

export const studentTCService = {
  joinCenter: async (accessCode) => {
    const response = await api.post('/tc-enrollments/join', { accessCode });
    return response.data;
  },

  getMyCenters: async () => {
    const response = await api.get('/tc-enrollments/my-centers');
    return response.data;
  },

  getAvailableTests: async (centerId = null) => {
    const response = await api.get('/tc-question-sets', {
      params: centerId ? { center_id: centerId } : {}
    });
    return response.data;
  },

  getTest: async (testId) => {
    const response = await api.get(`/tc-question-sets/${testId}`);
    return response.data;
  },

  submitAttempt: async (data) => {
    const response = await api.post('/tc-attempts/submit', data);
    return response.data;
  },

  getMyAttempts: async (questionSetId = null) => {
    const response = await api.get('/tc-attempts/my-attempts', {
      params: questionSetId ? { question_set_id: questionSetId } : {}
    });
    return response.data;
  },

  getLeaderboard: async (questionSetId) => {
    const response = await api.get(`/tc-attempts/leaderboard/${questionSetId}`);
    return response.data;
  },

  getPublicTests: async () => {
    const response = await api.get('/tc-question-sets/public/all');
    return response.data;
  },

  getAttemptDetails: async (attemptId) => {
    const response = await api.get(`/tc-attempts/details/${attemptId}`);
    return response.data;
  },

  getMyAnalytics: async () => {
    const response = await api.get('/tutorial-centers/analytics/all');
    return response.data;
  },

  getMyAchievements: async () => {
    const response = await api.get('/tutorial-centers/achievements');
    return response.data;
  }
};

export default studentTCService;
