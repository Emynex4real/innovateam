import axios from 'axios';
import supabase from '../config/supabase';

const API_BASE = 'http://localhost:5000/api';

const getAuthHeader = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    return { Authorization: `Bearer ${session.access_token}` };
  }
  // Session expired or missing — try refreshing
  const { data: { session: refreshed }, error } = await supabase.auth.refreshSession();
  if (error || !refreshed?.access_token) {
    throw new Error('Session expired. Please log in again.');
  }
  return { Authorization: `Bearer ${refreshed.access_token}` };
};

export const analyticsService = {
  // Student Analytics
  getStudentAnalytics: async (centerId) => {
    try {
      console.log('📡 [API] Calling getStudentAnalytics with centerId:', centerId);
      const response = await axios.get(`${API_BASE}/analytics/student/analytics/${centerId}`, {
        headers: await getAuthHeader()
      });
      console.log('✅ [API] getStudentAnalytics response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [API] getStudentAnalytics error:', error.response?.data || error.message);
      throw error;
    }
  },

  getSubjectAnalytics: async (centerId) => {
    try {
      console.log('📡 [API] Calling getSubjectAnalytics with centerId:', centerId);
      const response = await axios.get(`${API_BASE}/analytics/student/subjects/${centerId}`, {
        headers: await getAuthHeader()
      });
      console.log('✅ [API] getSubjectAnalytics response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [API] getSubjectAnalytics error:', error.response?.data || error.message);
      throw error;
    }
  },

  getPerformanceTrends: async (centerId, days = 30) => {
    try {
      console.log('📡 [API] Calling getPerformanceTrends with centerId:', centerId, 'days:', days);
      const response = await axios.get(`${API_BASE}/analytics/student/trends/${centerId}?days=${days}`, {
        headers: await getAuthHeader()
      });
      console.log('✅ [API] getPerformanceTrends response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [API] getPerformanceTrends error:', error.response?.data || error.message);
      throw error;
    }
  },

  getRecommendations: async (centerId) => {
    try {
      console.log('📡 [API] Calling getRecommendations with centerId:', centerId);
      const response = await axios.get(`${API_BASE}/analytics/student/recommendations/${centerId}`, {
        headers: await getAuthHeader()
      });
      console.log('✅ [API] getRecommendations response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [API] getRecommendations error:', error.response?.data || error.message);
      throw error;
    }
  },

  logStudySession: async (centerId, sessionData) => {
    try {
      console.log('📡 [API] Calling logStudySession with centerId:', centerId);
      const response = await axios.post(`${API_BASE}/analytics/student/session`, 
        { centerId, ...sessionData },
        { headers: await getAuthHeader() }
      );
      console.log('✅ [API] logStudySession response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [API] logStudySession error:', error.response?.data || error.message);
      throw error;
    }
  }
};

export default analyticsService;
