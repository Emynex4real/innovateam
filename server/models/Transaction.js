const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class Transaction {
  constructor() {
    this.dataPath = path.join(__dirname, '../data/transactions.json');
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
    await fs.writeFile(this.dataPath, JSON.stringify(transactions, null, 2));
  }

  async create(transactionData, userId) {
    const transactions = await this.loadTransactions();
    
    const newTransaction = {
      id: uuidv4(),
      userId,
      amount: parseFloat(transactionData.amount),
      type: transactionData.type,
      status: transactionData.status || 'pending',
      description: transactionData.description || '',
      metadata: transactionData.metadata || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    transactions.push(newTransaction);
    await this.saveTransactions(transactions);
    return newTransaction;
  }

  async findByUserId(userId) {
    const transactions = await this.loadTransactions();
    return transactions.filter(t => t.userId === userId);
  }

  async findById(id) {
    const transactions = await this.loadTransactions();
    return transactions.find(t => t.id === id);
  }

  async update(id, updateData, userId) {
    const transactions = await this.loadTransactions();
    const index = transactions.findIndex(t => t.id === id && t.userId === userId);
    
    if (index === -1) return null;
    
    transactions[index] = {
      ...transactions[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    await this.saveTransactions(transactions);
    return transactions[index];
  }

  async delete(id, userId) {
    const transactions = await this.loadTransactions();
    const index = transactions.findIndex(t => t.id === id && t.userId === userId);
    
    if (index === -1) return false;
    
    transactions.splice(index, 1);
    await this.saveTransactions(transactions);
    return true;
  }

  async getAll() {
    return await this.loadTransactions();
  }
}

module.exports = new Transaction();