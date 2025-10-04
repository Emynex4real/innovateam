import axios from 'axios';
import debounce from 'lodash/debounce';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Create axios instance with DeepSeek base URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Create debounced functions for API calls (1 second delay)
const debouncedRequest = debounce((request) => request(), 1000);

export const getCourseRecommendations = async (data) => {
  return new Promise((resolve, reject) => {
    debouncedRequest(async () => {
      try {
        const response = await api.post('/recommend', data);
        resolve(response.data);
      } catch (error) {
        console.error('Course Recommendation Error:', error);
        reject(error.response?.data || { error: 'Failed to get recommendations' });
      }
    });
  });
};

export const generateQuestions = async (file) => {
  return new Promise((resolve, reject) => {
    debouncedRequest(async () => {
      try {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await api.post('/generate-questions', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        resolve(response.data);
      } catch (error) {
        console.error('Question Generation Error:', error);
        reject(error.response?.data || { error: 'Failed to generate questions' });
      }
    });
  });
};