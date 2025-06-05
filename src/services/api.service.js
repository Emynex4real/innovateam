import axios from 'axios';
import { toast } from 'react-toastify';
import { ERROR_MESSAGES } from '../config/constants';
import authService from './auth.service';
import logger from './logger.service';

class ApiService {
  constructor() {
    this.client = axios.create({
      baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000, // 10 seconds
    });

    this.setupInterceptors();
  }

  setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        logger.debug('API Request:', {
          method: config.method,
          url: config.url,
          data: config.data,
          params: config.params,
        });

        // Add authorization header
        const token = authService.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Add timestamp to prevent caching
        config.params = {
          ...config.params,
          _t: Date.now(),
        };

        return config;
      },
      (error) => {
        logger.error('Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        logger.debug('API Response:', {
          status: response.status,
          data: response.data,
          url: response.config.url,
        });
        return response.data;
      },
      async (error) => {
        if (!error.response) {
          logger.error('Network Error:', error);
          toast.error(ERROR_MESSAGES.NETWORK_ERROR);
          return Promise.reject(new Error(ERROR_MESSAGES.NETWORK_ERROR));
        }

        const { status, data, config } = error.response;

        logger.error('API Error:', {
          status,
          data,
          url: config.url,
          method: config.method,
        });

        switch (status) {
          case 400:
            toast.error(data.message || ERROR_MESSAGES.VALIDATION_ERROR);
            break;
          case 401:
            if (!error.config._retry) {
              error.config._retry = true;
              try {
                await authService.refreshToken();
                return this.client(error.config);
              } catch (refreshError) {
                logger.error('Token Refresh Error:', refreshError);
                authService.logout();
                toast.error(ERROR_MESSAGES.UNAUTHORIZED);
              }
            }
            break;
          case 403:
            toast.error(ERROR_MESSAGES.FORBIDDEN);
            break;
          case 404:
            toast.error(ERROR_MESSAGES.NOT_FOUND);
            break;
          case 500:
            toast.error(ERROR_MESSAGES.SERVER_ERROR);
            break;
          default:
            toast.error(data.message || ERROR_MESSAGES.SERVER_ERROR);
        }

        return Promise.reject(error);
      }
    );
  }

  // Generic request method
  async request(method, url, data = null, config = {}) {
    try {
      const response = await this.client({
        method,
        url,
        data,
        ...config,
      });
      return response;
    } catch (error) {
      throw error;
    }
  }

  // HTTP method wrappers
  async get(url, config = {}) {
    return this.request('get', url, null, config);
  }

  async post(url, data, config = {}) {
    return this.request('post', url, data, config);
  }

  async put(url, data, config = {}) {
    return this.request('put', url, data, config);
  }

  async patch(url, data, config = {}) {
    return this.request('patch', url, data, config);
  }

  async delete(url, config = {}) {
    return this.request('delete', url, null, config);
  }

  // File upload helper
  async uploadFile(url, file, onUploadProgress = null) {
    const formData = new FormData();
    formData.append('file', file);

    logger.info('Uploading file:', {
      url,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    });

    return this.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: onUploadProgress
        ? (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onUploadProgress(percentCompleted);
            logger.debug('Upload progress:', {
              url,
              fileName: file.name,
              progress: percentCompleted,
            });
          }
        : undefined,
    });
  }

  // Batch request helper
  async batch(requests) {
    logger.info('Starting batch request:', {
      requestCount: requests.length,
      requests: requests.map(({ method, url }) => ({ method, url })),
    });

    return Promise.all(
      requests.map((request) => {
        const { method = 'get', url, data, config = {} } = request;
        return this.request(method, url, data, config);
      })
    );
  }
}

const apiService = new ApiService();
export default apiService; 