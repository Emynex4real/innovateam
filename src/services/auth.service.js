import axios from 'axios';
import { LOCAL_STORAGE_KEYS } from '../config/constants';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class AuthService {
  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true
    });

    // Add request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor to handle token refresh
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // If error is 401 and we haven't tried to refresh token yet
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = this.getRefreshToken();
            if (!refreshToken) {
              throw new Error('No refresh token available');
            }

            const response = await this.api.post('/auth/refresh-token', {
              refreshToken,
            });

            const { token, refreshToken: newRefreshToken, user } = response.data;
            this.setToken(token);
            this.setRefreshToken(newRefreshToken);
            this.setUser(user);

            // Retry the original request with new token
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return this.api(originalRequest);
          } catch (refreshError) {
            // If refresh fails, clear storage
            this.clearStorage();
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  async login(credentials) {
    try {
      const response = await this.api.post('/auth/login', credentials);
      const { token, refreshToken, user } = response.data;

      this.setToken(token);
      this.setRefreshToken(refreshToken);
      this.setUser(user);

      return { success: true, user };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed',
      };
    }
  }

  async register(userData) {
    try {
      await this.api.post('/auth/register', userData);
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Registration failed',
      };
    }
  }

  async logout() {
    try {
      await this.api.post('/auth/logout');
      this.clearStorage();
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Logout failed',
      };
    }
  }

  async validateToken() {
    try {
      const token = this.getToken();
      if (!token) {
        return false;
      }

      const response = await this.api.get('/auth/validate');
      return response.data.valid;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  }

  // Token management
  getToken() {
    return localStorage.getItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN);
  }

  setToken(token) {
    localStorage.setItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN, token);
  }

  getRefreshToken() {
    return localStorage.getItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN);
  }

  setRefreshToken(token) {
    localStorage.setItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN, token);
  }

  getUser() {
    const userStr = localStorage.getItem(LOCAL_STORAGE_KEYS.USER);
    return userStr ? JSON.parse(userStr) : null;
  }

  setUser(user) {
    localStorage.setItem(LOCAL_STORAGE_KEYS.USER, JSON.stringify(user));
  }

  clearStorage() {
    localStorage.removeItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.USER);
  }

  isAuthenticated() {
    return !!this.getToken();
  }

  setRememberMe(value) {
    localStorage.setItem('rememberMe', value);
  }

  getRememberMe() {
    return localStorage.getItem('rememberMe') === 'true';
  }

  async refreshToken() {
    try {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await this.api.post('/auth/refresh-token', {
        refreshToken,
      });

      const { token, refreshToken: newRefreshToken, user } = response.data;
      this.setToken(token);
      this.setRefreshToken(newRefreshToken);
      this.setUser(user);

      return { success: true, user };
    } catch (error) {
      console.error('Token refresh error:', error);
      this.clearStorage();
      return { success: false, error };
    }
  }

  async forgotPassword(email) {
    try {
      await this.api.post('/auth/forgot-password', { email });
      return { success: true };
    } catch (error) {
      console.error('Forgot password error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to send reset email',
      };
    }
  }

  async resetPassword(token, newPassword) {
    try {
      await this.api.post('/auth/reset-password', { token, newPassword });
      return { success: true };
    } catch (error) {
      console.error('Reset password error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to reset password',
      };
    }
  }

  async updateProfile(userData) {
    try {
      const response = await this.api.put('/auth/profile', userData);
      const { user } = response.data;
      this.setUser(user);
      return { success: true, user };
    } catch (error) {
      console.error('Update profile error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update profile',
      };
    }
  }
}

const authService = new AuthService();
export default authService; 