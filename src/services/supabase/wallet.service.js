import { supabase } from '../../lib/supabase';
import logger from '../../utils/logger';
import { SecurityUtils } from '../../config/security.enhanced';

export class WalletService {
  // Get user wallet balance from database
  static async getBalance(userId) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('wallet_balance')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return { success: true, balance: parseFloat(data.wallet_balance) || 0 };
    } catch (error) {
      logger.error('Failed to get wallet balance', error);
      return { success: false, error: error.message, balance: 0 };
    }
  }

  // Fund wallet with database transaction
  static async fundWallet(userId, amount, paymentMethod = 'card', reference = null) {
    try {
      // Validate input
      if (!SecurityUtils.validateAmount(amount)) {
        throw new Error('Invalid amount');
      }

      const validAmount = parseFloat(amount);
      const txReference = reference || SecurityUtils.generateSecureReference('FUND');

      // Create transaction record
      const { data: transaction, error: txError } = await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          amount: validAmount,
          type: 'credit',
          status: 'completed',
          service_type: 'result_checker',
          service_name: 'Wallet Funding',
          description: `Wallet funded via ${paymentMethod}`,
          reference: txReference,
          metadata: { paymentMethod, fundingType: 'wallet_topup' }
        })
        .select()
        .single();

      if (txError) throw txError;

      // Get updated balance
      const balanceResult = await this.getBalance(userId);
      
      logger.service('Wallet funded successfully', { 
        userId, 
        amount: validAmount, 
        reference: txReference 
      });

      return {
        success: true,
        balance: balanceResult.balance,
        transaction: transaction
      };
    } catch (error) {
      logger.error('Wallet funding failed', error);
      return { success: false, error: error.message };
    }
  }

  // Deduct from wallet with validation
  static async deductFromWallet(userId, amount, description, serviceType = 'result_checker') {
    try {
      // Validate input
      if (!SecurityUtils.validateAmount(amount)) {
        throw new Error('Invalid amount');
      }

      const validAmount = parseFloat(amount);
      
      // Check current balance
      const balanceResult = await this.getBalance(userId);
      if (!balanceResult.success) {
        throw new Error('Failed to check balance');
      }

      if (balanceResult.balance < validAmount) {
        throw new Error(`Insufficient balance. Available: ₦${balanceResult.balance.toLocaleString()}, Required: ₦${validAmount.toLocaleString()}`);
      }

      // Create debit transaction
      const txReference = SecurityUtils.generateSecureReference('TXN');
      
      const { data: transaction, error: txError } = await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          amount: validAmount,
          type: 'debit',
          status: 'completed',
          service_type: serviceType,
          service_name: description,
          description: description,
          reference: txReference,
          metadata: { deductionType: 'service_payment' }
        })
        .select()
        .single();

      if (txError) throw txError;

      // Get updated balance
      const newBalanceResult = await this.getBalance(userId);
      
      logger.service('Wallet deduction successful', { 
        userId, 
        amount: validAmount, 
        newBalance: newBalanceResult.balance 
      });

      return {
        success: true,
        balance: newBalanceResult.balance,
        transaction: transaction
      };
    } catch (error) {
      logger.error('Wallet deduction failed', error);
      return { success: false, error: error.message };
    }
  }

  // Get user transactions with pagination
  static async getTransactions(userId, limit = 50, offset = 0) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return { success: true, transactions: data || [] };
    } catch (error) {
      logger.error('Failed to get transactions', error);
      return { success: false, error: error.message, transactions: [] };
    }
  }

  // Get transaction statistics
  static async getTransactionStats(userId, days = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const { data, error } = await supabase
        .from('transactions')
        .select('amount, type, service_type')
        .eq('user_id', userId)
        .gte('created_at', cutoffDate.toISOString());

      if (error) throw error;

      const stats = {
        totalTransactions: data.length,
        totalCredits: data.filter(tx => tx.type === 'credit').reduce((sum, tx) => sum + tx.amount, 0),
        totalDebits: data.filter(tx => tx.type === 'debit').reduce((sum, tx) => sum + tx.amount, 0),
        byServiceType: {}
      };

      // Group by service type
      data.forEach(tx => {
        if (!stats.byServiceType[tx.service_type]) {
          stats.byServiceType[tx.service_type] = { count: 0, amount: 0 };
        }
        stats.byServiceType[tx.service_type].count++;
        stats.byServiceType[tx.service_type].amount += tx.amount;
      });

      return { success: true, stats };
    } catch (error) {
      logger.error('Failed to get transaction stats', error);
      return { success: false, error: error.message };
    }
  }

  // Process service payment
  static async processServicePayment(userId, serviceData) {
    const { name, price, type = 'result_checker' } = serviceData;
    
    try {
      const result = await this.deductFromWallet(userId, price, name, type);
      
      if (result.success) {
        // Log service usage
        await supabase.from('activity_logs').insert({
          user_id: userId,
          action: 'service_purchased',
          resource: name,
          metadata: { 
            amount: price, 
            service_type: type,
            transaction_id: result.transaction.id 
          }
        });
      }
      
      return result;
    } catch (error) {
      logger.error('Service payment failed', error);
      return { success: false, error: error.message };
    }
  }
}

export default WalletService;