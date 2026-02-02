import supabase from '../config/supabase';

class DirectSupabaseService {
  constructor() {
    this.supabase = supabase;
  }

  /**
   * 1. GET USERS (Paginated & Searchable)
   */
  async getAllUsers(page = 1, limit = 10, search = '') {
    try {
      // console.log('🔍 [DirectSupabase] getAllUsers called:', { page, limit, search });
      
      // Fetch ALL users without pagination for admin dashboard
      let query = this.supabase
        .from('user_profiles')
        .select('*', { count: 'exact' });

      // Search functionality
      if (search) {
        query = query.or(`full_name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%`);
      }

      const { data: profiles, count, error } = await query
        .order('created_at', { ascending: false });

      // console.log('🔍 [DirectSupabase] Query result:', { profilesCount: profiles?.length, count, error });
      
      if (error) {
        console.error('❌ [DirectSupabase] Query error:', error);
        throw error;
      }

      // console.log('🔍 [DirectSupabase] Raw profiles:', profiles);

      // Map database fields to frontend structure
      const users = profiles.map(profile => ({
        id: profile.id,
        email: profile.email || 'No Email Linked', 
        name: profile.full_name || 'Unknown User',
        phone: profile.phone || 'N/A',
        role: profile.role || 'user',
        status: profile.status || 'active',
        walletBalance: profile.wallet_balance || 0,
        createdAt: profile.created_at || new Date().toISOString()
      }));

      // console.log('✅ [DirectSupabase] Mapped users:', users);

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
  /**
   * 7. GET STUDENT PROGRESS (Calculates Level, Streak, & XP from DB)
   * Replaces localStorage logic with real database aggregation.
   */
  async getStudentProgress(userId) {
    try {
      // Fetch all practice history for this user
      const { data: history, error } = await this.supabase
        .from('practice_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!history || history.length === 0) {
        return { 
          success: true, 
          stats: { totalSessions: 0, averageScore: 0, streak: 0, level: 1, progress: 0, totalQuestions: 0, chartData: [], hasPracticedToday: false } 
        };
      }

      // --- A. CALCULATE AGGREGATES ---
      const totalSessions = history.length;
      const totalQuestions = history.reduce((sum, session) => sum + (session.total_questions || 0), 0);
      const totalScore = history.reduce((sum, session) => sum + (session.score || 0), 0);
      const averageScore = Math.round(totalScore / totalSessions);

      // --- B. CALCULATE LEVEL (Gamification) ---
      // Logic: Every 50 questions = 1 Level
      const level = Math.floor(totalQuestions / 50) + 1;
      const progress = ((totalQuestions % 50) / 50) * 100;

      // --- C. CALCULATE STREAK (Real-Time) ---
      let streak = 0;
      const today = new Date();
      today.setHours(0,0,0,0);
      let checkDate = new Date(today);
      
      // Get unique dates the user practiced
      const practiceDates = new Set(
        history.map(h => new Date(h.created_at).toDateString())
      );

      // Check today (if practiced today, streak starts at 1, else check yesterday)
      if (practiceDates.has(checkDate.toDateString())) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1); // Move to yesterday
      } else {
        // If not practiced today, check if streak ended yesterday
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        if (!practiceDates.has(yesterday.toDateString())) {
          streak = 0; // Streak broken
        } else {
          checkDate = yesterday; // Streak is alive, start counting from yesterday
        }
      }

      // Count backwards
      while (streak > 0 && practiceDates.has(checkDate.toDateString())) {
        // We already counted the first day above, so we check consecutive days
        // This is a simplified loop for the "next" days
        checkDate.setDate(checkDate.getDate() - 1);
        if (practiceDates.has(checkDate.toDateString())) {
          streak++;
        } else {
          break;
        }
      }

      // --- D. PREPARE CHART DATA (Last 7 Days) ---
      const chartData = [];
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const now = new Date();

      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        const dateStr = d.toDateString();
        
        const daySessions = history.filter(h => new Date(h.created_at).toDateString() === dateStr);
        let dayAvg = 0;
        if (daySessions.length > 0) {
          const dayTotal = daySessions.reduce((sum, s) => sum + (s.score || 0), 0);
          dayAvg = Math.round(dayTotal / daySessions.length);
        }

        chartData.push({
          day: days[d.getDay()],
          fullDate: dateStr,
          score: dayAvg
        });
      }

      const hasPracticedToday = practiceDates.has(today.toDateString());

      return {
        success: true,
        stats: {
          totalSessions,
          averageScore,
          streak,
          level,
          progress,
          totalQuestions,
          chartData,
          hasPracticedToday
        }
      };

    } catch (error) {
      console.error('Progress Error:', error);
      return { success: false, error: error.message };
    }
  }
}

const directSupabaseService = new DirectSupabaseService();
export default directSupabaseService;