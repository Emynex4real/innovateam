import apiService from './api.service';
import logger from '../utils/logger';

class WalletService {
  async getBalance() {
    try {
      logger.service('Getting wallet balance');
      const response = await apiService.get('/wallet/balance');
      return response.data?.balance || 0;
    } catch (error) {
      logger.service('Failed to get balance', { error: error.message });
      throw new Error(error.response?.data?.message || 'Failed to fetch balance');
    }
  }

  async fundWallet(amount, paymentMethod = 'card') {
    try {
      logger.service('Funding wallet', { amount, paymentMethod });
      const response = await apiService.post('/wallet/fund', {
        amount: parseFloat(amount),
        paymentMethod
      });
      logger.service('Wallet funded successfully');
      return response.data || response;
    } catch (error) {
      logger.service('Failed to fund wallet', { error: error.message });
      throw new Error(error.response?.data?.message || 'Failed to fund wallet');
    }
  }

  async deductFromWallet(amount, description) {
    try {
      logger.service('Deducting from wallet', { amount, description });
      const response = await apiService.post('/wallet/deduct', {
        amount: parseFloat(amount),
        description
      });
      logger.service('Wallet deduction successful');
      return response.data || response;
    } catch (error) {
      logger.service('Failed to deduct from wallet', { error: error.message });
      throw new Error(error.response?.data?.message || 'Failed to process payment');
    }
  }

  async getTransactions() {
    try {
      logger.service('Getting wallet transactions');
      const response = await apiService.get('/wallet/transactions');
      return response.data || [];
    } catch (error) {
      logger.service('Failed to get transactions', { error: error.message });
      throw new Error(error.response?.data?.message || 'Failed to fetch transactions');
    }
  }

  async getStats() {
    try {
      logger.service('Getting wallet stats');
      const response = await apiService.get('/wallet/stats');
      return response.data || {};
    } catch (error) {
      logger.service('Failed to get wallet stats', { error: error.message });
      throw new Error(error.response?.data?.message || 'Failed to fetch wallet stats');
    }
  }
}

const walletService = new WalletService();
export default walletService;