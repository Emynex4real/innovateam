import axios from 'axios';
import supabase from '../lib/supabase';

const API_BASE = 'http://localhost:5000/api';

const getAuthHeader = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return { Authorization: `Bearer ${session?.access_token}` };
};

export const studentTCService = {
  joinCenter: async (accessCode) => {
    const response = await axios.post(`${API_BASE}/tc-enrollments/join`, 
      { accessCode }, 
      { headers: await getAuthHeader() }
    );
    return response.data;
  },

  getMyCenters: async () => {
    const response = await axios.get(`${API_BASE}/tc-enrollments/my-centers`, {
      headers: await getAuthHeader()
    });
    return response.data;
  },

  getAvailableTests: async () => {
    const response = await axios.get(`${API_BASE}/tc-question-sets`, {
      headers: await getAuthHeader()
    });
    return response.data;
  },

  getTest: async (testId) => {
    const response = await axios.get(`${API_BASE}/tc-question-sets/${testId}`, {
      headers: await getAuthHeader()
    });
    return response.data;
  },

  submitAttempt: async (data) => {
    const response = await axios.post(`${API_BASE}/tc-attempts/submit`, data, {
      headers: await getAuthHeader()
    });
    return response.data;
  },

  getMyAttempts: async (questionSetId = null) => {
    const response = await axios.get(`${API_BASE}/tc-attempts/my-attempts`, {
      headers: await getAuthHeader(),
      params: questionSetId ? { question_set_id: questionSetId } : {}
    });
    return response.data;
  },

  getLeaderboard: async (questionSetId) => {
    const response = await axios.get(`${API_BASE}/tc-attempts/leaderboard/${questionSetId}`, {
      headers: await getAuthHeader()
    });
    return response.data;
  },

  getPublicTests: async () => {
    const response = await axios.get(`${API_BASE}/tc-question-sets/public/all`, {
      headers: await getAuthHeader()
    });
    return response.data;
  },

  getAttemptDetails: async (attemptId) => {
    const response = await axios.get(`${API_BASE}/tc-attempts/details/${attemptId}`, {
      headers: await getAuthHeader()
    });
    return response.data;
  }
};

export default studentTCService;
