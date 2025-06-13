import axios from 'axios';
import { API_BASE_URL } from '../config/constants';

class AdminService {
  constructor() {
    this.api = axios.create({
      baseURL: `${API_BASE_URL}/admin`,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true
    });

    // Add request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
  }

  // Users
  async getUsers(params = {}) {
    try {
      const response = await this.api.get('/users', { params });
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
      console.error('Error fetching user:', error);
      throw error;
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
    try {
      const response = await this.api.get('/transactions', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
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
      const response = await this.api.get('/metrics');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
      throw error;
    }
  }
}

const adminService = new AdminService();
export default adminService; 