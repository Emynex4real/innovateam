import axios from 'axios';
import { LOCAL_STORAGE_KEYS, API_BASE_URL } from '../config/constants';
import logger from '../utils/logger';

const API_URL = API_BASE_URL || 'http://localhost:5001/api';

class AuthService {
  constructor() {
    this.initialized = false;
    this.initialize();
  }

  initialize() {
    if (this.initialized) return;
    logger.service('Initializing AuthService');
    this.api = axios.create({
      baseURL: API_URL,
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000,
    });

    this.api.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        const status = error.response?.status;
        if (status !== 431) {
          logger.service('API error', { status, error: error.message });
        }
        if (status === 401 && !originalRequest?._retry) {
          originalRequest._retry = true;
          try {
            const refreshToken = this.getRefreshToken();
            if (!refreshToken) {
              logger.service('No refresh token available');
              return Promise.reject(error);
            }
            logger.service('Attempting to refresh token');
            const response = await axios.post(`${API_URL}/auth/refresh-token`, { refreshToken });
            const { token, refreshToken: newRefreshToken, user } = response.data;
            if (token && user) {
              logger.service('Token refresh successful');
              this.setToken(token);
              this.setRefreshToken(newRefreshToken);
              this.setUser(user);
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return this.api(originalRequest);
            }
          } catch (refreshError) {
            logger.service('Token refresh failed');
            return Promise.reject(refreshError);
          }
        }
        return Promise.reject(error);
      }
    );
    this.initialized = true;
  }

  async login(credentials) {
    logger.auth('Login attempt started');
    try {
      const response = await this.api.post('/auth/login', credentials);
      const { token, refreshToken, user } = response.data;
      if (!token || !refreshToken || !user) {
        logger.auth('Incomplete login response');
        return { success: false, error: 'Invalid login response' };
      }
      this.setToken(token);
      this.setRefreshToken(refreshToken);
      this.setUser(user);
      logger.auth('Login successful');
      return { success: true, user };
    } catch (error) {
      console.log(error)
      logger.auth('Login error', { error: error.message });
      return {
        success: false,
        error: error.response?.data?.error || 'Login failed',
      };
    }
  }

async register(userData) {
  console.log('Registering user:', userData);
  try {
    const response = await this.api.post('/auth/register', userData, {
      withCredentials: false // Prevent sending cookies
    });
    console.log(response);
    const { token, refreshToken, user, info, requiresConfirmation } = response.data;
    if (info && requiresConfirmation) {
      return { success: true, info }; // Handle email confirmation
    }
    if (!token || !refreshToken || !user) {
      return { success: false, error: 'Invalid registration response' };
    }
    this.setToken(token);
    this.setRefreshToken(refreshToken);
    this.setUser(user);
    return { success: true, user };
  } catch (error) {
    console.error('Registration error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.error || 'Registration failed',
    };
  }
}

  async logout() {
    try {
      await this.api.post('/auth/logout');
      this.clearStorage();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Logout failed' };
    }
  }

  async validateToken() {
    try {
      const response = await this.api.get('/auth/validate');
      const { valid, user } = response.data;
      if (valid && user) {
        this.setUser({ ...user, role: user.role || 'user', isAdmin: user.role === 'admin' });
      }
      return valid;
    } catch (error) {
      return false;
    }
  }

  setUser(user) {
    if (!user) return;
    localStorage.setItem(LOCAL_STORAGE_KEYS.USER, JSON.stringify(user));
  }

  setToken(token) {
    if (!token) return;
    localStorage.setItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN, token);
  }

  setRefreshToken(token) {
    if (!token) return;
    localStorage.setItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN, token);
  }

  getToken() {
    return localStorage.getItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN);
  }

  getRefreshToken() {
    return localStorage.getItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN);
  }

  getUser() {
    const userString = localStorage.getItem(LOCAL_STORAGE_KEYS.USER);
    return userString ? JSON.parse(userString) : null;
  }

  clearStorage() {
    logger.auth('Clearing auth storage');
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
      const response = await this.api.post('/auth/refresh-token', { refreshToken });
      const { token, refreshToken: newRefreshToken, user } = response.data;
      this.setToken(token);
      this.setRefreshToken(newRefreshToken);
      this.setUser(user);
      return { success: true, user };
    } catch (error) {
      this.clearStorage();
      return { success: false, error: error.message };
    }
  }

  async forgotPassword(email) {
    try {
      await this.api.post('/auth/forgot-password', { email });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Failed to send reset email' };
    }
  }

  async resetPassword(token, newPassword) {
    try {
      await this.api.post('/auth/reset-password', { token, newPassword });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Failed to reset password' };
    }
  }

  async updateProfile(userData) {
    try {
      const response = await this.api.put('/auth/profile', userData);
      const { user } = response.data;
      this.setUser(user);
      return { success: true, user };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Failed to update profile' };
    }
  }
}

const authService = new AuthService();
export default authService;