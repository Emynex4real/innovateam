import logger from '../utils/logger';
import paymentService from './payment.service';

// LocalStorage keys
const WALLET_KEY = 'wallet_balance';
const TRANSACTIONS_KEY = 'wallet_transactions';
const PENDING_TRANSACTIONS_KEY = 'pending_transactions';

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

function getPendingTransactions() {
  try {
    return JSON.parse(localStorage.getItem(PENDING_TRANSACTIONS_KEY) || '[]');
  } catch {
    return [];
  }
}

function setPendingTransactions(transactions) {
  localStorage.setItem(PENDING_TRANSACTIONS_KEY, JSON.stringify(transactions));
}

class WalletService {
  constructor() {
    this.initializeSampleData();
  }

  async getBalance() {
    logger.service('Getting wallet balance');
    return getLocalWallet();
  }

  // Enhanced fund wallet with payment integration
  async fundWallet(amount, paymentMethod = 'card', userEmail = 'user@example.com') {
    logger.service('Funding wallet', { amount, paymentMethod });
    
    if (paymentMethod === 'card') {
      return await this.processCardPayment(amount, userEmail);
    } else {
      return await this.directFunding(amount, paymentMethod);
    }
  }

  // Process card payment via Paystack
  async processCardPayment(amount, email) {
    try {
      const reference = paymentService.generateReference('WALLET');
      
      // Create pending transaction
      const pendingTransaction = {
        id: Date.now(),
        reference,
        amount: parseFloat(amount),
        email,
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      
      const pending = getPendingTransactions();
      pending.push(pendingTransaction);
      setPendingTransactions(pending);
      
      // Initialize payment
      const paymentResponse = await paymentService.initializePayment({
        amount: parseFloat(amount),
        email,
        reference,
        metadata: {
          type: 'wallet_funding',
          userId: 'current_user_id'
        }
      });
      
      // Verify payment
      const verification = await paymentService.verifyPayment(paymentResponse.reference);
      
      if (verification.status === 'success') {
        return await this.completeFunding(reference, verification);
      } else {
        throw new Error('Payment verification failed');
      }
    } catch (error) {
      logger.error('Card payment failed', error);
      throw error;
    }
  }

  // Complete funding after successful payment
  async completeFunding(reference, verification) {
    try {
      // Remove from pending
      let pending = getPendingTransactions();
      const pendingTx = pending.find(tx => tx.reference === reference);
      pending = pending.filter(tx => tx.reference !== reference);
      setPendingTransactions(pending);
      
      if (!pendingTx) {
        throw new Error('Pending transaction not found');
      }
      
      // Update balance
      let balance = getLocalWallet();
      balance += pendingTx.amount;
      setLocalWallet(balance);
      
      // Add successful transaction
      const transactions = getLocalTransactions();
      transactions.unshift({
        id: Date.now(),
        reference,
        label: 'Wallet Funded',
        description: 'Funded wallet via card payment',
        amount: pendingTx.amount,
        type: 'credit',
        category: 'funding',
        status: 'completed',
        paymentMethod: 'card',
        gatewayResponse: verification.gateway_response,
        date: new Date().toISOString()
      });
      setLocalTransactions(transactions);
      
      logger.service('Wallet funded successfully', { amount: pendingTx.amount, balance });
      return { success: true, balance, transaction: transactions[0] };
    } catch (error) {
      logger.error('Failed to complete funding', error);
      throw error;
    }
  }

  // Direct funding (for testing or other payment methods)
  async directFunding(amount, paymentMethod) {
    let balance = getLocalWallet();
    balance += parseFloat(amount);
    setLocalWallet(balance);
    
    const transactions = getLocalTransactions();
    const transaction = {
      id: Date.now(),
      reference: `DIRECT_${Date.now()}`,
      label: 'Wallet Funded',
      description: `Funded wallet via ${paymentMethod}`,
      amount: parseFloat(amount),
      type: 'credit',
      category: 'funding',
      status: 'completed',
      paymentMethod,
      date: new Date().toISOString()
    };
    
    transactions.unshift(transaction);
    setLocalTransactions(transactions);
    
    logger.service('Direct funding successful');
    return { success: true, balance, transaction };
  }

  // Enhanced deduction with better tracking
  async deductFromWallet(amount, description, category = 'purchase', metadata = {}) {
    logger.service('Deducting from wallet', { amount, description, category });
    
    let balance = getLocalWallet();
    amount = parseFloat(amount);
    
    if (balance < amount) {
      throw new Error(`Insufficient balance. Available: ₦${balance.toLocaleString()}, Required: ₦${amount.toLocaleString()}`);
    }
    
    balance -= amount;
    setLocalWallet(balance);
    
    const transactions = getLocalTransactions();
    const transaction = {
      id: Date.now(),
      reference: `TXN_${Date.now()}`,
      label: description,
      description,
      amount,
      type: 'debit',
      category,
      status: 'completed',
      metadata,
      date: new Date().toISOString()
    };
    
    transactions.unshift(transaction);
    setLocalTransactions(transactions);
    
    logger.service('Wallet deduction successful', { newBalance: balance });
    return { success: true, balance, transaction };
  }

  // Process service payment
  async processServicePayment(serviceData) {
    const { name, price, category = 'education' } = serviceData;
    
    try {
      const result = await this.deductFromWallet(
        price,
        name,
        category,
        { serviceType: category, serviceName: name }
      );
      
      logger.service('Service payment processed', { service: name, amount: price });
      return result;
    } catch (error) {
      logger.error('Service payment failed', error);
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

  // Get pending transactions
  async getPendingTransactions() {
    return getPendingTransactions();
  }

  // Cancel pending transaction
  async cancelPendingTransaction(reference) {
    let pending = getPendingTransactions();
    pending = pending.filter(tx => tx.reference !== reference);
    setPendingTransactions(pending);
    logger.service('Pending transaction cancelled', { reference });
  }

  // Get transaction statistics
  async getTransactionStats(days = 30) {
    const transactions = getLocalTransactions();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const recentTransactions = transactions.filter(
      tx => new Date(tx.date) >= cutoffDate
    );
    
    const stats = {
      totalTransactions: recentTransactions.length,
      totalCredits: recentTransactions
        .filter(tx => tx.type === 'credit')
        .reduce((sum, tx) => sum + tx.amount, 0),
      totalDebits: recentTransactions
        .filter(tx => tx.type === 'debit')
        .reduce((sum, tx) => sum + tx.amount, 0),
      byCategory: {}
    };
    
    recentTransactions.forEach(tx => {
      if (!stats.byCategory[tx.category]) {
        stats.byCategory[tx.category] = { count: 0, amount: 0 };
      }
      stats.byCategory[tx.category].count++;
      stats.byCategory[tx.category].amount += tx.amount;
    });
    
    return stats;
  }

  // Clear all wallet data (for testing)
  clearWalletData() {
    localStorage.removeItem(WALLET_KEY);
    localStorage.removeItem(TRANSACTIONS_KEY);
    localStorage.removeItem(PENDING_TRANSACTIONS_KEY);
    this.initializeSampleData();
  }

  // Initialize sample data for demo purposes
  initializeSampleData() {
    const existingTransactions = getLocalTransactions();
    if (existingTransactions.length === 0) {
      const sampleTransactions = [
        {
          id: Date.now() - 86400000 * 5,
          reference: `TXN_${Date.now() - 86400000 * 5}`,
          label: 'WAEC Result Checker',
          description: 'WAEC Result Checker Service',
          amount: 3400,
          type: 'debit',
          category: 'education',
          status: 'completed',
          paymentMethod: 'wallet',
          date: new Date(Date.now() - 86400000 * 5).toISOString()
        },
        {
          id: Date.now() - 86400000 * 3,
          reference: `WALLET_${Date.now() - 86400000 * 3}`,
          label: 'Wallet Funded',
          description: 'Funded wallet via card',
          amount: 5000,
          type: 'credit',
          category: 'funding',
          status: 'completed',
          paymentMethod: 'card',
          gatewayResponse: 'Successful',
          date: new Date(Date.now() - 86400000 * 3).toISOString()
        },
        {
          id: Date.now() - 86400000 * 2,
          reference: `TXN_${Date.now() - 86400000 * 2}`,
          label: 'O-Level Upload',
          description: 'O-Level Result Upload Service',
          amount: 1000,
          type: 'debit',
          category: 'education',
          status: 'completed',
          paymentMethod: 'wallet',
          date: new Date(Date.now() - 86400000 * 2).toISOString()
        },
        {
          id: Date.now() - 86400000,
          reference: `TXN_${Date.now() - 86400000}`,
          label: 'AI Examiner',
          description: 'AI Examiner Practice Test',
          amount: 750,
          type: 'debit',
          category: 'education',
          status: 'completed',
          paymentMethod: 'wallet',
          date: new Date(Date.now() - 86400000).toISOString()
        }
      ];
      setLocalTransactions(sampleTransactions);
      
      // Calculate balance based on transactions
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

// Export service pricing for easy access
export const SERVICE_PRICES = {
  'waec-result-checker': 3400,
  'neco-result-checker': 3400,
  'nabteb-result-checker': 3400,
  'nbais-result-checker': 3400,
  'waec-gce': 3400,
  'olevel-upload': 1000,
  'original-result': 2000,
  'pin-vending': 4700,
  'reprinting': 1500,
  'admission-letter': 2500,
  'ai-examiner': 750,
  'course-advisor': 500,
  'airtime-topup': 0, // Variable
  'data-subscription': 0 // Variable
};

// Utility functions for transaction handling
export const TransactionUtils = {
  formatAmount: (amount) => `₦${parseFloat(amount).toLocaleString()}`,
  
  getTransactionIcon: (type, category) => {
    if (type === 'credit') return 'ArrowDownLeft';
    if (category === 'education') return 'GraduationCap';
    if (category === 'communication') return 'Phone';
    return 'ArrowUpRight';
  },
  
  getStatusColor: (status) => {
    switch (status) {
      case 'completed': return 'green';
      case 'pending': return 'yellow';
      case 'failed': return 'red';
      default: return 'gray';
    }
  },
  
  validateAmount: (amount) => {
    const num = parseFloat(amount);
    return !isNaN(num) && num > 0 && num <= 1000000; // Max 1M
  }
};