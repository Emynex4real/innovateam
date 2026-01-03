import axios from 'axios';
import supabase from '../lib/supabase';

const API_BASE = 'http://localhost:5000/api';

const getAuthHeader = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return { Authorization: `Bearer ${session?.access_token}` };
};

export const analyticsService = {
  // Student Analytics
  getStudentAnalytics: async (centerId) => {
    const response = await axios.get(`${API_BASE}/analytics/student/analytics/${centerId}`, {
      headers: await getAuthHeader()
    });
    return response.data;
  },

  getSubjectAnalytics: async (centerId) => {
    const response = await axios.get(`${API_BASE}/analytics/student/subjects/${centerId}`, {
      headers: await getAuthHeader()
    });
    return response.data;
  },

  getPerformanceTrends: async (centerId, days = 30) => {
    const response = await axios.get(`${API_BASE}/analytics/student/trends/${centerId}?days=${days}`, {
      headers: await getAuthHeader()
    });
    return response.data;
  },

  getRecommendations: async (centerId) => {
    const response = await axios.get(`${API_BASE}/analytics/student/recommendations/${centerId}`, {
      headers: await getAuthHeader()
    });
    return response.data;
  },

  logStudySession: async (centerId, sessionData) => {
    const response = await axios.post(`${API_BASE}/analytics/student/session`, 
      { centerId, ...sessionData },
      { headers: await getAuthHeader() }
    );
    return response.data;
  }
};

export default analyticsService;
