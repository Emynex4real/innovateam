const Transaction = require('../models/Transaction');
const supabase = require('../supabaseClient');

class TransactionService {
  // Record a new transaction
  static async recordTransaction(userId, transactionData) {
    try {
      const transaction = await Transaction.create({
        userId,
        type: transactionData.type || 'purchase',
        amount: parseFloat(transactionData.amount),
        description: transactionData.description,
        status: transactionData.status || 'completed',
        category: transactionData.category || 'general',
        reference: transactionData.reference,
        metadata: transactionData.metadata || {}
      });

      // Update user's wallet balance if it's a debit transaction
      if (transactionData.type === 'debit' || transactionData.type === 'purchase') {
        await this.updateUserBalance(userId, -Math.abs(transactionData.amount));
      } else if (transactionData.type === 'credit' || transactionData.type === 'refund') {
        await this.updateUserBalance(userId, Math.abs(transactionData.amount));
      }

      return transaction;
    } catch (error) {
      throw new Error(`Failed to record transaction: ${error.message}`);
    }
  }

  // Update user's wallet balance
  static async updateUserBalance(userId, amount) {
    try {
      const { data: user, error: fetchError } = await supabase
        .from('users')
        .select('wallet_balance')
        .eq('id', userId)
        .single();

      if (fetchError) throw fetchError;

      const currentBalance = parseFloat(user.wallet_balance || 0);
      const newBalance = currentBalance + amount;

      const { error: updateError } = await supabase
        .from('users')
        .update({ wallet_balance: newBalance })
        .eq('id', userId);

      if (updateError) throw updateError;

      return newBalance;
    } catch (error) {
      console.error('Failed to update user balance:', error);
      // Don't throw error to prevent transaction recording failure
    }
  }

  // Record service purchase
  static async recordServicePurchase(userId, serviceData) {
    const transactionData = {
      type: 'purchase',
      amount: serviceData.amount,
      description: `${serviceData.serviceName} - ${serviceData.description || 'Service purchase'}`,
      status: 'completed',
      category: serviceData.category || 'services',
      reference: serviceData.reference || `SRV-${Date.now()}`,
      metadata: {
        serviceName: serviceData.serviceName,
        serviceType: serviceData.serviceType,
        ...serviceData.metadata
      }
    };

    return await this.recordTransaction(userId, transactionData);
  }

  // Record wallet funding
  static async recordWalletFunding(userId, amount, paymentReference) {
    const transactionData = {
      type: 'credit',
      amount: amount,
      description: `Wallet funding via payment`,
      status: 'completed',
      category: 'wallet_funding',
      reference: paymentReference,
      metadata: {
        paymentMethod: 'online',
        paymentReference
      }
    };

    return await this.recordTransaction(userId, transactionData);
  }

  // Get user transaction history
  static async getUserTransactionHistory(userId, limit = 50) {
    try {
      return await Transaction.findByUserId(userId, limit);
    } catch (error) {
      throw new Error(`Failed to get transaction history: ${error.message}`);
    }
  }

  // Get user transaction stats
  static async getUserTransactionStats(userId) {
    try {
      return await Transaction.getUserStats(userId);
    } catch (error) {
      throw new Error(`Failed to get transaction stats: ${error.message}`);
    }
  }
}

module.exports = TransactionService;