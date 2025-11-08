import { createClient } from '@supabase/supabase-js';

// Admin client with service role key - ONLY for admin functions
const supabaseUrl = 'https://jdedscbvbkjvqmmdabig.supabase.co';
const supabaseServiceKey = process.env.REACT_APP_SUPABASE_SERVICE_KEY || 'sb_secret_hIioKUet8-tiH_bk0aFDXQ_4QsSl2yi';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

class SupabaseAdminService {
  async getAllUsers() {
    if (!supabaseAdmin) {
      throw new Error('Admin service not configured');
    }

    try {
      // Get user profiles directly since that's where our users are
      const { data: profiles, error: profileError } = await supabaseAdmin
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profileError) throw profileError;

      // Map profiles to user format
      const users = profiles.map(profile => ({
        id: profile.id,
        email: profile.full_name + '@example.com', // Fallback email
        name: profile.full_name,
        phone: profile.phone,
        role: profile.role,
        status: profile.status,
        walletBalance: profile.wallet_balance || 0,
        createdAt: profile.created_at,
        lastSignIn: profile.updated_at,
        emailConfirmed: true
      }));

      return { success: true, users };
    } catch (error) {
      console.error('Get users error:', error);
      return { success: false, error: error.message };
    }
  }

  async getAllTransactions() {
    if (!supabaseAdmin) {
      throw new Error('Admin service not configured');
    }

    try {
      const { data: transactions, error } = await supabaseAdmin
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { success: true, transactions: transactions || [] };
    } catch (error) {
      console.error('Get transactions error:', error);
      return { success: false, error: error.message };
    }
  }

  async getDashboardStats() {
    try {
      const [usersResult, transactionsResult] = await Promise.all([
        this.getAllUsers(),
        this.getAllTransactions()
      ]);

      if (!usersResult.success || !transactionsResult.success) {
        throw new Error('Failed to fetch data');
      }

      const users = usersResult.users;
      const transactions = transactionsResult.transactions;

      const today = new Date().toDateString();
      const todayUsers = users.filter(u => 
        new Date(u.createdAt).toDateString() === today
      ).length;

      const todayTransactions = transactions.filter(t => 
        new Date(t.created_at).toDateString() === today
      ).length;

      const totalRevenue = transactions
        .filter(t => t.type === 'credit')
        .reduce((sum, t) => sum + t.amount, 0);

      const todayRevenue = transactions
        .filter(t => t.type === 'credit' && 
          new Date(t.created_at).toDateString() === today)
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        success: true,
        stats: {
          totalUsers: users.length,
          todayUsers,
          totalTransactions: transactions.length,
          todayTransactions,
          totalRevenue,
          todayRevenue,
          monthlyGrowth: 15.2
        }
      };
    } catch (error) {
      console.error('Dashboard stats error:', error);
      return { success: false, error: error.message };
    }
  }

  async updateUserRole(userId, role) {
    if (!supabaseAdmin) {
      throw new Error('Admin service not configured');
    }

    try {
      const { error } = await supabaseAdmin
        .from('user_profiles')
        .upsert({ id: userId, role }, { onConflict: 'id' });

      if (error) throw error;

      return { success: true, message: `User role updated to ${role}` };
    } catch (error) {
      console.error('Update role error:', error);
      return { success: false, error: error.message };
    }
  }

  async updateUserStatus(userId, userStatus) {
    if (!supabaseAdmin) {
      throw new Error('Admin service not configured');
    }

    try {
      const { error } = await supabaseAdmin
        .from('user_profiles')
        .upsert({ id: userId, status: userStatus }, { onConflict: 'id' });

      if (error) throw error;

      return { success: true, message: `User status updated to ${userStatus}` };
    } catch (error) {
      console.error('Update status error:', error);
      return { success: false, error: error.message };
    }
  }

  async createUserProfile(userId, userData) {
    if (!supabaseAdmin) {
      throw new Error('Admin service not configured');
    }

    try {
      const { error } = await supabaseAdmin
        .from('user_profiles')
        .upsert({
          id: userId,
          full_name: userData.full_name,
          phone: userData.phone,
          wallet_balance: 0,
          role: 'user',
          status: 'active'
        }, { onConflict: 'id' });
        


      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Create profile error:', error);
      return { success: false, error: error.message };
    }
  }
}

const supabaseAdminService = new SupabaseAdminService();
export default supabaseAdminService;