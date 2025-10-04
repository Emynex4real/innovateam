
import logger from '../utils/logger';

// LocalStorage keys
const WALLET_KEY = 'wallet_balance';
const TRANSACTIONS_KEY = 'wallet_transactions';

function getLocalWallet() {
  const balance = parseFloat(localStorage.getItem(WALLET_KEY) || '10000');
  return balance;
}

function setLocalWallet(balance) {
  localStorage.setItem(WALLET_KEY, String(balance));
}

function getLocalTransactions() {
  try {
    return JSON.parse(localStorage.getItem(TRANSACTIONS_KEY) || '[]');
  } catch {
    return [];
  }
}

function setLocalTransactions(transactions) {
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
}

class WalletService {
  constructor() {
    // Initialize sample data on first load
    this.initializeSampleData();
  }

  async getBalance() {
    logger.service('Getting wallet balance');
    return getLocalWallet();
  }

  async fundWallet(amount, paymentMethod = 'card') {
    logger.service('Funding wallet', { amount, paymentMethod });
    let balance = getLocalWallet();
    balance += parseFloat(amount);
    setLocalWallet(balance);
    // Add transaction
    const transactions = getLocalTransactions();
    transactions.unshift({
      id: Date.now(),
      label: 'Wallet Funded',
      description: `Funded wallet via ${paymentMethod}`,
      amount: parseFloat(amount),
      type: 'credit',
      category: 'funding',
      status: 'completed',
      date: new Date().toISOString()
    });
    setLocalTransactions(transactions);
    logger.service('Wallet funded successfully');
    return { success: true, balance };
  }

  async deductFromWallet(amount, description) {
    logger.service('Deducting from wallet', { amount, description });
    let balance = getLocalWallet();
    amount = parseFloat(amount);
    if (balance < amount) throw new Error('Insufficient balance');
    balance -= amount;
    setLocalWallet(balance);
    // Add transaction
    const transactions = getLocalTransactions();
    transactions.unshift({
      id: Date.now(),
      label: description,
      description,
      amount,
      type: 'debit',
      category: 'purchase',
      status: 'completed',
      date: new Date().toISOString()
    });
    setLocalTransactions(transactions);
    logger.service('Wallet deduction successful');
    return { success: true, balance };
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