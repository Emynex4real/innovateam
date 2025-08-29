import axios from 'axios';
import { toast } from 'react-toastify';
import { ERROR_MESSAGES, API_ENDPOINTS } from '../config/constants';
import { API_BASE_URL } from '../config/api';
import logger from '../utils/logger';
import csrfProtection from '../utils/csrf';
import errorHandler from '../utils/errorHandler';
import { sanitizeForLog } from '../utils/validation';

/**
 * Secure API Service with CSRF protection, proper error handling,
 * and security best practices
 */
class ApiService {
  constructor() {
    this.initialized = false;
    this.retryAttempts = new Map();
    this.maxRetries = 3;
    this.initialize();
  }

  initialize() {
    if (this.initialized) return;

    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
        ...(process.env.NODE_ENV === 'production' && {
          'X-Requested-With': 'XMLHttpRequest' // CSRF protection only in production
        })
      },
      timeout: 15000, // 15 seconds
      withCredentials: process.env.NODE_ENV === 'production' // Enable cookies only in production
    });

    this.setupInterceptors();
    this.initialized = true;
    logger.service('API Service initialized');
  }

  setupInterceptors() {
    // Request interceptor with security features
    this.client.interceptors.request.use(
      (config) => {
        // Add authorization token
        const token = localStorage.getItem('token'); // Use same key as auth service
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Add CSRF token for state-changing requests (only in production)
        if (process.env.NODE_ENV === 'production' && csrfProtection.needsProtection(config.method)) {
          const csrfHeaders = csrfProtection.getTokenForHeader();
          Object.assign(config.headers, csrfHeaders);
        }

        // Add cache-busting parameter
        if (config.method?.toLowerCase() === 'get') {
          config.params = {
            ...config.params,
            _t: Date.now()
          };
        }

        // Log request (sanitized)
        logger.service('API Request', {
          method: config.method?.toUpperCase(),
          url: sanitizeForLog(config.url || ''),
          hasData: !!config.data,
          hasToken: !!token
        });

        return config;
      },
      (error) => {
        logger.service('Request interceptor error', { 
          message: sanitizeForLog(error.message) 
        });
        return Promise.reject(error);
      }
    );

    // Response interceptor with enhanced error handling
    this.client.interceptors.response.use(
      (response) => {
        // Log successful response
        logger.service('API Response', {
          status: response.status,
          url: sanitizeForLog(response.config?.url || '')
        });

        // Clear retry attempts on success
        const requestKey = this.getRequestKey(response.config);
        this.retryAttempts.delete(requestKey);

        return response.data;
      },
      async (error) => {
        return this.handleResponseError(error);
      }
    );
  }

  async handleResponseError(error) {
    const requestKey = this.getRequestKey(error.config);
    const currentAttempts = this.retryAttempts.get(requestKey) || 0;

    // Handle network errors
    if (!error.response) {
      if (currentAttempts < this.maxRetries && errorHandler.isRetryableError(error)) {
        return this.retryRequest(error, requestKey, currentAttempts);
      }
      
      const errorResponse = errorHandler.handleApiError(error, 'network');
      toast.error(errorResponse.error);
      return Promise.reject(errorResponse);
    }

    const { status, config } = error.response;
    const context = `${config?.method?.toUpperCase()} ${config?.url}`;

    // Handle specific status codes
    switch (status) {
      case 401:
        return this.handleUnauthorized(error, requestKey, currentAttempts);
      case 429:
      case 500:
      case 502:
      case 503:
      case 504:
        if (currentAttempts < this.maxRetries) {
          return this.retryRequest(error, requestKey, currentAttempts);
        }
        break;
    }

    // Handle all other errors
    const errorResponse = errorHandler.handleApiError(error, context);
    
    // Show toast for user-facing errors
    if (status !== 431) { // Don't show toast for header size errors
      toast.error(errorResponse.error);
    }

    return Promise.reject(errorResponse);
  }

  async handleUnauthorized(error, requestKey, currentAttempts) {
    if (currentAttempts > 0) {
      // Already tried to refresh, logout user
      const errorResponse = errorHandler.handleAuthError(error, 'authentication');
      toast.error(errorResponse.error);
      
      // Trigger logout through auth service
      if (typeof window !== 'undefined' && window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('auth:logout'));
      }
      
      return Promise.reject(errorResponse);
    }

    // Try to refresh token
    try {
      this.retryAttempts.set(requestKey, currentAttempts + 1);
      
      // Import auth service dynamically to avoid circular dependency
      const { default: authService } = await import('./auth.service');
      const { success } = await authService.refreshToken();
      
      if (success) {
        // Retry original request
        return this.client(error.config);
      } else {
        throw new Error('Token refresh failed');
      }
    } catch (refreshError) {
      const errorResponse = errorHandler.handleAuthError(refreshError, 'token refresh');
      toast.error(errorResponse.error);
      
      // Trigger logout
      if (typeof window !== 'undefined' && window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('auth:logout'));
      }
      
      return Promise.reject(errorResponse);
    }
  }

  async retryRequest(error, requestKey, currentAttempts) {
    const delay = errorHandler.getRetryDelay(currentAttempts + 1);
    this.retryAttempts.set(requestKey, currentAttempts + 1);
    
    logger.service('Retrying request', {
      attempt: currentAttempts + 1,
      delay,
      url: sanitizeForLog(error.config?.url || '')
    });

    await new Promise(resolve => setTimeout(resolve, delay));
    return this.client(error.config);
  }

  getRequestKey(config) {
    return `${config?.method || 'unknown'}:${config?.url || 'unknown'}`;
  }

  // Generic request method with error handling
  async request(method, url, data = null, config = {}) {
    try {
      const response = await this.client({
        method,
        url,
        data,
        ...config
      });
      return response;
    } catch (error) {
      // Error is already handled by interceptor
      throw error;
    }
  }

  // HTTP method wrappers
  async get(url, config = {}) {
    return this.request('GET', url, null, config);
  }

  async post(url, data, config = {}) {
    return this.request('POST', url, data, config);
  }

  async put(url, data, config = {}) {
    return this.request('PUT', url, data, config);
  }

  async patch(url, data, config = {}) {
    return this.request('PATCH', url, data, config);
  }

  async delete(url, config = {}) {
    return this.request('DELETE', url, null, config);
  }

  // Secure file upload with validation
  async uploadFile(url, file, options = {}) {
    const { onUploadProgress, maxSize = 5 * 1024 * 1024 } = options; // 5MB default

    // Validate file size
    if (file.size > maxSize) {
      throw new Error(`File size exceeds ${maxSize / 1024 / 1024}MB limit`);
    }

    const formData = new FormData();
    formData.append('file', file);

    logger.service('File upload started', {
      fileName: sanitizeForLog(file.name),
      fileSize: file.size,
      fileType: sanitizeForLog(file.type)
    });

    return this.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: onUploadProgress
        ? (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onUploadProgress(percentCompleted);
          }
        : undefined,
      timeout: 60000 // 60 seconds for file uploads
    });
  }

  // Batch requests with concurrency control
  async batch(requests, options = {}) {
    const { concurrency = 3 } = options;
    
    logger.service('Batch request started', {
      requestCount: requests.length,
      concurrency
    });

    // Process requests in batches to avoid overwhelming the server
    const results = [];
    for (let i = 0; i < requests.length; i += concurrency) {
      const batch = requests.slice(i, i + concurrency);
      const batchPromises = batch.map(async (request) => {
        const { method = 'GET', url, data, config = {} } = request;
        try {
          return await this.request(method, url, data, config);
        } catch (error) {
          return { error: error.message || 'Request failed' };
        }
      });
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }

    return results;
  }

  // Health check endpoint
  async healthCheck() {
    try {
      const response = await this.get('/health', { timeout: 5000 });
      return { healthy: true, ...response };
    } catch (error) {
      return { healthy: false, error: error.message };
    }
  }

  // Clear retry attempts (useful for testing)
  clearRetryAttempts() {
    this.retryAttempts.clear();
  }
}

// Create singleton instance
const apiService = new ApiService();

// Listen for auth logout events
if (typeof window !== 'undefined') {
  window.addEventListener('auth:logout', () => {
    apiService.clearRetryAttempts();
  });
}

export default apiService;