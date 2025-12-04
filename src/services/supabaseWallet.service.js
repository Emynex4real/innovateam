import supabase from '../config/supabase';

class SupabaseWalletService {
  async addTransaction(userId, userEmail, transactionData) {
    try {
      // Try with user_id first, if it fails, try without user_id
      let insertData = {
        user_id: userId,
        user_email: userEmail,
        description: transactionData.description || transactionData.label,
        amount: transactionData.amount,
        type: transactionData.type,
        status: transactionData.status || 'successful'
      };
      
      let { data, error } = await supabase
        .from('transactions')
        .insert(insertData)
        .select()
        .single();

      // If foreign key constraint fails, try without user_id
      if (error && error.code === '23503') {
        console.log('Foreign key constraint failed, trying without user_id');
        const { user_id, ...insertDataWithoutUserId } = insertData;
        
        const result = await supabase
          .from('transactions')
          .insert(insertDataWithoutUserId)
          .select()
          .single();
          
        data = result.data;
        error = result.error;
      }

      if (error) throw error;

      return { success: true, transaction: data };
    } catch (error) {
      console.error('Add transaction error:', error);
      return { success: false, error: error.message };
    }
  }

  async updateWalletBalance(userId, newBalance) {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ wallet_balance: newBalance })
        .eq('id', userId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Update wallet balance error:', error);
      return { success: false, error: error.message };
    }
  }

  async getWalletBalance(userId) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('wallet_balance')
        .eq('id', userId)
        .single();

      if (error) throw error;

      return { success: true, balance: data?.wallet_balance || 0 };
    } catch (error) {
      console.error('Get wallet balance error:', error);
      return { success: false, error: error.message };
    }
  }

  async getUserTransactions(userId) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { success: true, transactions: data || [] };
    } catch (error) {
      console.error('Get transactions error:', error);
      return { success: false, error: error.message };
    }
  }

  async processServicePayment(userId, userEmail, serviceData) {
    try {
      // Get current balance
      const balanceResult = await this.getWalletBalance(userId);
      if (!balanceResult.success) {
        throw new Error('Failed to get wallet balance');
      }

      const currentBalance = balanceResult.balance;
      if (currentBalance < serviceData.amount) {
        return { success: false, error: 'Insufficient balance' };
      }

      // Create debit transaction
      const transactionResult = await this.addTransaction(userId, userEmail, {
        description: serviceData.description,
        amount: serviceData.amount,
        type: 'debit',
        status: 'successful'
      });

      if (!transactionResult.success) {
        throw new Error('Failed to create transaction');
      }

      // Update wallet balance
      const newBalance = currentBalance - serviceData.amount;
      const updateResult = await this.updateWalletBalance(userId, newBalance);

      if (!updateResult.success) {
        throw new Error('Failed to update wallet balance');
      }

      return {
        success: true,
        transaction: transactionResult.transaction,
        newBalance
      };
    } catch (error) {
      console.error('Process service payment error:', error);
      return { success: false, error: error.message };
    }
  }

  async fundWallet(userId, userEmail, amount, paymentMethod = 'card') {
    try {
      // Get current balance
      const balanceResult = await this.getWalletBalance(userId);
      if (!balanceResult.success) {
        throw new Error('Failed to get wallet balance');
      }

      // Create credit transaction
      const transactionResult = await this.addTransaction(userId, userEmail, {
        description: `Wallet Funding via ${paymentMethod}`,
        amount: amount,
        type: 'credit',
        status: 'successful'
      });

      if (!transactionResult.success) {
        throw new Error('Failed to create transaction');
      }

      // Update wallet balance
      const newBalance = balanceResult.balance + amount;
      const updateResult = await this.updateWalletBalance(userId, newBalance);

      if (!updateResult.success) {
        throw new Error('Failed to update wallet balance');
      }

      return {
        success: true,
        transaction: transactionResult.transaction,
        newBalance
      };
    } catch (error) {
      console.error('Fund wallet error:', error);
      return { success: false, error: error.message };
    }
  }
}

const supabaseWalletService = new SupabaseWalletService();
export default supabaseWalletService;