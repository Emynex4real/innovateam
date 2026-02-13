import axios from 'axios';
import debounce from 'lodash/debounce';
import csrfProtection from './csrfProtection';

// Simple security utility fallback
const apiSecurity = {
  addSecurityHeaders: (headers) => ({
    ...headers,
    'X-Requested-With': 'XMLHttpRequest',
    'X-Client-Version': '1.0.0'
  }),
  sanitizeRequest: (data) => {
    if (!data || typeof data !== 'object') return data;
    const sanitized = {};
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string') {
        sanitized[key] = value.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
                              .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = apiSecurity.sanitizeRequest(value);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }
};

const API_URL = process.env.REACT_APP_API_URL || 'https://innovateam-api.onrender.com';

// Create axios instance with security enhancements
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for security
api.interceptors.request.use(async (config) => {
  // Add security headers (set directly to preserve AxiosHeaders instance)
  config.headers['X-Requested-With'] = 'XMLHttpRequest';
  config.headers['X-Client-Version'] = '1.0.0';
  
  // Add CSRF token for state-changing requests
  if (['post', 'put', 'delete', 'patch'].includes(config.method?.toLowerCase())) {
    try {
      const token = await csrfProtection.getToken();
      if (token) {
        config.headers['x-csrf-token'] = token;
      } else {
        return Promise.reject(new Error('CSRF token unavailable. Request blocked for security.'));
      }
    } catch (error) {
      return Promise.reject(new Error('CSRF validation failed. Request blocked for security.'));
    }
  }
  
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
        const response = await api.post('/api/recommend', data);
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
        
        const response = await api.post('/api/generate-questions', formData, {
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