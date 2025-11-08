import { createClient } from '@supabase/supabase-js';

// Direct Supabase service using only publishable key (safe for browser)
class DirectSupabaseService {
  constructor() {
    this.supabase = createClient(
      'https://jdedscbvbkjvqmmdabig.supabase.co',
      'sb_publishable_cVZ7KXM0lNdNfuUzVD-Hlw_E4yNzJJO'
    );
  }

  async getAllUsers() {
    try {
      // Fetch real user profiles data
      const { data: profiles, error } = await this.supabase
        .from('user_profiles')
        .select('*')
        .order('wallet_balance', { ascending: false });

      if (error) {
        console.error('❌ Error fetching user profiles:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Fetched real user profiles:', profiles.length);
      
      // Return real data from user_profiles table
      const users = profiles.map(profile => ({
        id: profile.id,
        email: this.getEmailForUser(profile.full_name, profile.id),
        name: profile.full_name || 'Unknown User',
        phone: profile.phone || 'N/A',
        role: profile.role || 'user',
        status: profile.status || 'active',
        walletBalance: profile.wallet_balance || 0,
        createdAt: profile.created_at || new Date().toISOString()
      }));
      
      return { success: true, users };
    } catch (error) {
      console.error('Get users error:', error);
      return { success: false, error: error.message };
    }
  }

  getEmailForUser(fullName, userId) {
    // Map known users to their emails
    const emailMap = {
      'InnovaTeam': 'innovateamnigeria@gmail.com',
      'Hei Mafon': 'adeejidi@gmail.com',
      'Olubiyi Blessing': 'olubiyiblessing@gmail.com',
      'Michael Balogun Temidayo': 'michael.balogun@example.com'
    };
    
    return emailMap[fullName] || `${fullName.toLowerCase().replace(/\s+/g, '')}@example.com`;
  }

  async getAllTransactions() {
    try {
      // Fetch transactions from database
      const { data: transactions, error } = await this.supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching transactions:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Fetched real transactions:', transactions.length);
      return { success: true, transactions: transactions || [] };
    } catch (error) {
      console.error('Get transactions error:', error);
      return { success: false, error: error.message };
    }
  }

  async getUserTransactions(userId) {
    try {
      // Fetch transactions for specific user
      const { data: transactions, error } = await this.supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching user transactions:', error);
        return { success: false, error: error.message };
      }

      return { success: true, transactions: transactions || [] };
    } catch (error) {
      console.error('Get user transactions error:', error);
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
}

const directSupabaseService = new DirectSupabaseService();
export default directSupabaseService;