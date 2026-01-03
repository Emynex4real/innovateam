import axios from 'axios';
import { toast } from 'react-hot-toast';
import { API_BASE_URL, ERROR_MESSAGES, LOCAL_STORAGE_KEYS } from '../config/constants';
import { supabase } from '../lib/supabase';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Session error:', error);
        const { data: refreshData } = await supabase.auth.refreshSession();
        if (refreshData?.session?.access_token) {
          config.headers.Authorization = `Bearer ${refreshData.session.access_token}`;
          return config;
        }
      }
      
      if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
        localStorage.setItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN, session.access_token);
      }
    } catch (err) {
      console.error('Auth interceptor error:', err);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { response, config } = error;
    
    if (!response) {
      toast.error(ERROR_MESSAGES.NETWORK_ERROR);
      return Promise.reject(error);
    }

    // Handle 401 with token refresh
    if (response.status === 401 && !config._retry) {
      config._retry = true;
      
      try {
        // Try to refresh the session
        const { data: { session }, error: refreshError } = await supabase.auth.refreshSession();
        
        if (session?.access_token) {
          // Update token and retry request
          localStorage.setItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN, session.access_token);
          config.headers.Authorization = `Bearer ${session.access_token}`;
          return api(config);
        }
      } catch (refreshErr) {
        console.error('Token refresh failed:', refreshErr);
      }
      
      // If refresh fails, logout
      await supabase.auth.signOut();
      localStorage.clear();
      window.location.href = '/login';
      toast.error('Session expired. Please login again.');
      return Promise.reject(error);
    }

    switch (response.status) {
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
        if (response.status >= 500) {
          toast.error(ERROR_MESSAGES.SERVER_ERROR);
        } else {
          toast.error(response.data?.message || ERROR_MESSAGES.GENERIC);
        }
    }

    return Promise.reject(error);
  }
);

export default api;