import supabase from '../config/supabase';

class SimpleWalletService {
  /**
   * Add a transaction and update wallet balance
   */
  async addTransaction(userEmail, amount, description, type = 'credit') {
    try {
      // Get current user from localStorage or Supabase session
      const confirmedUser = localStorage.getItem('confirmedUser');
      const currentUser = confirmedUser ? JSON.parse(confirmedUser) : null;
      
      if (!currentUser?.id) {
        throw new Error('User not authenticated');
      }

      // For debit transactions, check balance first
      if (type === 'debit') {
        const { data: userProfile } = await supabase
          .from('user_profiles')
          .select('wallet_balance')
          .eq('id', currentUser.id)
          .single();

        if (!userProfile || (userProfile.wallet_balance || 0) < amount) {
          throw new Error(`Insufficient balance. Available: ₦${userProfile?.wallet_balance || 0}`);
        }
      }

      // 1. Add transaction record
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          user_id: currentUser.id,
          user_email: userEmail,
          description: description,
          amount: amount,
          type: type,
          status: 'successful'
        })
        .select()
        .single();

      if (error) throw error;

      // 2. Get current balance to calculate new balance
      const { data: currentProfile, error: balanceError } = await supabase
        .from('user_profiles')
        .select('wallet_balance')
        .eq('id', currentUser.id)
        .single();

      if (balanceError || !currentProfile) {
        throw new Error(`Failed to get current balance: ${balanceError?.message || 'Profile not found'}`);
      }

      const currentBalance = currentProfile.wallet_balance || 0;
      const newBalance = type === 'credit' 
        ? currentBalance + amount
        : currentBalance - amount;

      // 3. Update user wallet balance
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ 
          wallet_balance: newBalance,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentUser.id);

      if (updateError) {
        console.warn('Balance update failed:', updateError);
        // Note: In a production app, you might want to rollback the transaction here
      }

      return { success: true, transaction: data, newBalance };
    } catch (error) {
      console.error('Transaction failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get all transactions (filtered by user in the Context/UI layer or RLS)
   */
  async getAllTransactions() {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { success: true, transactions: data || [] };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get specific user balance
   */
  async getUserBalance(userId) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('wallet_balance')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Balance fetch error:', error);
        throw error;
      }
      
      if (!data) {
        throw new Error('User profile not found');
      }
      
      return { success: true, balance: data.wallet_balance || 0 };
    } catch (error) {
      console.error('getUserBalance failed:', error);
      return { success: false, error: error.message };
    }
  }
}

const simpleWalletService = new SimpleWalletService();
export default simpleWalletService;