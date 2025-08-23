import axios from 'axios';
import { LOCAL_STORAGE_KEYS } from '../config/constants';
import API_BASE_URL from '../config/api';

class TransactionService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
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

  async getUserTransactions() {
    try {
      const response = await this.api.get('/transactions');
      return response.data.data || [];
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch transactions');
    }
  }

  async createTransaction(transactionData) {
    try {
      const response = await this.api.post('/transactions', transactionData);
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create transaction');
    }
  }

  async getTransaction(id) {
    try {
      const response = await this.api.get(`/transactions/${id}`);
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch transaction');
    }
  }

  async updateTransaction(id, updateData) {
    try {
      const response = await this.api.put(`/transactions/${id}`, updateData);
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update transaction');
    }
  }

  async deleteTransaction(id) {
    try {
      const response = await this.api.delete(`/transactions/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete transaction');
    }
  }

  async getTransactionStats() {
    try {
      const response = await this.api.get('/transactions/stats');
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch transaction stats');
    }
  }
}

const transactionService = new TransactionService();
export default transactionService;