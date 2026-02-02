import axios from 'axios';
import supabase from '../config/supabase';

const API_BASE = 'http://localhost:5000/api';

const getAuthHeader = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return { Authorization: `Bearer ${session?.access_token}` };
};

export const tutorAnalyticsService = {
  // Center Analytics
  getCenterAnalytics: async () => {
    const response = await axios.get(`${API_BASE}/analytics/tutor/center-analytics`, {
      headers: await getAuthHeader()
    });
    return response.data;
  },

  getStudentPerformance: async (studentId, centerId) => {
    const response = await axios.get(
      `${API_BASE}/analytics/tutor/student-performance/${studentId}/${centerId}`,
      { headers: await getAuthHeader() }
    );
    return response.data;
  },

  getQuestionAnalysis: async (centerId) => {
    const response = await axios.get(`${API_BASE}/analytics/tutor/question-analysis/${centerId}`, {
      headers: await getAuthHeader()
    });
    return response.data;
  },

  getTestAnalytics: async (centerId) => {
    const response = await axios.get(`${API_BASE}/analytics/tutor/test-analytics/${centerId}`, {
      headers: await getAuthHeader()
    });
    return response.data;
  },

  getTutorInsights: async (centerId) => {
    const response = await axios.get(`${API_BASE}/analytics/tutor/insights/${centerId}`, {
      headers: await getAuthHeader()
    });
    return response.data;
  }
};

export default tutorAnalyticsService;
