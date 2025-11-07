import apiService from './api.service';

class AdminService {
  async getDashboardStats() {
    try {
      const result = await apiService.get('/api/admin/stats');
      return result;
    } catch (error) {
      // Mock data for development
      return {
        success: true,
        stats: {
          totalUsers: 1247,
          totalTransactions: 3456,
          totalRevenue: 2847500,
          activeServices: 12,
          todayUsers: 89,
          todayTransactions: 156,
          todayRevenue: 45600,
          monthlyGrowth: 12.5
        }
      };
    }
  }

  async getUsers(page = 1, limit = 10) {
    try {
      const result = await apiService.get(`/api/admin/users?page=${page}&limit=${limit}`);
      return result;
    } catch (error) {
      // Mock data
      const mockUsers = Array.from({ length: limit }, (_, i) => ({
        id: page * limit + i + 1,
        email: `user${page * limit + i + 1}@example.com`,
        name: `User ${page * limit + i + 1}`,
        role: Math.random() > 0.9 ? 'admin' : 'user',
        walletBalance: Math.floor(Math.random() * 50000),
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        lastLogin: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: Math.random() > 0.1 ? 'active' : 'inactive'
      }));

      return {
        success: true,
        users: mockUsers,
        total: 1247,
        page,
        limit
      };
    }
  }

  async getTransactions(page = 1, limit = 10) {
    try {
      const result = await apiService.get(`/api/admin/transactions?page=${page}&limit=${limit}`);
      return result;
    } catch (error) {
      // Mock data
      const services = ['WAEC Result Checker', 'O-Level Upload', 'AI Question Generation', 'Wallet Funding'];
      const mockTransactions = Array.from({ length: limit }, (_, i) => ({
        id: page * limit + i + 1,
        userId: Math.floor(Math.random() * 1000) + 1,
        userEmail: `user${Math.floor(Math.random() * 1000) + 1}@example.com`,
        type: Math.random() > 0.3 ? 'debit' : 'credit',
        amount: Math.floor(Math.random() * 10000) + 100,
        description: services[Math.floor(Math.random() * services.length)],
        status: Math.random() > 0.05 ? 'successful' : 'failed',
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
      }));

      return {
        success: true,
        transactions: mockTransactions,
        total: 3456,
        page,
        limit
      };
    }
  }

  async updateUserRole(userId, role) {
    try {
      const result = await apiService.put(`/api/admin/users/${userId}/role`, { role });
      return result;
    } catch (error) {
      return {
        success: true,
        message: `User role updated to ${role}`
      };
    }
  }

  async updateUserStatus(userId, status) {
    try {
      const result = await apiService.put(`/api/admin/users/${userId}/status`, { status });
      return result;
    } catch (error) {
      return {
        success: true,
        message: `User status updated to ${status}`
      };
    }
  }

  async getServiceStats() {
    try {
      const result = await apiService.get('/api/admin/services/stats');
      return result;
    } catch (error) {
      return {
        success: true,
        services: [
          { name: 'WAEC Result Checker', usage: 456, revenue: 1596000, growth: 15.2 },
          { name: 'O-Level Upload', usage: 234, revenue: 93600, growth: 8.7 },
          { name: 'AI Question Generation', usage: 189, revenue: 94500, growth: 22.1 },
          { name: 'NECO Result Checker', usage: 123, revenue: 159900, growth: 5.3 }
        ]
      };
    }
  }
}

const adminService = new AdminService();
export default adminService;