import { createClient } from '@supabase/supabase-js';

// Admin client with service role key - ONLY for admin functions
const supabaseUrl = 'https://jdedscbvbkjvqmmdabig.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkZWRzY2J2YmtqdnFtbWRhYmlnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTgwNzI3MywiZXhwIjoyMDc1MzgzMjczfQ.OAtp8dTtIuekKgcAo5WagT30xpzZiTivKxH-LujRFW4';

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
      // Get users from auth.users
      const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers();
      
      if (authError) throw authError;

      // Get user profiles
      const { data: profiles, error: profileError } = await supabaseAdmin
        .from('user_profiles')
        .select('*');

      if (profileError) console.warn('Profile fetch error:', profileError);

      // Combine auth users with profiles
      const users = authUsers.users.map(user => {
        const profile = profiles?.find(p => p.id === user.id);
        return {
          id: user.id,
          email: user.email,
          name: profile?.full_name || user.user_metadata?.full_name || 'User',
          phone: profile?.phone || user.user_metadata?.phone || '',
          role: profile?.role || 'user',
          status: user.email_confirmed_at ? 'active' : 'pending',
          walletBalance: profile?.wallet_balance || 0,
          createdAt: user.created_at,
          lastSignIn: user.last_sign_in_at,
          emailConfirmed: !!user.email_confirmed_at
        };
      });

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

  async updateUserStatus(userId, status) {
    if (!supabaseAdmin) {
      throw new Error('Admin service not configured');
    }

    try {
      const { error } = await supabaseAdmin
        .from('user_profiles')
        .upsert({ id: userId, status }, { onConflict: 'id' });

      if (error) throw error;

      return { success: true, message: `User status updated to ${status}` };
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