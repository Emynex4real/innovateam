import supabase from '../lib/supabase';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const supabaseAdmin = supabase;

class SupabaseAdminService {
  async getAllUsers() {
    try {
      // Use backend API to get all users from Supabase Auth
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        return { success: true, users: response.data.users };
      }
      
      throw new Error('Failed to fetch users from API');
    } catch (error) {
      console.error('Get users error:', error);
      
      // Fallback: Try to get from user_profiles table
      try {
        const { data: profiles, error: profileError } = await supabaseAdmin
          .from('user_profiles')
          .select('*')
          .order('created_at', { ascending: false });

        if (profileError) throw profileError;

        const users = profiles.map(profile => ({
          id: profile.id,
          email: profile.email || `${profile.full_name}@example.com`,
          name: profile.full_name,
          phone: profile.phone,
          role: profile.role || 'user',
          status: profile.status || 'active',
          walletBalance: profile.wallet_balance || 0,
          created_at: profile.created_at,
          last_sign_in_at: profile.updated_at
        }));

        return { success: true, users };
      } catch (fallbackError) {
        console.error('Fallback get users error:', fallbackError);
        return { success: false, error: error.message };
      }
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

  async deleteUser(userId) {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`${API_URL}/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        return { success: true, message: 'User deleted successfully' };
      }
      
      throw new Error('Failed to delete user');
    } catch (error) {
      console.error('Delete user error:', error);
      return { success: false, error: error.response?.data?.error || error.message };
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