import { supabase } from '../../lib/supabase'

export class AdminService {
  // Get dashboard metrics
  static async getDashboardMetrics() {
    try {
      // Get user count
      const { count: totalUsers } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })

      // Get transaction metrics
      const { data: transactions } = await supabase
        .from('transactions')
        .select('amount, status, created_at')

      const totalTransactions = transactions?.length || 0
      const revenue = transactions?.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0) || 0
      const completedTransactions = transactions?.filter(t => t.status === 'completed').length || 0
      const pendingTransactions = transactions?.filter(t => t.status === 'pending').length || 0

      // Get today's revenue
      const today = new Date().toISOString().split('T')[0]
      const todayRevenue = transactions?.filter(t => 
        t.created_at?.startsWith(today) && t.status === 'completed'
      ).reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0) || 0

      // Get course recommendations count
      const { count: recommendations } = await supabase
        .from('course_recommendations')
        .select('*', { count: 'exact', head: true })

      return {
        success: true,
        data: {
          totalUsers: totalUsers || 0,
          activeUsers: totalUsers || 0, // All registered users are active
          totalTransactions,
          revenue,
          completedTransactions,
          pendingTransactions,
          todayRevenue,
          recommendations: recommendations || 0
        }
      }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // Get all users
  static async getUsers() {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, email, full_name, role, is_admin, is_tutor, is_student, wallet_balance, status, created_at')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching users:', error)
        throw error
      }

      console.log('Fetched users:', data) // Debug log

      return {
        success: true,
        data: (data || []).map(user => ({
          id: user.id,
          name: user.full_name || user.email?.split('@')[0],
          email: user.email,
          role: user.role || 'student',
          status: 'active',
          walletBalance: user.wallet_balance || 0,
          createdAt: user.created_at
        }))
      }
    } catch (error) {
      console.error('AdminService.getUsers error:', error)
      return { success: false, error: error.message }
    }
  }

  // Get all transactions
  static async getTransactions() {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          id, amount, type, status, service_name, description, created_at,
          user_profiles!inner(email, full_name)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      return {
        success: true,
        data: data.map(tx => ({
          id: tx.id,
          amount: parseFloat(tx.amount),
          type: tx.type,
          status: tx.status,
          service: tx.service_name || tx.description,
          userEmail: tx.user_profiles.email,
          userName: tx.user_profiles.full_name,
          createdAt: tx.created_at
        }))
      }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // Get services
  static async getServices() {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // Update user role (now updates role flags)
  static async updateUserRole(userId, role) {
    try {
      const updates = {
        role,
        is_admin: role === 'admin',
        is_tutor: role === 'tutor',
        is_student: role === 'student'
      };
      
      const { error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', userId)

      if (error) throw error
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // Delete user
  static async deleteUser(userId) {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', userId)

      if (error) throw error
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // Update transaction status
  static async updateTransactionStatus(transactionId, status) {
    try {
      const { error } = await supabase
        .from('transactions')
        .update({ status })
        .eq('id', transactionId)

      if (error) throw error
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // Get course recommendations
  static async getCourseRecommendations() {
    try {
      const { data, error } = await supabase
        .from('course_recommendations')
        .select(`
          id, jamb_score, match_percentage, created_at,
          user_profiles!inner(email, full_name)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }



  // Get analytics data
  static async getAnalytics() {
    try {
      const today = new Date()
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      
      const weekAgo = new Date(today)
      weekAgo.setDate(weekAgo.getDate() - 7)

      // Daily active users
      const { count: dailyActiveUsers } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString().split('T')[0])

      // Weekly stats
      const { data: weeklyTransactions } = await supabase
        .from('transactions')
        .select('created_at, status')
        .gte('created_at', weekAgo.toISOString())

      const conversionRate = weeklyTransactions?.length > 0 
        ? (weeklyTransactions.filter(t => t.status === 'completed').length / weeklyTransactions.length * 100).toFixed(1)
        : 0

      return {
        success: true,
        data: {
          dailyActiveUsers: dailyActiveUsers || 0,
          conversionRate: parseFloat(conversionRate),
          avgSessionDuration: '8m 32s', // Mock for now
          bounceRate: 24.5 // Mock for now
        }
      }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }
}

export default AdminService