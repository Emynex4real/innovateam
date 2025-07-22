import axios from 'axios';
import { 
  LOCAL_STORAGE_KEYS, 
  API_BASE_URL,
  API_ENDPOINTS 
} from '../config/constants';

// Fallback API URL if not defined in constants
const API_URL = API_BASE_URL || 'http://localhost:5001/api';

// Debug logging function for auth service
const debugAuthService = (message, data = {}) => {
  if (process.env.NODE_ENV !== 'production') {
    const timestamp = new Date().toISOString();
    console.log(`[AuthService:${timestamp}] ${message}`, data);
  }
};

class AuthService {
  constructor() {
    this.initialized = false;
    this.initialize();
  }

  initialize() {
    if (this.initialized) return;
    
    debugAuthService('Initializing AuthService');
    
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
          debugAuthService('Added auth token to request', { 
            url: config.url,
            method: config.method,
            hasToken: !!token
          });
        }
        return config;
      },
      (error) => {
        debugAuthService('Request interceptor error', { error: error.message });
        return Promise.reject(error);
      }
    );

    // Add response interceptor to handle token refresh
    this.api.interceptors.response.use(
      (response) => {
        debugAuthService('API response', {
          url: response.config.url,
          status: response.status,
          method: response.config.method
        });
        return response;
      },
      async (error) => {
        const originalRequest = error.config;
        const status = error.response?.status;
        
        debugAuthService('API error', {
          url: originalRequest?.url,
          method: originalRequest?.method,
          status,
          message: error.message,
          isRetry: originalRequest?._retry || false
        });

        // If the error is 401 and we haven't already tried to refresh
        if (status === 401 && !originalRequest?._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = this.getRefreshToken();
            if (!refreshToken) {
              debugAuthService('No refresh token available, cannot refresh');
              this.clearStorage();
              return Promise.reject(error);
            }

            debugAuthService('Attempting to refresh token...');
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
              debugAuthService('Token refresh successful');
              this.setToken(token);
              this.setUser(user);
              
              // Update the original request with the new token
              originalRequest.headers.Authorization = `Bearer ${token}`;
              
              // Log the retry
              debugAuthService('Retrying original request with new token', {
                url: originalRequest.url,
                method: originalRequest.method
              });
              
              return this.api(originalRequest);
            }
          } catch (refreshError) {
            debugAuthService('Token refresh failed', { 
              error: refreshError.message,
              status: refreshError.response?.status,
              data: refreshError.response?.data
            });
            
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
    debugAuthService('Login attempt started', { email: credentials.email });
    try {
      const response = await this.api.post('/auth/login', credentials);
      const { token, refreshToken, user } = response.data;
      
      debugAuthService('Login API response received', { 
        hasToken: !!token, 
        hasRefreshToken: !!refreshToken,
        user: { id: user?.id, email: user?.email }
      });

      // Ensure user object includes isAdmin
      if (user && typeof user.isAdmin === 'undefined') {
        user.isAdmin = false;
      }
      
      this.setToken(token);
      this.setRefreshToken(refreshToken);
      this.setUser(user);

      // Verify storage
      const storedToken = this.getToken();
      const storedUser = this.getUser();
      
      debugAuthService('After storage verification', {
        tokenStored: !!storedToken,
        userStored: !!storedUser,
        storedUserMatch: storedUser?.id === user?.id
      });

      return { success: true, user };
    } catch (error) {
      debugAuthService('Login error', {
        error: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
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
        debugAuthService('No token found for validation');
        return false;
      }

      debugAuthService('Validating token with server');
      const response = await this.api.get('/auth/validate');
      const { valid, user } = response.data;
      
      debugAuthService('Token validation response', { 
        valid, 
        userId: user?.id,
        userEmail: user?.email 
      });
      
      if (valid && user) {
        // Always preserve the existing isAdmin status
        const currentUser = this.getUser();
        if (currentUser) {
          user.isAdmin = currentUser.isAdmin;
          debugAuthService('Preserved isAdmin status', { isAdmin: user.isAdmin });
        }
        this.setUser(user);
      }
      
      return valid;
    } catch (error) {
      console.error('Token validation error:', error.response?.data || error.message);
      debugAuthService('Token validation failed', {
        error: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      return false;
    }
  }

  // Token management
  setToken(token) {
    try {
      if (!token) {
        debugAuthService('No token provided to setToken');
        return;
      }
      
      debugAuthService('Setting auth token', { 
        tokenPrefix: token.substring(0, 10) + '...',
        length: token.length 
      });
      
      localStorage.setItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN, token);
      
      // Verify the token was set correctly
      const storedToken = localStorage.getItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN);
      if (storedToken !== token) {
        throw new Error('Token verification failed after storage');
      }
      
      debugAuthService('Auth token set and verified');
      
      // Update last action timestamp
      localStorage.setItem(LOCAL_STORAGE_KEYS.LAST_AUTH_ACTION, new Date().toISOString());
      
    } catch (error) {
      const errorMsg = `Error setting auth token: ${error.message}`;
      console.error(errorMsg, error);
      debugAuthService(errorMsg, { error });
      throw new Error('Failed to set auth token');
    }
  }

  getToken() {
    try {
      const token = localStorage.getItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN);
      debugAuthService('Retrieved auth token', { 
        exists: !!token,
        length: token?.length || 0
      });
      return token;
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  setRefreshToken(token) {
    try {
      if (!token) {
        debugAuthService('No refresh token provided to setRefreshToken');
        return;
      }
      
      debugAuthService('Setting refresh token', { 
        tokenPrefix: token.substring(0, 10) + '...',
        length: token.length 
      });
      
      localStorage.setItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN, token);
      
      // Verify the refresh token was set correctly
      const storedToken = localStorage.getItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN);
      if (storedToken !== token) {
        throw new Error('Refresh token verification failed after storage');
      }
      
      debugAuthService('Refresh token set and verified');
      
    } catch (error) {
      const errorMsg = `Error setting refresh token: ${error.message}`;
      console.error(errorMsg, error);
      debugAuthService(errorMsg, { error });
      throw new Error('Failed to set refresh token');
    }
  }

  getRefreshToken() {
    try {
      const token = localStorage.getItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN);
      debugAuthService('Retrieved refresh token', { 
        exists: !!token,
        length: token?.length || 0
      });
      return token;
    } catch (error) {
      console.error('Error getting refresh token:', error);
      return null;
    }
  }

  // User management
  setUser(user) {
    try {
      if (!user) {
        debugAuthService('No user data provided to setUser');
        return;
      }
      
      debugAuthService('Setting user data', { 
        userId: user.id,
        email: user.email 
      });
      
      const userString = JSON.stringify(user);
      localStorage.setItem(LOCAL_STORAGE_KEYS.USER, userString);
      
      // Verify the user was set correctly
      const storedUser = localStorage.getItem(LOCAL_STORAGE_KEYS.USER);
      if (!storedUser) {
        throw new Error('User verification failed after storage');
      }
      
      debugAuthService('User data set and verified');
      
    } catch (error) {
      const errorMsg = `Error setting user data: ${error.message}`;
      console.error(errorMsg, error);
      debugAuthService(errorMsg, { error });
      throw new Error('Failed to set user data');
    }
  }

  getUser() {
    try {
      const userString = localStorage.getItem(LOCAL_STORAGE_KEYS.USER);
      const user = userString ? JSON.parse(userString) : null;
      
      debugAuthService('Retrieved user data', { 
        exists: !!user,
        userId: user?.id,
        email: user?.email
      });
      
      return user;
    } catch (error) {
      const errorMsg = `Error parsing user data: ${error.message}`;
      console.error(errorMsg, error);
      debugAuthService(errorMsg, { error });
      return null;
    }
  }

  // Clear all auth data
  clearStorage() {
    debugAuthService('Clearing auth storage');
    try {
      const hadToken = !!this.getToken();
      const hadUser = !!this.getUser();
      const hadRefreshToken = !!this.getRefreshToken();
      
      debugAuthService('Current storage state before clear', {
        hasToken: hadToken,
        hasUser: hadUser,
        hasRefreshToken: hadRefreshToken
      });
      
      localStorage.removeItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.USER);
      
      // Verify everything was cleared
      const currentToken = localStorage.getItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN);
      const currentUser = localStorage.getItem(LOCAL_STORAGE_KEYS.USER);
      const currentRefreshToken = localStorage.getItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN);
      
      debugAuthService('Auth storage cleared', { 
        hadToken, 
        hadUser, 
        hadRefreshToken,
        currentToken: !!currentToken,
        currentUser: !!currentUser,
        currentRefreshToken: !!currentRefreshToken
      });
      
      if (currentToken || currentUser || currentRefreshToken) {
        debugAuthService('WARNING: Failed to clear all auth data', {
          tokenCleared: !currentToken,
          userCleared: !currentUser,
          refreshTokenCleared: !currentRefreshToken
        });
      }
    } catch (error) {
      debugAuthService('Error clearing storage', { 
        error: error.message,
        stack: error.stack 
      });
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
        throw new Error('No refresh token available');
      }

      const response = await this.api.post('/auth/refresh-token', {
        refreshToken,
      });

      const { token, refreshToken: newRefreshToken, user } = response.data;
      
      // Ensure user object includes isAdmin
      if (user && typeof user.isAdmin === 'undefined') {
        const currentUser = this.getUser();
        user.isAdmin = currentUser?.isAdmin || false;
      }
      
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