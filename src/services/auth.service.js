import axios from 'axios';
import { 
  LOCAL_STORAGE_KEYS, 
  API_BASE_URL,
  API_ENDPOINTS 
} from '../config/constants';
import logger from '../utils/logger';

// Fallback API URL if not defined in constants
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
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000, // 10 second timeout
    });

    // Add request interceptor to add auth token to requests
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
      (response) => {
        return response;
      },
      async (error) => {
        const originalRequest = error.config;
        const status = error.response?.status;
        
        if (status !== 431) {
          logger.service('API error', { status, error: error.message });
        }

        // If the error is 401 and we haven't already tried to refresh
        if (status === 401 && !originalRequest?._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = this.getRefreshToken();
            if (!refreshToken) {
              logger.service('No refresh token available');
              this.clearStorage();
              return Promise.reject(error);
            }

            logger.service('Attempting to refresh token');
            const response = await axios.post(
              `${API_BASE_URL}${API_ENDPOINTS.AUTH.REFRESH_TOKEN}`,
              { refreshToken },
              {
                timeout: 15000,
                headers: {
                  'Content-Type': 'application/json',
                },
              }
            );

            const { token, user } = response.data;
            if (token && user) {
              logger.service('Token refresh successful');
              this.setToken(token);
              this.setUser(user);
              
              // Update the original request with the new token
              originalRequest.headers.Authorization = `Bearer ${token}`;
              
              logger.service('Retrying original request');
              
              return this.api(originalRequest);
            }
          } catch (refreshError) {
            logger.service('Token refresh failed');
            
            // Only clear storage if it's an auth-related error
            if (refreshError.response?.status === 401) {
              this.clearStorage();
            }
            
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
      
      logger.auth('Login response received');

      // Ensure user object includes isAdmin
      if (user && typeof user.isAdmin === 'undefined') {
        user.isAdmin = false;
      }
      
      this.setToken(token);
      this.setRefreshToken(refreshToken);
      this.setUser(user);
      this.logAuthStorageState('after login');
      this.verifyAuthStorageOrClear('after login');

      // Verify storage
      const storedToken = this.getToken();
      const storedUser = this.getUser();
      
      logger.auth('Storage verified');

      return { success: true, user };
    } catch (error) {
      logger.auth('Login error', { error: error.message });
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed',
      };
    }
  }

  async register(userData) {
    console.log('Attempting to register with data:', JSON.stringify(userData, null, 2));
    try {
      const response = await this.api.post('/auth/register', userData);
      console.log('Registration response:', response);
      const { token, refreshToken, user } = response.data;
      
      // Ensure user object includes isAdmin
      if (user && typeof user.isAdmin === 'undefined') {
        user.isAdmin = false;
      }
      
      this.setToken(token);
      this.setRefreshToken(refreshToken);
      this.setUser(user);
      
      console.log('Registration successful for user:', user.email);
      return { success: true, user };
    } catch (error) {
      console.error('Registration error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          data: error.config?.data
        }
      });
      
      let errorMessage = 'Registration failed. Please try again.';
      
      if (error.response) {
        // Handle specific error status codes
        switch (error.response.status) {
          case 400:
            errorMessage = error.response.data?.message || 'Invalid registration data';
            break;
          case 409:
            errorMessage = 'An account with this email already exists';
            break;
          case 429:
            errorMessage = 'Too many registration attempts. Please try again later.';
            break;
          case 500:
            errorMessage = 'Server error. Please try again later.';
            break;
          default:
            errorMessage = error.response.data?.message || 'Registration failed';
        }
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage = 'Unable to connect to the server. Please check your internet connection.';
      }
      
      return {
        success: false,
        error: errorMessage,
        details: error.response?.data
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
        logger.auth('No token found');
        return false;
      }

      logger.auth('Validating token');
      const response = await this.api.get('/auth/validate');
      const { valid, user } = response.data;
      logger.auth('Token validation response');
      if (valid && user) {
        // Ensure user object has a role, default to 'user' if not provided
        const userWithRole = {
          ...user,
          role: user.role || 'user',
          isAdmin: (user.role === 'admin') // Set isAdmin based on role
        };
        logger.auth('Setting user with role');
        this.setUser(userWithRole);
      }
      return valid;
    } catch (error) {
      logger.auth('Token validation error');
      console.error('Token validation error:', error.response?.data || error.message);
      return false;
    }
  }

  // Utility: log all auth storage state
  logAuthStorageState(context = '') {
    logger.auth(`Storage state: ${context}`);
  }

  // Defensive: only set user if both tokens are present
  setUser(user) {
    try {
      const token = localStorage.getItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN);
      const refreshToken = localStorage.getItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN);
      if (!user) {
        logger.auth('No user data provided');
        return;
      }
      if (!token || !refreshToken) {
        logger.auth('Missing tokens, refusing to set user');
        return;
      }
      logger.auth('Setting user data');
      const userString = JSON.stringify(user);
      localStorage.setItem(LOCAL_STORAGE_KEYS.USER, userString);
      // Verify the user was set correctly
      const storedUser = localStorage.getItem(LOCAL_STORAGE_KEYS.USER);
      if (!storedUser) {
        throw new Error('User verification failed after storage');
      }
      logger.auth('User data set');
    } catch (error) {
      const errorMsg = `Error setting user data: ${error.message}`;
      console.error(errorMsg, error);
      logger.auth('Error setting user', { error: error.message });
      throw new Error('Failed to set user data');
    }
  }

  setToken(token) {
    try {
      if (!token) {
        logger.auth('No token provided');
        return;
      }
      logger.auth('Setting auth token');
      localStorage.setItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN, token);
      // Verify the token was set correctly
      const storedToken = localStorage.getItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN);
      if (storedToken !== token) {
        throw new Error('Token verification failed after storage');
      }
      logger.auth('Auth token set');
      // Update last action timestamp
      localStorage.setItem(LOCAL_STORAGE_KEYS.LAST_AUTH_ACTION, new Date().toISOString());
    } catch (error) {
      const errorMsg = `Error setting auth token: ${error.message}`;
      console.error(errorMsg, error);
      logger.auth('Error setting token', { error: error.message });
      throw new Error('Failed to set auth token');
    }
  }

  setRefreshToken(token) {
    try {
      if (!token) {
        logger.auth('No refresh token provided');
        return;
      }
      logger.auth('Setting refresh token');
      localStorage.setItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN, token);
      // Verify the refresh token was set correctly
      const storedToken = localStorage.getItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN);
      if (storedToken !== token) {
        throw new Error('Refresh token verification failed after storage');
      }
      logger.auth('Refresh token set');
    } catch (error) {
      const errorMsg = `Error setting refresh token: ${error.message}`;
      console.error(errorMsg, error);
      logger.auth('Error setting refresh token', { error: error.message });
      throw new Error('Failed to set refresh token');
    }
  }

  // Defensive: after login or refresh, clear all if any are missing
  verifyAuthStorageOrClear(context = '') {
    const token = localStorage.getItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN);
    const refreshToken = localStorage.getItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN);
    const user = localStorage.getItem(LOCAL_STORAGE_KEYS.USER);
    if (!token || !refreshToken || !user) {
      logger.auth('Incomplete auth storage, clearing');
      this.clearStorage();
      return false;
    }
    logger.auth('Auth storage complete');
    return true;
  }

  // Token management
  getToken() {
    try {
      return localStorage.getItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN);
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  getRefreshToken() {
    try {
      return localStorage.getItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN);
    } catch (error) {
      console.error('Error getting refresh token:', error);
      return null;
    }
  }

  // User management
  getUser() {
    try {
      const userString = localStorage.getItem(LOCAL_STORAGE_KEYS.USER);
      return userString ? JSON.parse(userString) : null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }

  // Clear all auth data
  clearStorage() {
    logger.auth('Clearing auth storage');
    try {
      const hadToken = !!this.getToken();
      const hadUser = !!this.getUser();
      const hadRefreshToken = !!this.getRefreshToken();
      
      logger.auth('Storage state before clear');
      
      localStorage.removeItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.USER);
      
      // Verify everything was cleared
      const currentToken = localStorage.getItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN);
      const currentUser = localStorage.getItem(LOCAL_STORAGE_KEYS.USER);
      const currentRefreshToken = localStorage.getItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN);
      
      logger.auth('Auth storage cleared');
      
      if (currentToken || currentUser || currentRefreshToken) {
        logger.auth('WARNING: Failed to clear all auth data');
      }
    } catch (error) {
      logger.auth('Error clearing storage');
      throw error;
    }
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
        logger.auth('No refresh token available');
        throw new Error('No refresh token available');
      }
      logger.auth('Calling refresh token endpoint');
      const response = await this.api.post('/auth/refresh-token', {
        refreshToken,
      });
      logger.auth('Refresh token response received');
      const { token, refreshToken: newRefreshToken, user } = response.data;
      // Ensure user object includes isAdmin
      if (user && typeof user.isAdmin === 'undefined') {
        const currentUser = this.getUser();
        user.isAdmin = currentUser?.isAdmin || false;
      }
      this.setToken(token);
      this.setRefreshToken(newRefreshToken);
      this.setUser(user);
      this.logAuthStorageState('after refreshToken');
      this.verifyAuthStorageOrClear('after refreshToken');
      return { success: true, user };
    } catch (error) {
      logger.auth('Refresh token error', { error: error.message });
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
      
      // Ensure user object includes isAdmin
      if (user && typeof user.isAdmin === 'undefined') {
        const currentUser = this.getUser();
        user.isAdmin = currentUser?.isAdmin || false;
      }
      
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
