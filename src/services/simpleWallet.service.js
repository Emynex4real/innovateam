import { createClient } from '@supabase/supabase-js';

// Use only publishable key for browser safety
const supabase = createClient(
  'https://jdedscbvbkjvqmmdabig.supabase.co',
  'sb_publishable_cVZ7KXM0lNdNfuUzVD-Hlw_E4yNzJJO'
);

class SimpleWalletService {
  async addTransaction(userEmail, amount, description, type = 'credit') {
    try {
      // Get current user from localStorage
      const currentUser = JSON.parse(localStorage.getItem('confirmedUser') || '{}');
      
      if (!currentUser.id) {
        throw new Error('User not authenticated');
      }

      // For debit transactions, check balance first
      if (type === 'debit') {
        const { data: userProfile } = await supabase
          .from('user_profiles')
          .select('wallet_balance')
          .eq('id', currentUser.id)
          .single();

        if (!userProfile || userProfile.wallet_balance < amount) {
          throw new Error(`Insufficient balance. Available: ₦${userProfile?.wallet_balance || 0}`);
        }
      }

      // Add transaction
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

      // Update user wallet balance
      const { data: currentProfile } = await supabase
        .from('user_profiles')
        .select('wallet_balance')
        .eq('id', currentUser.id)
        .single();

      const newBalance = type === 'credit' 
        ? (currentProfile.wallet_balance || 0) + amount
        : (currentProfile.wallet_balance || 0) - amount;

      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ 
          wallet_balance: newBalance,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentUser.id);

      if (updateError) {
        console.warn('Balance update failed:', updateError);
      }

      return { success: true, transaction: data, newBalance };
    } catch (error) {
      console.error('Transaction failed:', error);
      return { success: false, error: error.message };
    }
  }

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

  async getUserBalance(userId) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('wallet_balance')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return { success: true, balance: data.wallet_balance || 0 };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

const simpleWalletService = new SimpleWalletService();
export default simpleWalletService;