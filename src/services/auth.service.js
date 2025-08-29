import axios from 'axios';
import { LOCAL_STORAGE_KEYS, API_ENDPOINTS } from '../config/constants';
import { API_BASE_URL } from '../config/constants';
import logger from '../utils/logger';
import secureTokenStorage from '../utils/secureStorage';
import csrfProtection from '../utils/csrf';
import errorHandler from '../utils/errorHandler';
import { 
  sanitizeInput, 
  sanitizeForLog, 
  isValidEmail, 
  isValidPassword, 
  validateLoginData, 
  validateRegistrationData,
  sanitizeUserData 
} from '../utils/validation';

// Secure API URL configuration
const API_URL = API_BASE_URL || (process.env.NODE_ENV === 'production' 
  ? 'https://innovateam-api.onrender.com/api' 
  : 'http://localhost:5000/api'); // Allow HTTP for local development

// Secure storage utility with error handling
class SecureStorage {
  static setItem(key, value) {
    try {
      if (typeof value === 'object') {
        value = JSON.stringify(value);
      }
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      logger.auth('Storage error', { error: error.message });
      return false;
    }
  }

  static getItem(key) {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      logger.auth('Storage retrieval error', { error: error.message });
      return null;
    }
  }

  static removeItem(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      logger.auth('Storage removal error', { error: error.message });
      return false;
    }
  }

  static getJSON(key) {
    try {
      const item = this.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      logger.auth('JSON parsing error', { key, error: error.message });
      return null;
    }
  }
}

class AuthService {
  constructor() {
    this.initialized = false;
    this.csrfToken = null;
    this.initialize();
  }

  initialize() {
    if (this.initialized) return;
    logger.service('Initializing AuthService');
    
    this.api = axios.create({
      baseURL: API_URL,
      headers: { 
        'Content-Type': 'application/json',
        ...(process.env.NODE_ENV === 'production' && {
          'X-Requested-With': 'XMLHttpRequest' // CSRF protection only in production
        })
      },
      timeout: 10000,
      withCredentials: process.env.NODE_ENV === 'production' // Enable cookies only in production
    });

    // Request interceptor with CSRF protection
    this.api.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Add CSRF token for state-changing requests (only in production)
        if (process.env.NODE_ENV === 'production' && csrfProtection.needsProtection(config.method)) {
          const csrfHeaders = csrfProtection.getTokenForHeader();
          Object.assign(config.headers, csrfHeaders);
        }
        
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor with enhanced error handling
    this.api.interceptors.response.use(
      (response) => {
        // CSRF token is managed client-side, no need to extract from response
        return response;
      },
      async (error) => {
        const originalRequest = error.config;
        const status = error.response?.status;
        
        if (status !== 431) {
          logger.service('API error', { status, message: error.message });
        }
        
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
            const response = await axios.post(`${API_URL}${API_ENDPOINTS.AUTH.REFRESH_TOKEN}`, 
              { refreshToken },
              { withCredentials: true }
            );
            
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
            this.clearStorage();
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
    
    // Input validation
    const validation = validateLoginData(credentials);
    if (!validation.isValid) {
      return errorHandler.handleValidationError(validation.errors, 'login');
    }
    
    try {
      // Sanitize inputs
      const sanitizedCredentials = sanitizeUserData({
        email: credentials.email.toLowerCase().trim(),
        password: credentials.password
      });
      
      const response = await this.api.post(API_ENDPOINTS.AUTH.LOGIN, sanitizedCredentials);
      logger.auth('Login response received');
      
      const { token, refreshToken, user } = response.data;
      console.log('DEBUG: Server returned user data:', user); // Debug log
      if (!token || !refreshToken || !user) {
        logger.auth('Incomplete login response');
        return { success: false, error: 'Invalid login response' };
      }
      
      // Process user data securely
      const userWithAdmin = {
        ...user,
        role: user.user_metadata?.role || user.role || 'user',
        isAdmin: user.user_metadata?.role === 'admin' || user.role === 'admin' || user.isAdmin === true
      };
      
      this.setToken(token);
      this.setRefreshToken(refreshToken);
      this.setUser(userWithAdmin);
      
      logger.auth('Login successful');
      return { success: true, user: userWithAdmin };
    } catch (error) {
      return errorHandler.handleAuthError(error, 'login');
    }
  }

  async register(userData) {
    logger.auth('Registration attempt started');
    
    // Input validation
    const validation = validateRegistrationData(userData);
    if (!validation.isValid) {
      return errorHandler.handleValidationError(validation.errors, 'registration');
    }
    
    try {
      // Sanitize inputs
      const sanitizedData = sanitizeUserData({
        ...userData,
        email: userData.email.toLowerCase().trim()
      });
      
      const response = await this.api.post(API_ENDPOINTS.AUTH.REGISTER, sanitizedData);
      logger.auth('Registration response received');
      
      const { token, refreshToken, user, info, requiresConfirmation } = response.data;
      
      // If user was created successfully with tokens, store them
      if (token && refreshToken && user) {
        this.setToken(token);
        this.setRefreshToken(refreshToken);
        this.setUser(user);
        logger.auth('Registration successful with immediate login');
        return { success: true, user };
      }
      
      // If registration succeeded but requires confirmation
      if (info && requiresConfirmation) {
        logger.auth('Registration successful, confirmation required');
        return { success: true, info, requiresConfirmation: true };
      }
      
      // If registration succeeded but no tokens
      if (response.data.success) {
        logger.auth('Registration successful');
        return { success: true, info: info || 'Registration successful! You can now log in.' };
      }
      
      return { success: false, error: 'Invalid registration response' };
    } catch (error) {
      return errorHandler.handleApiError(error, 'registration');
    }
  }

  async logout() {
    logger.auth('Logout attempt started');
    try {
      await this.api.post(API_ENDPOINTS.AUTH.LOGOUT);
      logger.auth('Logout successful');
    } catch (error) {
      logger.auth('Logout API error', { message: error.message });
      // Continue with local cleanup even if API call fails
    } finally {
      this.clearStorage();
      return { success: true };
    }
  }

  async validateToken() {
    try {
      const response = await this.api.get(API_ENDPOINTS.AUTH.VALIDATE_TOKEN);
      const { valid, user } = response.data;
      
      if (valid && user) {
        const userWithAdmin = {
          ...user,
          role: user.user_metadata?.role || user.role || 'user',
          isAdmin: user.user_metadata?.role === 'admin' || user.role === 'admin'
        };
        this.setUser(userWithAdmin);
      }
      
      return valid;
    } catch (error) {
      logger.auth('Token validation failed');
      return false;
    }
  }

  // Secure storage methods with error handling
  setUser(user) {
    if (!user) return false;
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.USER, JSON.stringify(user));
      return true;
    } catch (error) {
      logger.auth('Failed to store user', { error: error.message });
      return false;
    }
  }

