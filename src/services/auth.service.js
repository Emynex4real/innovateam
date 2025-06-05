import axios from 'axios';
import { LOCAL_STORAGE_KEYS } from '../config/constants';

class AuthService {
  constructor() {
    this.api = axios.create({
      baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add a request interceptor
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

    // Add a response interceptor
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // If the error is due to an expired token
        if (error.response.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = this.getRefreshToken();
            const response = await this.api.post('/auth/refresh-token', {
              refreshToken,
            });

            const { token } = response.data;
            this.setToken(token);

            // Retry the original request
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return this.api(originalRequest);
          } catch (refreshError) {
            // If refresh token is invalid, logout the user
            this.logout();
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
      console.log('Sending registration request to:', `${this.api.defaults.baseURL}/auth/register`);
      const response = await this.api.post('/auth/register', userData);
      console.log('Registration response:', response.data);
      
      const { token, refreshToken, user } = response.data;

      this.setToken(token);
      this.setRefreshToken(refreshToken);
      this.setUser(user);

      return { success: true, user };
    } catch (error) {
      console.error('Registration error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers,
        }
      });
      
      // Handle connection refused error
      if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
        return {
          success: false,
          error: 'Unable to connect to the server. Please make sure the server is running.'
        };
      }
      
      // Handle other types of errors
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Registration failed. Please try again.';
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  async logout() {
    try {
      const refreshToken = this.getRefreshToken();
      await this.api.post('/auth/logout', { refreshToken });
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: error.message };
    }
  }

  async validateToken() {
    try {
      const response = await this.api.get('/auth/validate');
      return response.data.valid;
    } catch (error) {
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
}

const authService = new AuthService();
export default authService; 