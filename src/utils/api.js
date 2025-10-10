import axios from 'axios';
import debounce from 'lodash/debounce';
import { apiSecurity } from './apiSecurity';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Create axios instance with security enhancements
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for security
api.interceptors.request.use((config) => {
  // Add security headers
  config.headers = apiSecurity.addSecurityHeaders(config.headers);
  
  // Sanitize request data
  if (config.data && typeof config.data === 'object') {
    config.data = apiSecurity.sanitizeRequest(config.data);
  }
  
  return config;
}, (error) => Promise.reject(error));

// Response interceptor for validation
api.interceptors.response.use((response) => {
  return response;
}, (error) => {
  if (error.code === 'ECONNABORTED') {
    return Promise.reject(new Error('Request timeout'));
  }
  return Promise.reject(error);
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