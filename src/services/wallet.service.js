import axios from 'axios';
import { LOCAL_STORAGE_KEYS } from '../config/constants';
import API_BASE_URL from '../config/api';

class WalletService {
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

  async getBalance() {
    try {
      const response = await this.api.get('/wallet/balance');
      return response.data.data.balance;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch balance');
    }
  }

  async fundWallet(amount, paymentMethod = 'card') {
    try {
      const response = await this.api.post('/wallet/fund', {
        amount,
        paymentMethod
      });
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fund wallet');
    }
  }

  async deductFromWallet(amount, description) {
    try {
      const response = await this.api.post('/wallet/deduct', {
        amount,
        description
      });
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to process payment');
    }
  }

  async getTransactions() {
    try {
      const response = await this.api.get('/wallet/transactions');
      return response.data.data || [];
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch transactions');
    }
  }

  async getStats() {
    try {
      const response = await this.api.get('/wallet/stats');
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch wallet stats');
    }
  }
}

const walletService = new WalletService();
export default walletService;