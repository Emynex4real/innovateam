import axios from 'axios';
import { toast } from 'react-hot-toast';
import { API_BASE_URL, ERROR_MESSAGES, LOCAL_STORAGE_KEYS } from '../config/constants';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN);
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;
    
    if (!response) {
      toast.error(ERROR_MESSAGES.NETWORK_ERROR);
      return Promise.reject(error);
    }

    switch (response.status) {
      case 401:
        if (response.data?.message === 'Token expired') {
          localStorage.removeItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN);
          localStorage.removeItem(LOCAL_STORAGE_KEYS.USER);
          window.location.href = '/login';
          toast.error(ERROR_MESSAGES.SESSION_EXPIRED);
        } else {
          toast.error(response.data?.message || ERROR_MESSAGES.AUTH_REQUIRED);
        }
        break;
      case 403:
        toast.error(response.data?.message || 'Access denied');
        break;
      case 404:
        toast.error(response.data?.message || 'Resource not found');
        break;
      case 422:
        toast.error(response.data?.message || 'Validation error');
        break;
      case 429:
        toast.error('Too many requests. Please try again later.');
        break;
      default:
        toast.error(response.data?.message || ERROR_MESSAGES.GENERIC);
    }

    return Promise.reject(error);
  }
);

export default api; 