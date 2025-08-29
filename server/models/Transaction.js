const { v4: uuidv4 } = require('uuid');
const fs = require('fs').promises;
const path = require('path');

class Transaction {
  constructor() {
    this.dataPath = path.join(__dirname, '../data/user_transactions.json');
  }

  async loadTransactions() {
    try {
      const data = await fs.readFile(this.dataPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  async saveTransactions(transactions) {
    try {
      // Ensure directory exists
      const dir = path.dirname(this.dataPath);
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(this.dataPath, JSON.stringify(transactions, null, 2));
    } catch (error) {
      console.error('Failed to save transactions:', error);
      throw error;
    }
  }

  static async create(transactionData) {
    const instance = new Transaction();
    const transactions = await instance.loadTransactions();
    
    const transaction = {
      id: uuidv4(),
      userId: transactionData.userId,
      type: transactionData.type, // 'credit', 'debit'
      amount: parseFloat(transactionData.amount),
      description: transactionData.description || '',
      status: transactionData.status || 'completed',
      category: transactionData.category || 'general',
      reference: transactionData.reference || uuidv4().slice(0, 8),
      metadata: transactionData.metadata || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    transactions.push(transaction);
    await instance.saveTransactions(transactions);
    return transaction;
  }

  static async findByUserId(userId, limit = 50) {
    const instance = new Transaction();
    const transactions = await instance.loadTransactions();
    return transactions
      .filter(t => t.userId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit);
  }

  static async findById(id) {
    const instance = new Transaction();
    const transactions = await instance.loadTransactions();
    return transactions.find(t => t.id === id);
  }

  static async getAll(limit = 100) {
    const instance = new Transaction();
    const transactions = await instance.loadTransactions();
    return transactions
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit);
  }

  static async getUserStats(userId) {
    const instance = new Transaction();
    const transactions = await instance.loadTransactions();
    const userTransactions = transactions.filter(t => t.userId === userId);

    const stats = {
      totalTransactions: userTransactions.length,
      totalCredits: userTransactions.filter(t => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0),
      totalDebits: userTransactions.filter(t => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0),
      pendingTransactions: userTransactions.filter(t => t.status === 'pending').length,
      completedTransactions: userTransactions.filter(t => t.status === 'completed').length
    };

    return stats;
  }

  static async update(id, updateData) {
    const instance = new Transaction();
    const transactions = await instance.loadTransactions();
    const index = transactions.findIndex(t => t.id === id);
    
    if (index === -1) return null;
    
    transactions[index] = {
      ...transactions[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    await instance.saveTransactions(transactions);
    return transactions[index];
  }

  static async delete(id) {
    const instance = new Transaction();
    const transactions = await instance.loadTransactions();
    const index = transactions.findIndex(t => t.id === id);
    
    if (index === -1) return false;
    
    transactions.splice(index, 1);
    await instance.saveTransactions(transactions);
    return true;
  }
}

module.exports = Transaction;