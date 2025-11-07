import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jdedscbvbkjvqmmdabig.supabase.co';
const supabaseServiceKey = process.env.REACT_APP_SUPABASE_SERVICE_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

class SimpleWalletService {
  async createRealUser(email) {
    try {
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email: email,
        password: 'tempPassword123!',
        email_confirm: true,
        user_metadata: { full_name: email.split('@')[0] }
      });
      
      if (error) throw error;
      return { success: true, user: data.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async addTransaction(userEmail, amount, description, type = 'credit') {
    try {
      const { data, error } = await supabaseAdmin
        .from('transactions')
        .insert({
          user_email: userEmail,
          description: description,
          amount: amount,
          type: type,
          status: 'successful'
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, transaction: data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getAllTransactions() {
    try {
      const { data, error } = await supabaseAdmin
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { success: true, transactions: data || [] };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

const simpleWalletService = new SimpleWalletService();
export default simpleWalletService;