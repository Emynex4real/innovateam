import axios from 'axios';
import supabase from '../lib/supabase';

const API_BASE = 'http://localhost:5000/api';

const getAuthHeader = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return { Authorization: `Bearer ${session?.access_token}` };
};

export const tutorialCenterService = {
  createCenter: async (data) => {
    const response = await axios.post(`${API_BASE}/tutorial-centers`, data, {
      headers: await getAuthHeader()
    });
    return response.data;
  },

  getMyCenter: async () => {
    const response = await axios.get(`${API_BASE}/tutorial-centers/my-center`, {
      headers: await getAuthHeader()
    });
    return response.data;
  },

  updateCenter: async (data) => {
    const response = await axios.put(`${API_BASE}/tutorial-centers`, data, {
      headers: await getAuthHeader()
    });
    return response.data;
  },

  getStudents: async () => {
    const response = await axios.get(`${API_BASE}/tutorial-centers/students`, {
      headers: await getAuthHeader()
    });
    return response.data;
  },

  createQuestion: async (data) => {
    const response = await axios.post(`${API_BASE}/tc-questions`, data, {
      headers: await getAuthHeader()
    });
    return response.data;
  },

  generateQuestionsAI: async (data) => {
    const response = await axios.post(`${API_BASE}/tc-questions/generate-ai`, data, {
      headers: await getAuthHeader()
    });
    return response.data;
  },

  parseBulkQuestions: async (data) => {
    const response = await axios.post(`${API_BASE}/tc-questions/parse-bulk`, data, {
      headers: await getAuthHeader()
    });
    return response.data;
  },

  saveBulkQuestions: async (questions) => {
    const response = await axios.post(`${API_BASE}/tc-questions/save-bulk`, { questions }, {
      headers: await getAuthHeader()
    });
    return response.data;
  },

  getQuestions: async (filters = {}) => {
    const response = await axios.get(`${API_BASE}/tc-questions`, {
      headers: await getAuthHeader(),
      params: filters
    });
    return response.data;
  },

  updateQuestion: async (id, data) => {
    const response = await axios.put(`${API_BASE}/tc-questions/${id}`, data, {
      headers: await getAuthHeader()
    });
    return response.data;
  },

  deleteQuestion: async (id) => {
    const response = await axios.delete(`${API_BASE}/tc-questions/${id}`, {
      headers: await getAuthHeader()
    });
    return response.data;
  },

  createQuestionSet: async (data) => {
    const response = await axios.post(`${API_BASE}/tc-question-sets`, data, {
      headers: await getAuthHeader()
    });
    return response.data;
  },

  getQuestionSets: async () => {
    const response = await axios.get(`${API_BASE}/tc-question-sets`, {
      headers: await getAuthHeader()
    });
    return response.data;
  },

  getQuestionSet: async (id) => {
    const response = await axios.get(`${API_BASE}/tc-question-sets/${id}`, {
      headers: await getAuthHeader()
    });
    return response.data;
  },

  updateQuestionSet: async (id, data) => {
    const response = await axios.put(`${API_BASE}/tc-question-sets/${id}`, data, {
      headers: await getAuthHeader()
    });
    return response.data;
  },

  toggleAnswers: async (id, show_answers) => {
    const response = await axios.put(`${API_BASE}/tc-question-sets/${id}/toggle-answers`, 
      { show_answers }, 
      { headers: await getAuthHeader() }
    );
    return response.data;
  },

  deleteQuestionSet: async (id) => {
    const response = await axios.delete(`${API_BASE}/tc-question-sets/${id}`, {
      headers: await getAuthHeader()
    });
    return response.data;
  },

  getCenterAttempts: async () => {
    const response = await axios.get(`${API_BASE}/tc-attempts/center-attempts`, {
      headers: await getAuthHeader()
    });
    return response.data;
  },

  getLeaderboard: async (questionSetId, filter = 'all') => {
    const response = await axios.get(`${API_BASE}/tutorial-centers/leaderboard/${questionSetId}?filter=${filter}`, {
      headers: await getAuthHeader()
    });
    return response.data;
  },

  getMyAnalytics: async (centerId) => {
    const response = await axios.get(`${API_BASE}/tutorial-centers/analytics/${centerId}`, {
      headers: await getAuthHeader()
    });
    return response.data;
  },

  getAdvancedAnalytics: async (timeRange = 'week') => {
    const response = await axios.get(`${API_BASE}/tutorial-centers/advanced-analytics?timeRange=${timeRange}`, {
      headers: await getAuthHeader()
    });
    return response.data;
  },

  getMyAchievements: async () => {
    const response = await axios.get(`${API_BASE}/tutorial-centers/achievements`, {
      headers: await getAuthHeader()
    });
    return response.data;
  },

  getAllAchievements: async () => {
    const response = await axios.get(`${API_BASE}/tutorial-centers/achievements/all`, {
      headers: await getAuthHeader()
    });
    return response.data;
  }
};

export default tutorialCenterService;
