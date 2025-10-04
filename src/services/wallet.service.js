
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
      status: 'Successful',
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
      status: 'Successful',
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
}

const walletService = new WalletService();
export default walletService;