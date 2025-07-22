import axios from 'axios';
import { API_BASE_URL, LOCAL_STORAGE_KEYS } from '../config/constants';

// Enhanced logging function
const logger = {
  info: (method, message, data = {}) => {
    const logData = {
      timestamp: new Date().toISOString(),
      method,
      ...data
    };
    console.log(`[AdminService:${method}] ${message}`, logData);
  },
  error: (method, error, context = {}) => {
    const errorInfo = {
      timestamp: new Date().toISOString(),
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      method: error.config?.method,
      hasToken: !!localStorage.getItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN),
      ...context
    };
    console.error(`[AdminService:${method}] Error:`, errorInfo);
    return errorInfo;
  }
};

class AdminService {
  constructor() {
    logger.info('constructor', 'Initializing AdminService');
    
    this.api = axios.create({
      baseURL: `${API_BASE_URL}/admin`,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      withCredentials: true
    });

    // Request interceptor for logging and auth
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        logger.info('request', `Sending ${config.method?.toUpperCase()} to ${config.url}`, {
          url: config.url,
          method: config.method,
          hasToken: !!token
        });
        return config;
      },
      (error) => {
        logger.error('request', error, { stage: 'request-interceptor' });
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => {
        logger.info('response', `Received ${response.status} from ${response.config.url}`, {
          status: response.status,
          url: response.config.url,
          data: response.data
        });
        return response;
      },
      (error) => {
        const errorInfo = logger.error('response', error, { 
          stage: 'response-interceptor',
          url: error.config?.url,
          method: error.config?.method
        });
        
        // Handle specific error statuses
        if (error.response) {
          if (error.response.status === 401) {
            // Handle unauthorized (e.g., token expired)
            logger.info('response', 'Authentication required, redirecting to login');
            // You might want to trigger a logout or token refresh here
          } else if (error.response.status === 403) {
            logger.info('response', 'Insufficient permissions');
          }
        }
        
        return Promise.reject(error);
      }
    );
  }

  // Users
  async getUsers(params = {}) {
    const method = 'getUsers';
    logger.info(method, 'Fetching users', { params });
    
    try {
      const response = await this.api.get('/users', { params });
      logger.info(method, 'Successfully fetched users', { count: response.data?.length });
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  async getUser(id) {
    try {
      const response = await this.api.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      logger.error('getUser', error);
      throw error;
    }
  }

  /**
   * Fetches transactions with optional filtering
   * @param {Object} params - Query parameters for filtering
   * @returns {Promise<Array>} Array of transactions
   */
  async getTransactions(params = {}) {
    const method = 'getTransactions';
    console.group(`[AdminService.${method}]`);
    
    try {
      console.log('Fetching transactions with params:', params);
      const token = localStorage.getItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN);
      
      if (!token) {
        const error = new Error('No authentication token found');
        error.code = 'MISSING_AUTH_TOKEN';
        throw error;
      }
      
      const response = await this.api.get('/transactions', { 
        params,
        timeout: 10000, // 10 second timeout
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      console.log('Transactions response:', {
        status: response.status,
        count: response.data?.transactions?.length || 0
      });
      
      // Ensure we always return an array, even if the response is malformed
      return response.data?.transactions || [];
      
    } catch (error) {
      const errorInfo = logger.error(method, error);
      
      // In development, return mock data if the API fails
      if (process.env.NODE_ENV === 'development') {
        console.warn('Using mock transactions data due to API error');
        return [
          {
            id: 'tx_mock_1',
            user: { 
              id: 'user_1',
              name: 'John Doe', 
              email: 'john@example.com' 
            },
            amount: 5000,
            type: 'purchase',
            status: 'completed',
            createdAt: new Date().toISOString(),
            description: 'Mock transaction 1'
          },
          {
            id: 'tx_mock_2',
            user: { 
              id: 'user_2',
              name: 'Jane Smith', 
              email: 'jane@example.com' 
            },
            amount: 7500,
            type: 'refund',
            status: 'pending',
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            description: 'Mock transaction 2'
          }
        ];
      }
      
      // Re-throw with more context
      const enhancedError = new Error(`Failed to fetch transactions: ${error.message}`);
      enhancedError.code = error.code || 'TRANSACTIONS_FETCH_ERROR';
      enhancedError.details = errorInfo;
      throw enhancedError;
      
    } finally {
      console.groupEnd();
    }
  }

  async addUser(userData) {
    try {
      const response = await this.api.post('/users', userData);
      return response.data;
    } catch (error) {
      console.error('Error adding user:', error);
      throw error;
    }
  }

  async updateUser(id, userData) {
    try {
      const response = await this.api.put(`/users/${id}`, userData);
      return response.data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  async deleteUser(id) {
    try {
      const response = await this.api.delete(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  // Transactions
  async getTransactions(params = {}) {
    console.log('[ADMIN SERVICE] getTransactions called');
    const token = localStorage.getItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN);
    console.log('[ADMIN SERVICE] Sending token:', token);
    try {
      const response = await this.api.get('/transactions', { params });
      return response.data;
      
    } catch (error) {
      // Enhanced error logging
      const errorDetails = {
        message: error.message,
        response: error.response ? {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        } : 'No response',
        config: {
          url: error.config?.url,
          method: error.config?.method,
          params: error.config?.params
        }
      };
      
      console.error('Error in getTransactions:', errorDetails);
      
      // Return mock data in development if the API fails
      if (process.env.NODE_ENV === 'development') {
        console.warn('Using mock transactions data due to API error');
        return {
          transactions: [
            {
              id: 'tx_mock_1',
              user: { name: 'John Doe', email: 'john@example.com' },
              amount: 5000,
              type: 'purchase',
              status: 'completed',
              createdAt: new Date().toISOString()
            },
            {
              id: 'tx_mock_2',
              user: { name: 'Jane Smith', email: 'jane@example.com' },
              amount: 7500,
              type: 'refund',
              status: 'pending',
              createdAt: new Date(Date.now() - 86400000).toISOString() // Yesterday
            }
          ]
        };
      }
      
      // Re-throw the error for the caller to handle
      throw error;
      
    } finally {
      console.groupEnd();
    }
  }

  async getTransaction(id) {
    try {
      const response = await this.api.get(`/transactions/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching transaction:', error);
      throw error;
    }
  }

  async updateTransaction(id, data) {
    try {
      const response = await this.api.put(`/transactions/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
  }

  async deleteTransaction(id) {
    try {
      const response = await this.api.delete(`/transactions/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  }

  // Services
  async getServices(params = {}) {
    try {
      const response = await this.api.get('/services', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching services:', error);
      throw error;
    }
  }

  async getService(id) {
    try {
      const response = await this.api.get(`/services/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching service:', error);
      throw error;
    }
  }

  async addService(serviceData) {
    try {
      const response = await this.api.post('/services', serviceData);
      return response.data;
    } catch (error) {
      console.error('Error adding service:', error);
      throw error;
    }
  }

  async updateService(id, serviceData) {
    try {
      const response = await this.api.put(`/services/${id}`, serviceData);
      return response.data;
    } catch (error) {
      console.error('Error updating service:', error);
      throw error;
    }
  }

  async deleteService(id) {
    try {
      const response = await this.api.delete(`/services/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting service:', error);
      throw error;
    }
  }

  // Dashboard Metrics
  async getDashboardMetrics() {
    try {
      console.log('Fetching dashboard metrics...');
      const response = await this.api.get('/metrics');
      console.log('Dashboard metrics response:', response.data);
      return response.data;
    } catch (error) {
      console.warn('Error fetching dashboard metrics, using mock data instead:', error.message);
      // Return mock data for development
      return {
        totalUsers: 42,
        totalTransactions: 128,
        revenue: 125000,
        totalServices: 8,
        recentTransactions: [
          { id: 1, user: 'user1@example.com', service: 'WAEC', amount: 5000, status: 'completed', date: new Date().toISOString() },
          { id: 2, user: 'user2@example.com', service: 'NECO', amount: 4500, status: 'pending', date: new Date().toISOString() },
          { id: 3, user: 'user3@example.com', service: 'JAMB', amount: 3500, status: 'completed', date: new Date().toISOString() }
        ]
      };
    }
  }
}

const adminService = new AdminService();
export default adminService; 