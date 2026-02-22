import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

export const proctoringService = {
  // Log proctoring session
  logSession: async (attemptId, testId, deviceFingerprint, violations) => {
    try {
      const { data } = await axios.post(
        `${API_URL}/api/proctoring/session`,
        { attempt_id: attemptId, test_id: testId, device_fingerprint: deviceFingerprint, violations },
        { headers: getAuthHeader() }
      );
      return data;
    } catch (error) {
      console.error('Log session error:', error);
      return { success: false };
    }
  },

  // End session
  endSession: async (sessionId) => {
    try {
      const { data } = await axios.post(
        `${API_URL}/api/proctoring/session/end`,
        { session_id: sessionId },
        { headers: getAuthHeader() }
      );
      return data;
    } catch (error) {
      console.error('End session error:', error);
      return { success: false };
    }
  },

  // Get report for specific attempt
  getReport: async (attemptId) => {
    try {
      const { data } = await axios.get(
        `${API_URL}/api/proctoring/report/${attemptId}`,
        { headers: getAuthHeader() }
      );
      return data;
    } catch (error) {
      console.error('Get report error:', error);
      return { success: false };
    }
  },

  // Get all reports for center
  getCenterReports: async (filters = {}) => {
    try {
      const params = new URLSearchParams(filters).toString();
      const { data } = await axios.get(
        `${API_URL}/api/proctoring/reports?${params}`,
        { headers: getAuthHeader() }
      );
      return data;
    } catch (error) {
      console.error('Get center reports error:', error);
      return { success: false, reports: [] };
    }
  },

  // Get student's own session
  getMySession: async (attemptId) => {
    try {
      const { data } = await axios.get(
        `${API_URL}/api/proctoring/my-session/${attemptId}`,
        { headers: getAuthHeader() }
      );
      return data;
    } catch (error) {
      console.error('Get my session error:', error);
      return { success: false };
    }
  }
};

export default proctoringService;
