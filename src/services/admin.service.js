import axios from 'axios';
import { LOCAL_STORAGE_KEYS } from '../config/constants';
import API_BASE_URL from '../config/api';

const API_URL = API_BASE_URL || 'http://localhost:5000/api';

class AdminService {
  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      headers: { 'Content-Type': 'application/json' },
      timeout: 15000,
    });

    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
  }

  async getStats() {
    try {
      const response = await this.api.get('/admin/stats');
      return response.data.stats || response.data.data || response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch stats');
    }
  }

  async getDashboardMetrics() {
    return this.getStats();
  }

  async getUsers(page = 1, limit = 20, search = '', role = '') {
    try {
      const params = new URLSearchParams({ page, limit });
      if (search) params.append('search', search);
      if (role) params.append('role', role);
      
      const response = await this.api.get(`/admin/users?${params}`);
      return response.data.data; // Return the users array directly
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch users');
    }
  }

  async getUserDetails(userId) {
    try {
      const response = await this.api.get(`/admin/users/${userId}`);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to fetch user details' };
    }
  }

  async updateUserRole(userId, role) {
    try {
      const response = await this.api.post(`/admin/users/${userId}/role`, { role });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update user role');
    }
  }

  async updateUser(userId, userData) {
    try {
      const response = await this.api.put(`/admin/users/${userId}`, userData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update user');
    }
  }

  async addUser(userData) {
    try {
      const response = await this.api.post('/admin/users', userData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to add user');
    }
  }

  async activateUser(userId) {
    try {
      const response = await this.api.post(`/admin/users/${userId}/activate`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to activate user');
    }
  }

  async deactivateUser(userId) {
    try {
      const response = await this.api.post(`/admin/users/${userId}/deactivate`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to deactivate user');
    }
  }

  async deleteUser(userId) {
    try {
      const response = await this.api.delete(`/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete user');
    }
  }

  async getSystemInfo() {
    try {
      const response = await this.api.get('/admin/system-info');
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to fetch system info' };
    }
  }

  async getTransactions(page = 1, limit = 100) {
    try {
      const response = await this.api.get(`/admin/transactions?page=${page}&limit=${limit}`);
      return response.data.data || response.data.transactions || response.data || [];
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch transactions');
    }
  }

  async updateTransaction(transactionId, updateData) {
    try {
      const response = await this.api.put(`/admin/transactions/${transactionId}`, updateData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update transaction');
    }
  }

  async deleteTransaction(transactionId) {
    try {
      const response = await this.api.delete(`/admin/transactions/${transactionId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete transaction');
    }
  }

  async getUserTransactions(userId, page = 1, limit = 10) {
    try {
      const response = await this.api.get(`/admin/users/${userId}/transactions?page=${page}&limit=${limit}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to fetch user transactions' };
    }
  }

  // Real-time data polling
  startRealTimeUpdates(callback, interval = 30000) {
    const updateData = async () => {
      const stats = await this.getStats();
      if (stats.success) {
        callback(stats.data);
      }
    };
    
    updateData(); // Initial load
    return setInterval(updateData, interval);
  }

  stopRealTimeUpdates(intervalId) {
    if (intervalId) {
      clearInterval(intervalId);
    }
  }
}

const adminService = new AdminService();
export default adminService;