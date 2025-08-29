import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useAdmin } from '../contexts/AdminContext';
import adminService from '../services/admin.service';
import { toast } from 'react-toastify';
import { 
  ChartBarIcon, 
  UsersIcon, 
  CreditCardIcon, 
  ClockIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EyeIcon,
  ArrowPathIcon,
  ChevronRightIcon,
  BanknotesIcon,
  UserGroupIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';

const AdminDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const { isAdmin, isAdminResolved } = useAdmin();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    newUsersToday: 0,
    adminUsers: 0,
    totalTransactions: 0,
    totalRevenue: 0,
    pendingTransactions: 0,
    revenueGrowth: 0,
    userGrowth: 0,
    avgTransactionValue: 0
  });
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('revenue');

  useEffect(() => {
    if (isAdminResolved && isAdmin) {
      fetchDashboardData();
    }
  }, [isAdminResolved, isAdmin]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch users and transactions in parallel
      const [usersResponse, transactionsResponse] = await Promise.all([
        adminService.getUsers(),
        adminService.getTransactions()
      ]);

      const usersData = usersResponse.users || usersResponse || [];
      const transactionsData = Array.isArray(transactionsResponse) ? transactionsResponse : [];

      setUsers(usersData);
      setTransactions(transactionsData);

      // Calculate stats with growth metrics
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const lastWeek = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      const completedTransactions = transactionsData.filter(t => t.status === 'completed');
      const thisWeekRevenue = completedTransactions
        .filter(t => new Date(t.createdAt) > thisWeek)
        .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
      const lastWeekRevenue = completedTransactions
        .filter(t => new Date(t.createdAt) > lastWeek && new Date(t.createdAt) <= thisWeek)
        .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
      
      const thisWeekUsers = usersData.filter(u => new Date(u.created_at) > thisWeek).length;
      const lastWeekUsers = usersData.filter(u => 
        new Date(u.created_at) > lastWeek && new Date(u.created_at) <= thisWeek
      ).length;

      const calculatedStats = {
        totalUsers: usersData.length,
        activeUsers: usersData.filter(u => 
          u.last_sign_in_at && new Date(u.last_sign_in_at) > thisWeek
        ).length,
        newUsersToday: usersData.filter(u => 
          new Date(u.created_at) >= today
        ).length,
        adminUsers: usersData.filter(u => u.role === 'admin').length,
        totalTransactions: transactionsData.length,
        totalRevenue: completedTransactions.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0),
        pendingTransactions: transactionsData.filter(t => t.status === 'pending').length,
        revenueGrowth: lastWeekRevenue > 0 ? ((thisWeekRevenue - lastWeekRevenue) / lastWeekRevenue * 100) : 0,
        userGrowth: lastWeekUsers > 0 ? ((thisWeekUsers - lastWeekUsers) / lastWeekUsers * 100) : 0,
        avgTransactionValue: completedTransactions.length > 0 ? 
          completedTransactions.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0) / completedTransactions.length : 0
      };

      setStats(calculatedStats);
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
    toast.success('Dashboard refreshed');
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      await adminService.updateUserRole(userId, newRole);
      toast.success('User role updated');
      fetchDashboardData();
    } catch (err) {
      toast.error('Failed to update user role');
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await adminService.deleteUser(userId);
      toast.success('User deleted');
      fetchDashboardData();
    } catch (err) {
      toast.error('Failed to delete user');
    }
  };

  if (!isAdminResolved) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p>You don't have admin privileges.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>Loading dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const StatCard = ({ title, value, icon: Icon, change, changeType, color = 'blue' }) => {
    const colorClasses = {
      blue: 'bg-blue-50 text-blue-600 border-blue-200',
      green: 'bg-green-50 text-green-600 border-green-200',
      purple: 'bg-purple-50 text-purple-600 border-purple-200',
      orange: 'bg-orange-50 text-orange-600 border-orange-200',
      red: 'bg-red-50 text-red-600 border-red-200'
    };

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            <Icon className="h-6 w-6" />
          </div>
          {change !== undefined && (
            <div className={`flex items-center text-sm font-medium ${
              changeType === 'positive' ? 'text-green-600' : 'text-red-600'
            }`}>
              {changeType === 'positive' ? (
                <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
              ) : (
                <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />
              )}
              {Math.abs(change).toFixed(1)}%
            </div>
          )}
        </div>
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome back, {user?.name || user?.email}</p>
            </div>
            <div className="mt-4 sm:mt-0 flex items-center space-x-3">
              <select 
                value={timeRange} 
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="24h">Last 24 hours</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                <ArrowPathIcon className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
            <button 
              onClick={fetchDashboardData}
              className="mt-2 text-red-600 underline hover:no-underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Users"
            value={stats.totalUsers.toLocaleString()}
            icon={UsersIcon}
            change={stats.userGrowth}
            changeType={stats.userGrowth >= 0 ? 'positive' : 'negative'}
            color="blue"
          />
          <StatCard
            title="Total Revenue"
            value={`₦${stats.totalRevenue.toLocaleString()}`}
            icon={BanknotesIcon}
            change={stats.revenueGrowth}
            changeType={stats.revenueGrowth >= 0 ? 'positive' : 'negative'}
            color="green"
          />
          <StatCard
            title="Active Users"
            value={stats.activeUsers.toLocaleString()}
            icon={UserGroupIcon}
            color="purple"
          />
          <StatCard
            title="Pending Transactions"
            value={stats.pendingTransactions.toLocaleString()}
            icon={ClockIcon}
            color="orange"
          />
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center">
              <CalendarDaysIcon className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-sm font-medium text-gray-500">New Users Today</span>
            </div>
            <p className="text-xl font-bold text-gray-900 mt-2">{stats.newUsersToday}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center">
              <ChartBarIcon className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-sm font-medium text-gray-500">Avg Transaction</span>
            </div>
            <p className="text-xl font-bold text-gray-900 mt-2">₦{stats.avgTransactionValue.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center">
              <CreditCardIcon className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-sm font-medium text-gray-500">Total Transactions</span>
            </div>
            <p className="text-xl font-bold text-gray-900 mt-2">{stats.totalTransactions.toLocaleString()}</p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
          {/* Recent Users */}
          <div className="xl:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Users</h2>
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center">
                View all <ChevronRightIcon className="h-4 w-4 ml-1" />
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {users.slice(0, 5).map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {(user.name || user.email).charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.name || user.email}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                        <p className="text-xs text-gray-400">
                          Joined {new Date(user.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        user.role === 'admin' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role || 'user'}
                      </span>
                      <button className="p-1 text-gray-400 hover:text-gray-600">
                        <EyeIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Admin Users</span>
                  <span className="font-semibold text-gray-900">{stats.adminUsers}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Success Rate</span>
                  <span className="font-semibold text-green-600">98.5%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Response Time</span>
                  <span className="font-semibold text-blue-600">1.2s</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
              <h3 className="text-lg font-semibold mb-2">System Health</h3>
              <p className="text-blue-100 text-sm mb-4">All systems operational</p>
              <div className="flex items-center">
                <div className="h-2 w-2 bg-green-400 rounded-full mr-2"></div>
                <span className="text-sm">Online</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center">
              View all <ChevronRightIcon className="h-4 w-4 ml-1" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.slice(0, 5).map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                          {(transaction.user?.name || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">{transaction.user?.name || 'Unknown User'}</p>
                          <p className="text-sm text-gray-500">{transaction.description || transaction.type}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">₦{transaction.amount}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        transaction.status === 'completed' 
                          ? 'bg-green-100 text-green-800'
                          : transaction.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {transaction.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="group p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all text-left">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                  <UsersIcon className="h-5 w-5 text-blue-600" />
                </div>
                <ChevronRightIcon className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
              </div>
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-900">Manage Users</h3>
              <p className="text-sm text-gray-500 mt-1">View and manage all users</p>
            </button>
            
            <button className="group p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-green-200 transition-all text-left">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-green-50 rounded-lg group-hover:bg-green-100 transition-colors">
                  <CreditCardIcon className="h-5 w-5 text-green-600" />
                </div>
                <ChevronRightIcon className="h-4 w-4 text-gray-400 group-hover:text-green-600 transition-colors" />
              </div>
              <h3 className="font-semibold text-gray-900 group-hover:text-green-900">Transactions</h3>
              <p className="text-sm text-gray-500 mt-1">Monitor all transactions</p>
            </button>
            
            <button className="group p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-purple-200 transition-all text-left">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-purple-50 rounded-lg group-hover:bg-purple-100 transition-colors">
                  <ChartBarIcon className="h-5 w-5 text-purple-600" />
                </div>
                <ChevronRightIcon className="h-4 w-4 text-gray-400 group-hover:text-purple-600 transition-colors" />
              </div>
              <h3 className="font-semibold text-gray-900 group-hover:text-purple-900">Analytics</h3>
              <p className="text-sm text-gray-500 mt-1">View detailed reports</p>
            </button>
            
            <button className="group p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-orange-200 transition-all text-left">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-orange-50 rounded-lg group-hover:bg-orange-100 transition-colors">
                  <ClockIcon className="h-5 w-5 text-orange-600" />
                </div>
                <ChevronRightIcon className="h-4 w-4 text-gray-400 group-hover:text-orange-600 transition-colors" />
              </div>
              <h3 className="font-semibold text-gray-900 group-hover:text-orange-900">Pending Items</h3>
              <p className="text-sm text-gray-500 mt-1">Review pending approvals</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;