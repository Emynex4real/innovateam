const { v4: uuidv4 } = require('uuid');
const supabase = require('../supabaseClient');

class Wallet {
  static async getBalance(userId) {
    const { data, error } = await supabase
      .from('users')
      .select('wallet_balance')
      .eq('id', userId)
      .single();

    if (error) return 0;
    return data?.wallet_balance || 0;
  }

  static async updateBalance(userId, newBalance) {
    const { data, error } = await supabase
      .from('users')
      .update({ 
        wallet_balance: newBalance
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async addFunds(userId, amount, description = 'Wallet funding') {
    const currentBalance = await this.getBalance(userId);
    const newBalance = currentBalance + amount;
    
    // Update wallet balance
    await this.updateBalance(userId, newBalance);
    
    // Create transaction record
    const Transaction = require('./Transaction');
    const transaction = await Transaction.create({
      userId,
      type: 'credit',
      amount,
      description,
      status: 'completed',
      category: 'wallet_funding'
    });

    return { newBalance, transaction };
  }

  static async deductFunds(userId, amount, description = 'Payment') {
    const currentBalance = await this.getBalance(userId);
    
    if (currentBalance < amount) {
      throw new Error('Insufficient wallet balance');
    }
    
    const newBalance = currentBalance - amount;
    
    // Update wallet balance
    await this.updateBalance(userId, newBalance);
    
    // Create transaction record
    const Transaction = require('./Transaction');
    const transaction = await Transaction.create({
      userId,
      type: 'debit',
      amount,
      description,
      status: 'completed',
      category: 'payment'
    });

    return { newBalance, transaction };
  }
}

module.exports = Wallet;