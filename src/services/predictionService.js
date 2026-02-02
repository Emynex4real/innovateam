import axios from 'axios';
import supabase from '../config/supabase';

const API_BASE = 'http://localhost:5000/api';

const getAuthHeader = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return { Authorization: `Bearer ${session?.access_token}` };
};

export const predictionService = {
  // Get at-risk students
  getAtRiskStudents: async (centerId) => {
    const response = await axios.get(`${API_BASE}/analytics/predictions/at-risk/${centerId}`, {
      headers: await getAuthHeader()
    });
    return response.data;
  },

  // Update at-risk predictions
  updateAtRiskPredictions: async (centerId) => {
    const response = await axios.post(
      `${API_BASE}/analytics/predictions/update-at-risk/${centerId}`,
      {},
      { headers: await getAuthHeader() }
    );
    return response.data;
  },

  // Calculate at-risk score
  calculateAtRiskScore: async (studentId, centerId) => {
    try {
      console.log('📡 [API] Calling calculateAtRiskScore with studentId:', studentId, 'centerId:', centerId);
      const response = await axios.get(
        `${API_BASE}/analytics/predictions/score/${studentId}/${centerId}`,
        { headers: await getAuthHeader() }
      );
      console.log('✅ [API] calculateAtRiskScore response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [API] calculateAtRiskScore error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get recommended topics
  getRecommendedTopics: async (studentId, centerId) => {
    const response = await axios.get(
      `${API_BASE}/analytics/predictions/recommended-topics/${studentId}/${centerId}`,
      { headers: await getAuthHeader() }
    );
    return response.data;
  },

  // Predict pass rate
  predictPassRate: async (studentId, centerId, difficulty = 'medium') => {
    try {
      console.log('📡 [API] Calling predictPassRate with studentId:', studentId, 'centerId:', centerId, 'difficulty:', difficulty);
      const response = await axios.get(
        `${API_BASE}/analytics/predictions/pass-rate/${studentId}/${centerId}?difficulty=${difficulty}`,
        { headers: await getAuthHeader() }
      );
      console.log('✅ [API] predictPassRate response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [API] predictPassRate error:', error.response?.data || error.message);
      throw error;
    }
  }
};

export default predictionService;
