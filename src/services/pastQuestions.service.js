import api from "./api";

const API_BASE = "/past-questions";

const pastQuestionsService = {
  // Browse/search with filters
  getQuestions: async (filters = {}) => {
    const params = {};
    if (filters.exam_body) params.exam_body = filters.exam_body;
    if (filters.exam_year) params.exam_year = filters.exam_year;
    if (filters.subject) params.subject = filters.subject;
    if (filters.topic) params.topic = filters.topic;
    if (filters.difficulty) params.difficulty = filters.difficulty;
    if (filters.search) params.search = filters.search;
    if (filters.page) params.page = filters.page;
    if (filters.limit) params.limit = filters.limit;

    const response = await api.get(API_BASE, { params });
    return response.data;
  },

  // Get distinct subjects
  getSubjects: async (examBody = null) => {
    const params = examBody ? { exam_body: examBody } : {};
    const response = await api.get(`${API_BASE}/subjects`, { params });
    return response.data;
  },

  // Get distinct years
  getYears: async (examBody = null) => {
    const params = examBody ? { exam_body: examBody } : {};
    const response = await api.get(`${API_BASE}/years`, { params });
    return response.data;
  },

  // Get stats
  getStats: async () => {
    const response = await api.get(`${API_BASE}/stats`);
    return response.data;
  },

  // Import selected questions to tutor's bank
  importToBank: async (questionIds) => {
    const response = await api.post(`${API_BASE}/import`, {
      question_ids: questionIds,
    });
    return response.data;
  },
};

export default pastQuestionsService;