  setToken(token) {
    if (!token) return false;
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN, token);
      return true;
    } catch (error) {
      logger.auth('Failed to store token', { error: error.message });
      return false;
    }
  }

  setRefreshToken(token) {
    if (!token) return false;
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN, token);
      return true;
    } catch (error) {
      logger.auth('Failed to store refresh token', { error: error.message });
      return false;
    }
  }

  getToken() {
    try {
      return localStorage.getItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN);
    } catch (error) {
      logger.auth('Failed to get token', { error: error.message });
      return null;
    }
  }

  getRefreshToken() {
    try {
      return localStorage.getItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN);
    } catch (error) {
      logger.auth('Failed to get refresh token', { error: error.message });
      return null;
    }
  }

  getUser() {
    try {
      const userString = localStorage.getItem(LOCAL_STORAGE_KEYS.USER);
      return userString ? JSON.parse(userString) : null;
    } catch (error) {
      logger.auth('Failed to get user', { error: error.message });
      return null;
    }
  }

  clearStorage() {
    logger.auth('Clearing auth storage');
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.USER);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.REMEMBER_ME);
      csrfProtection.clearToken();
    } catch (error) {
      logger.auth('Failed to clear storage', { error: error.message });
    }
  }

  isAuthenticated() {
    return !!this.getToken();
  }

  setRememberMe(value) {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.REMEMBER_ME, value.toString());
    } catch (error) {
      logger.auth('Failed to set remember me', { error: error.message });
    }
  }

  getRememberMe() {
    try {
      return localStorage.getItem(LOCAL_STORAGE_KEYS.REMEMBER_ME) === 'true';
    } catch (error) {
      logger.auth('Failed to get remember me', { error: error.message });
      return false;
    }
  }

  async refreshToken() {
    try {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      
      const response = await this.api.post(API_ENDPOINTS.AUTH.REFRESH_TOKEN, { refreshToken });
      const { token, refreshToken: newRefreshToken, user } = response.data;
      
      this.setToken(token);
      this.setRefreshToken(newRefreshToken);
      this.setUser(user);
      
      return { success: true, user };
    } catch (error) {
      this.clearStorage();
      return errorHandler.handleAuthError(error, 'token refresh');
    }
  }

  async forgotPassword(email) {
    logger.auth('Forgot password attempt started');
    
    // Input validation
    if (!email || !isValidEmail(email)) {
      return { success: false, error: 'Valid email is required' };
    }
    
    try {
      const sanitizedEmail = sanitizeInput(email.toLowerCase().trim());
      await this.api.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email: sanitizedEmail });
      logger.auth('Forgot password request successful');
      return { success: true };
    } catch (error) {
      return errorHandler.handleApiError(error, 'forgot password');
    }
  }

  async resetPassword(token, newPassword) {
    logger.auth('Password reset attempt started');
    
    // Input validation
    if (!token || !newPassword) {
      return { success: false, error: 'Token and new password are required' };
    }
    
    if (!isValidPassword(newPassword)) {
      return { success: false, error: 'Password must be at least 8 characters' };
    }
    
    try {
      await this.api.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, { 
        token: sanitizeInput(token), 
        newPassword 
      });
      logger.auth('Password reset successful');
      return { success: true };
    } catch (error) {
      return errorHandler.handleApiError(error, 'password reset');
    }
  }

  async updateProfile(userData) {
    logger.auth('Profile update attempt started');
    
    try {
      // Sanitize inputs
      const sanitizedData = sanitizeUserData({
        ...userData,
        email: userData.email ? userData.email.toLowerCase().trim() : undefined
      });
      
      // Validate email if provided
      if (sanitizedData.email && !isValidEmail(sanitizedData.email)) {
        return { success: false, error: 'Invalid email format' };
      }
      
      const response = await this.api.put(API_ENDPOINTS.USER.UPDATE_PROFILE, sanitizedData);
      const { user } = response.data;
      
      this.setUser(user);
      logger.auth('Profile update successful');
      return { success: true, user };
    } catch (error) {
      return errorHandler.handleApiError(error, 'profile update');
    }
  }
}

const authService = new AuthService();
export default authService;