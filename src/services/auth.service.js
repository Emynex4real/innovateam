import api from './api';
import { LOCAL_STORAGE_KEYS } from '../config/constants';

class AuthService {
  async login(credentials) {
    try {
      // Get stored user data
      const storedUserStr = localStorage.getItem(LOCAL_STORAGE_KEYS.USER);
      if (!storedUserStr) {
        throw new Error('Invalid credentials');
      }

      const storedUser = JSON.parse(storedUserStr);
      if (storedUser.email !== credentials.email) {
        throw new Error('Invalid credentials');
      }

      // Create a new token on login
      const token = 'mock_token_' + Date.now();
      localStorage.setItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN, token);
      
      return { success: true, user: storedUser };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }
  }

  async register(userData) {
    try {
      // Create a mock token and store user data
      const token = 'mock_token_' + Date.now();
      const user = {
        id: Date.now(),
        name: userData.name,
        email: userData.email,
        phoneNumber: userData.phoneNumber,
        createdAt: new Date().toISOString()
      };
      
      // Store token and user data in localStorage
      localStorage.setItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN, token);
      localStorage.setItem(LOCAL_STORAGE_KEYS.USER, JSON.stringify(user));
      
      return { success: true, user };
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }
  }

  async logout() {
    try {
      // Remove auth data from localStorage
      localStorage.removeItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.USER);
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { 
        success: false, 
        error: error.message 
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
    return !!localStorage.getItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN);
  }
}

const authService = new AuthService();
export default authService; 