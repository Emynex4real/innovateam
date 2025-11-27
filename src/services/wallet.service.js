
import logger from '../utils/logger';
import { SecurityUtils } from '../config/security.enhanced';
import secureStorage from '../utils/secureStorage';
import cleanWalletService from './cleanWallet.service';

// Secure storage keys
const WALLET_KEY = 'wallet_balance';
const TRANSACTIONS_KEY = 'wallet_transactions';

function getLocalWallet() {
  const balance = secureStorage.getItem(WALLET_KEY);
  return parseFloat(balance) || 0;
}

function setLocalWallet(balance) {
  secureStorage.setItem(WALLET_KEY, balance);
}

function getLocalTransactions() {
  const transactions = secureStorage.getItem(TRANSACTIONS_KEY);
  return Array.isArray(transactions) ? transactions : [];
}

function setLocalTransactions(transactions) {
  secureStorage.setItem(TRANSACTIONS_KEY, transactions);
}

class WalletService {
  constructor() {
    // Initialize sample data on first load
    this.initializeSampleData();
  }

  async getBalance() {
    logger.service('Getting wallet balance');
    return await cleanWalletService.getBalance();
  }

  async fundWallet(amount, paymentMethod = 'card') {
    // Input validation
    if (!SecurityUtils.validateAmount(amount)) {
      throw new Error('Invalid amount');
    }
    
    const sanitizedMethod = SecurityUtils.sanitizeInput(paymentMethod);
    if (!['card', 'test'].includes(sanitizedMethod)) {
      throw new Error('Invalid payment method');
    }
    
    logger.service('Funding wallet', { amount, paymentMethod: sanitizedMethod });
    
    const validAmount = parseFloat(amount);
    
    if (validAmount > 1000000) {
      throw new Error('Amount exceeds maximum limit');
    }
    
    try {
      const result = await cleanWalletService.fundWallet(validAmount, sanitizedMethod);
      logger.service('Wallet funded successfully');
      return result;
    } catch (error) {
      logger.service('Wallet funding failed: ' + error.message);
      throw error;
    }
  }

  async deductFromWallet(amount, description) {
    // Input validation
    if (!SecurityUtils.validateAmount(amount)) {
      throw new Error('Invalid amount');
    }
    
    const sanitizedDesc = SecurityUtils.sanitizeInput(description);
    if (!sanitizedDesc || sanitizedDesc.length < 3) {
      throw new Error('Invalid description');
    }
    
    logger.service('Deducting from wallet', { amount, description: sanitizedDesc });
    
    const validAmount = parseFloat(amount);
    
    try {
      const result = await cleanWalletService.deductFromWallet(validAmount, sanitizedDesc);
      logger.service('Wallet deduction successful');
      return result;
    } catch (error) {
      logger.service('Wallet deduction failed: ' + error.message);
      throw error;
    }
  }

  async getTransactions() {
    logger.service('Getting wallet transactions');
    return getLocalTransactions();
  }

  async getStats() {
    logger.service('Getting wallet stats');
    const balance = getLocalWallet();
    const transactions = getLocalTransactions();
    return { balance, transactions };
  }

  // Clear all wallet data (for testing)
  clearWalletData() {
    localStorage.removeItem(WALLET_KEY);
    localStorage.removeItem(TRANSACTIONS_KEY);
    this.initializeSampleData();
  }

  // Initialize sample data for demo purposes
  initializeSampleData() {
    const existingTransactions = getLocalTransactions();
    if (existingTransactions.length === 0) {
      const sampleTransactions = [
        {
          id: Date.now() - 86400000 * 5,
          label: 'WAEC Result Checker',
          description: 'WAEC Result Checker Service',
          amount: 3400,
          type: 'debit',
          category: 'education',
          status: 'completed',
          date: new Date(Date.now() - 86400000 * 5).toISOString()
        },
        {
          id: Date.now() - 86400000 * 3,
          label: 'Wallet Funded',
          description: 'Funded wallet via card',
          amount: 5000,
          type: 'credit',
          category: 'funding',
          status: 'completed',
          date: new Date(Date.now() - 86400000 * 3).toISOString()
        },
        {
          id: Date.now() - 86400000 * 2,
          label: 'O-Level Upload',
          description: 'O-Level Result Upload Service',
          amount: 1000,
          type: 'debit',
          category: 'education',
          status: 'completed',
          date: new Date(Date.now() - 86400000 * 2).toISOString()
        },
        {
          id: Date.now() - 86400000,
          label: 'AI Examiner',
          description: 'AI Examiner Practice Test',
          amount: 750,
          type: 'debit',
          category: 'education',
          status: 'completed',
          date: new Date(Date.now() - 86400000).toISOString()
        }
      ];
      setLocalTransactions(sampleTransactions);
      // Adjust balance to reflect transactions
      let currentBalance = 10000;
      sampleTransactions.forEach(tx => {
        if (tx.type === 'credit') {
          currentBalance += tx.amount;
        } else {
          currentBalance -= tx.amount;
        }
      });
      setLocalWallet(currentBalance);
    }
  }
}

const walletService = new WalletService();
export default walletService;