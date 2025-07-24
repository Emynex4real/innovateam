import React, { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAdmin } from '../contexts/AdminContext';
import { useAuth } from '../contexts/AuthContext';
import {
  Users,
  ShoppingCart,
  DollarSign,
  BarChart2,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';

const MetricCard = ({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  trend = 'stable',  // 'up', 'down', or 'stable'
  trendValue
}) => {
  const trendConfig = {
    up: {
      icon: '↑',
      color: 'text-green-500',
      bgColor: 'bg-green-50',
      text: 'text-green-700'
    },
    down: {
      icon: '↓',
      color: 'text-red-500',
      bgColor: 'bg-red-50',
      text: 'text-red-700'
    },
    stable: {
      icon: '→',
      color: 'text-gray-500',
      bgColor: 'bg-gray-50',
      text: 'text-gray-700'
    }
  };

  const trendData = trendConfig[trend] || trendConfig.stable;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200"
    >
      <div className="flex items-start justify-between">
        <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
        {trendValue && (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${trendData.bgColor} ${trendData.text}`}>
            {trendData.icon} {trendValue}
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
      </div>
    </motion.div>
  );
};

const QuickAction = ({ label, onClick, icon }) => (
  <button
    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow"
    onClick={onClick}
  >
    {icon}
    {label}
  </button>
);

const AdminDashboard = () => {
  const { isAuthResolved } = useAuth();
  const {
    isAdminResolved,
    dashboardMetrics,
    fetchDashboardMetrics,
    isLoading: isMetricsLoading,
    error: metricsError
  } = useAdmin();

  // Default empty metrics to prevent null reference errors
  const safeMetrics = useMemo(() => ({
    totalUsers: 0,
    totalTransactions: 0,
    revenue: 0,
    totalServices: 0,
    recentTransactions: [],
    recentUsers: [],
    ...dashboardMetrics
  }), [dashboardMetrics]);

  // Defensive fallback: if dashboardMetrics is null, use safeMetrics everywhere
  const metricsToUse = dashboardMetrics && typeof dashboardMetrics === 'object' ? safeMetrics : {
    totalUsers: 0,
    totalTransactions: 0,
    revenue: 0,
    totalServices: 0,
    recentTransactions: [],
    recentUsers: [],
    recentServices: []
  };

  // Format the revenue for display
  const formattedRevenue = useMemo(() => {
    const amount = safeMetrics.revenue || 0;
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }, [safeMetrics.revenue]);

  // Handle refresh
  const handleRefresh = () => {
    console.log('Refreshing dashboard data...');
    fetchDashboardMetrics();
  };

  useEffect(() => {
    console.log('AdminDashboard: Component mounted, fetching metrics...');
    fetchDashboardMetrics()
      .then(() => {
        console.log('AdminDashboard: Successfully fetched metrics');
      })
      .catch(err => {
        console.error('AdminDashboard: Error fetching metrics:', err);
      });
    // eslint-disable-next-line
  }, []);

  // Only fetch metrics after auth and admin are resolved
  useEffect(() => {
    if (isAuthResolved && isAdminResolved) {
      fetchDashboardMetrics();
    }
    // eslint-disable-next-line
  }, [isAuthResolved, isAdminResolved]);

  // Show loading state until both contexts are resolved
  if (!isAuthResolved || !isAdminResolved || isMetricsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-lg text-gray-700">Loading dashboard data...</p>
          <p className="text-sm text-gray-500 mt-2">Please wait while we load your dashboard</p>
        </div>
      </div>
    );
  }

  console.log('AdminDashboard render with state:', { 
    isMetricsLoading, 
    metricsError, 
    hasMetrics: !!dashboardMetrics,
    metrics: dashboardMetrics 
  });

  // Show loading state
  if (isMetricsLoading && !safeMetrics) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-lg text-gray-700">Loading dashboard data...</p>
          <p className="text-sm text-gray-500 mt-2">Please wait while we load your dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Admin Dashboard</h2>
        <button
          onClick={handleRefresh}
          disabled={isMetricsLoading}
          className={`flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            isMetricsLoading ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {isMetricsLoading ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Refreshing...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Data
            </>
          )}
        </button>
      </div>

      {metricsError && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-500" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                {metricsError.message || 'Failed to load dashboard data. Please try again.'}
              </p>
              <button
                onClick={handleRefresh}
                className="mt-2 text-sm font-medium text-red-700 hover:text-red-600"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      )}

      {isMetricsLoading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow p-6">
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <MetricCard
              title="Total Users"
              value={safeMetrics.totalUsers?.toLocaleString() || '0'}
              icon={Users}
              color="bg-blue-500"
              trend="up"
              trendValue="12.5%"
            />
            <MetricCard
              title="Total Transactions"
              value={safeMetrics.totalTransactions?.toLocaleString() || '0'}
              icon={ShoppingCart}
              color="bg-green-500"
              trend="up"
              trendValue="8.2%"
            />
            <MetricCard
              title="Total Revenue"
              value={formattedRevenue}
              icon={DollarSign}
              color="bg-purple-500"
              trend="up"
              trendValue="15.3%"
            />
            <MetricCard
              title="Active Services"
              value={safeMetrics.totalServices?.toLocaleString() || '0'}
              icon={BarChart2}
              color="bg-yellow-500"
              trend="stable"
              trendValue="0%"
            />
          </div>

          <div className="flex flex-wrap gap-4 mb-8">
            <QuickAction label="Add Service" onClick={() => alert('Add Service')} icon={<BarChart2 />} />
            <QuickAction label="Send Notification" onClick={() => alert('Send Notification')} icon={<Users />} />
            <QuickAction label="View Reports" onClick={() => alert('View Reports')} icon={<DollarSign />} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Users</h3>
              <ul>
                {(metricsToUse.recentUsers || []).map(u => (
                  <li key={u.id} className="mb-2 flex justify-between items-center">
                    <span>{u.name}</span>
                    <span className="text-xs text-gray-500">{u.email}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Transactions</h3>
              <ul>
                {(metricsToUse.recentTransactions || []).map(t => (
                  <li key={t.id} className="mb-2 flex justify-between items-center">
                    <span>{t.user?.name || t.user || 'Unknown'}</span>
                    <span className="text-xs text-gray-500">₦{t.amount}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Services</h3>
              <ul>
                {(metricsToUse.recentServices || []).map(s => (
                  <li key={s.id} className="mb-2 flex justify-between items-center">
                    <span>{s.name}</span>
                    <span className="text-xs text-gray-500">₦{s.price}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Recent Transactions</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Service
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(metricsToUse.recentTransactions || []).length > 0 ? (
                    metricsToUse.recentTransactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {transaction.user}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {transaction.service}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ₦{Number(transaction.amount).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
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
                          {format(new Date(transaction.date), 'MMM d, yyyy h:mm a')}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                        No recent transactions
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {(metricsToUse.recentTransactions || []).length > 0 && (
              <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
                <div className="text-sm text-gray-500">
                  Showing <span className="font-medium">1</span> to <span className="font-medium">
                    {Math.min(3, metricsToUse.recentTransactions.length)}
                  </span> of <span className="font-medium">{metricsToUse.recentTransactions.length}</span> results
                </div>
                <div className="flex-1 flex justify-end">
                  <button className="text-sm font-medium text-blue-600 hover:text-blue-500">
                    View all transactions →
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Activity Chart</h3>
            <p className="text-gray-500">(Chart coming soon...)</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;