import api from './api';
import requestManager from '../utils/requestManager';
import { isDebugEnabled } from '../config/debug.config';

const API_BASE = '/tutorial-centers';

// Logging helper
const log = (level, message, data = {}) => {
  if (!isDebugEnabled('SERVICE_LAYER')) return;
  const timestamp = new Date().toISOString();
  const emoji = { info: '📘', warn: '⚠️', error: '❌', success: '✅' }[level] || '📝';
  console.log(`${emoji} [TC-SERVICE ${timestamp}] ${message}`, data);
};

export const tutorialCenterService = {
  createCenter: async (data) => {
    log('info', 'createCenter called', { name: data.name });
    try {
      const response = await api.post(API_BASE, data);
      log('success', 'createCenter completed');
      requestManager.clearCache(); // Clear all cache
      return response.data;
    } catch (error) {
      log('error', 'createCenter failed', { error: error.message });
      throw error;
    }
  },

  getMyCenter: async () => {
    log('info', 'getMyCenter called');
    return requestManager.deduplicate(
      'getMyCenter',
      async () => {
        const response = await api.get(`${API_BASE}/my-center`);
        log('success', 'getMyCenter completed');
        return response.data;
      },
      { cache: true, cacheTTL: 10000 } // 10s cache
    );
  },

  updateCenter: async (data) => {
    log('info', 'updateCenter called');
    try {
      const response = await api.put(API_BASE, data);
      log('success', 'updateCenter completed');
      requestManager.clearCache('getMyCenter');
      return response.data;
    } catch (error) {
      log('error', 'updateCenter failed', { error: error.message });
      throw error;
    }
  },

  deleteCenter: async (data) => {
    log('info', 'deleteCenter called');
    try {
      const response = await api.delete(API_BASE, { data });
      log('success', 'deleteCenter completed');
      requestManager.clearCache();
      return response.data;
    } catch (error) {
      log('error', 'deleteCenter failed', { error: error.message });
      throw error;
    }
  },

  getStudents: async () => {
    log('info', 'getStudents called');
    return requestManager.deduplicate(
      'getStudents',
      async () => {
        const response = await api.get(`${API_BASE}/students`);
        log('success', 'getStudents completed', { count: response.data.students?.length });
        return response.data;
      },
      { cache: true, cacheTTL: 15000 } // 15s cache
    );
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
    log('info', 'getQuestions called', { filters });
    const cacheKey = `getQuestions:${JSON.stringify(filters)}`;
    return requestManager.deduplicate(
      cacheKey,
      async () => {
        const response = await api.get(`${API_BASE}/tc-questions`, { params: filters });
        log('success', 'getQuestions completed', { count: response.data.questions?.length });
        return response.data;
      },
      { cache: true, cacheTTL: 20000 } // 20s cache
    );
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
    log('info', 'getQuestionSets called');
    return requestManager.deduplicate(
      'getQuestionSets',
      async () => {
        const response = await api.get(`${API_BASE}/tc-question-sets`);
        log('success', 'getQuestionSets completed', { count: response.data.questionSets?.length });
        return response.data;
      },
      { cache: true, cacheTTL: 15000 } // 15s cache
    );
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
    log('info', 'getCenterAttempts called');
    return requestManager.deduplicate(
      'getCenterAttempts',
      async () => {
        const response = await api.get(`${API_BASE}/tc-attempts/center-attempts`);
        log('success', 'getCenterAttempts completed', { count: response.data.attempts?.length });
        return response.data;
      },
      { cache: true, cacheTTL: 10000 } // 10s cache
    );
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
