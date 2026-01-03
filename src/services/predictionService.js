import axios from 'axios';
import supabase from '../lib/supabase';

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
    const response = await axios.get(
      `${API_BASE}/analytics/predictions/score/${studentId}/${centerId}`,
      { headers: await getAuthHeader() }
    );
    return response.data;
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
    const response = await axios.get(
      `${API_BASE}/analytics/predictions/pass-rate/${studentId}/${centerId}?difficulty=${difficulty}`,
      { headers: await getAuthHeader() }
    );
    return response.data;
  }
};

export default predictionService;
