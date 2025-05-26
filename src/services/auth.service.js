import api from './api';
import { LOCAL_STORAGE_KEYS } from '../config/constants';

class AuthService {
  async login(credentials) {
    try {
      const response = await api.post('/auth/login', credentials);
      const { token, user } = response.data;
      
      if (credentials.rememberMe) {
        localStorage.setItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN, token);
      } else {
        sessionStorage.setItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN, token);
      }
      
      localStorage.setItem(LOCAL_STORAGE_KEYS.USER, JSON.stringify(user));
      return { success: true, user };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || error.message 
      };
    }
  }

  async register(userData) {
    try {
      const response = await api.post('/auth/register', userData);
      const { token, user } = response.data;
      
      localStorage.setItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN, token);
      localStorage.setItem(LOCAL_STORAGE_KEYS.USER, JSON.stringify(user));
      
      return { success: true, user };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || error.message 
      };
    }
  }

  async logout() {
    try {
      await api.post('/auth/logout');
      localStorage.removeItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN);
      sessionStorage.removeItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.USER);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || error.message 
      };
    }
  }

  async forgotPassword(email) {
    try {
      await api.post('/auth/forgot-password', { email });
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || error.message 
      };
    }
  }

  async resetPassword(token, newPassword) {
    try {
      await api.post('/auth/reset-password', { token, newPassword });
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || error.message 
      };
    }
  }

  async verifyEmail(token) {
    try {
      await api.post('/auth/verify-email', { token });
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || error.message 
      };
    }
  }

  getCurrentUser() {
    const userStr = localStorage.getItem(LOCAL_STORAGE_KEYS.USER);
    return userStr ? JSON.parse(userStr) : null;
  }

  isAuthenticated() {
    return !!(localStorage.getItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN) || 
             sessionStorage.getItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN));
  }
}

const authService = new AuthService();
export default authService; 