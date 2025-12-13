import { createClient } from '@supabase/supabase-js';

class DirectSupabaseService {
  constructor() {
    // Initialize with your Project URL and Anon (Public) Key
    this.supabase = createClient(
      'https://jdedscbvbkjvqmmdabig.supabase.co',
      'sb_publishable_cVZ7KXM0lNdNfuUzVD-Hlw_E4yNzJJO'
    );
  }

  /**
   * 1. GET USERS (Paginated & Searchable)
   */
  async getAllUsers(page = 1, limit = 10, search = '') {
    try {
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      // Fetch users and total count
      let query = this.supabase
        .from('user_profiles')
        .select('*', { count: 'exact' });

      // Search functionality
      if (search) {
        query = query.or(`full_name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%`);
      }

      const { data: profiles, count, error } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      // Map database fields to frontend structure
      const users = profiles.map(profile => ({
        id: profile.id,
        // REAL EMAIL: Now fetching directly from the database column
        email: profile.email || 'No Email Linked', 
        name: profile.full_name || 'Unknown User',
        phone: profile.phone || 'N/A',
        role: profile.role || 'user',
        status: profile.status || 'active',
        walletBalance: profile.wallet_balance || 0,
        createdAt: profile.created_at || new Date().toISOString()
      }));

      return { success: true, users, totalCount: count };

    } catch (error) {
      console.error('❌ Get Users Error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 2. GET TRANSACTIONS (Safe Mode)
   * Fetches transactions and users separately to prevent crashes.
   */
  async getAllTransactions(page = 1, limit = 10, search = '') {
    try {
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      // A. Fetch Transactions
      let query = this.supabase
        .from('transactions')
        .select('*', { count: 'exact' });

      if (search) {
        query = query.or(`id.ilike.%${search}%,description.ilike.%${search}%`);
      }

      const { data: transactions, count, error } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      if (!transactions || transactions.length === 0) {
        return { success: true, transactions: [], totalCount: 0 };
      }

      // B. Fetch Related Users manually
      const userIds = [...new Set(transactions.map(t => t.user_id))];
      const { data: users } = await this.supabase
        .from('user_profiles')
        .select('id, full_name, email')
        .in('id', userIds);

      // C. Merge Data
      const formattedData = transactions.map(tx => {
        const user = users?.find(u => u.id === tx.user_id);
        return {
          ...tx,
          userName: user?.full_name || 'Unknown User',
          // REAL EMAIL: Using the email fetched from the profile
          userEmail: user?.email || 'N/A'
        };
      });

      return { success: true, transactions: formattedData, totalCount: count };

    } catch (error) {
      console.error('❌ Get Transactions Error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 3. GET SINGLE USER TRANSACTIONS
   * Used by User Detail Modal to show history for one person.
   */
  async getUserTransactions(userId) {
    try {
      const { data, error } = await this.supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { success: true, transactions: data || [] };
    } catch (error) {
      console.error('❌ User Transactions Error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 4. GET CREDIT REQUESTS
   */
  async getCreditRequests() {
    try {
      const { data, error } = await this.supabase
        .from('credit_requests')
        .select(`*, user_profiles:user_id (full_name, email)`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { success: true, requests: data || [] };
    } catch (error) {
      console.error('Credit Requests Error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 5. DASHBOARD STATS
   */
  async getDashboardStats() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayISO = today.toISOString();

      const [totalUsers, totalTx, revenueData, activeUsers] = await Promise.all([
        this.supabase.from('user_profiles').select('*', { count: 'exact', head: true }),
        this.supabase.from('transactions').select('*', { count: 'exact', head: true }),
        this.supabase.from('transactions').select('amount').eq('type', 'credit').eq('status', 'successful'),
        this.supabase.from('user_profiles').select('*', { count: 'exact', head: true }).gte('updated_at', todayISO)
      ]);

      // Calculate simple revenue sum
      const totalRevenue = revenueData.data 
        ? revenueData.data.reduce((sum, tx) => sum + (tx.amount || 0), 0)
        : 0;

      return {
        success: true,
        stats: {
          totalUsers: totalUsers.count || 0,
          totalTransactions: totalTx.count || 0,
          totalRevenue: totalRevenue,
          activeToday: activeUsers.count || 0
        }
      };

    } catch (error) {
      console.error('❌ Stats Error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 6. GET REAL CHART DATA (Last 7 Days)
   * Fetches raw data for the last week and aggregates it by day.
   */
  async getChartData() {
    try {
      const today = new Date();
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(today.getDate() - 6); // Go back 6 days + today = 7 days

      const isoDate = sevenDaysAgo.toISOString();

      // Run two parallel queries for the last 7 days
      const [txResult, usersResult] = await Promise.all([
        this.supabase
          .from('transactions')
          .select('created_at, amount')
          .eq('type', 'credit')
          .eq('status', 'successful')
          .gte('created_at', isoDate),
        this.supabase
          .from('user_profiles')
          .select('created_at')
          .gte('created_at', isoDate)
      ]);

      if (txResult.error) throw txResult.error;
      if (usersResult.error) throw usersResult.error;

      // Initialize the 7-day buckets
      const chartData = [];
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

      for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        const dateStr = d.toDateString(); // e.g. "Fri Dec 13 2025"
        const dayName = days[d.getDay()]; // e.g. "Fri"

        // Filter data for this specific day
        const dayRevenue = txResult.data
          .filter(t => new Date(t.created_at).toDateString() === dateStr)
          .reduce((sum, t) => sum + (t.amount || 0), 0);

        const dayUsers = usersResult.data
          .filter(u => new Date(u.created_at).toDateString() === dateStr)
          .length;

        // Add to start of array (so oldest day is first)
        chartData.unshift({
          name: dayName,
          date: dateStr, // Hidden field for debugging
          revenue: dayRevenue,
          users: dayUsers
        });
      }

      return { success: true, chartData };

    } catch (error) {
      console.error('❌ Chart Data Error:', error);
      return { success: false, error: error.message };
    }
  }
}

const directSupabaseService = new DirectSupabaseService();
export default directSupabaseService;