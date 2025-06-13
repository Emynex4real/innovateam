import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAdmin } from '../contexts/AdminContext';
import adminService from '../services/admin.service';
import {
  Users,
  ShoppingCart,
  DollarSign,
  BarChart2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const MetricCard = ({ title, value, icon: Icon, color }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-lg shadow p-6"
  >
    <div className="flex items-center">
      <div className={`p-3 rounded-full ${color}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <div className="ml-4">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  </motion.div>
);

const AdminDashboard = () => {
  const { setError, error } = useAdmin();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    totalTransactions: 0,
    totalRevenue: 0,
    pendingTransactions: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await adminService.getDashboardMetrics();
        setMetrics(data);
      } catch (error) {
        setError('Failed to fetch dashboard metrics');
        console.error('Error fetching metrics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetrics();
  }, [setError]);

  // Debug output
  return (
    <div>
      <div className="mb-4 p-2 bg-gray-200 rounded text-xs">
        <div><b>DEBUG:</b></div>
        <div>User: {user ? JSON.stringify(user) : 'null'}</div>
        <div>isAuthenticated: {String(isAuthenticated)}</div>
        <div>authLoading: {String(authLoading)}</div>
        <div>dashboardLoading: {String(isLoading)}</div>
        <div>error: {error || 'none'}</div>
      </div>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      {isLoading ? (
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow p-6">
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-12 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <MetricCard
              title="Total Users"
              value={metrics.totalUsers}
              icon={Users}
              color="bg-blue-500"
            />
            <MetricCard
              title="Total Transactions"
              value={metrics.totalTransactions}
              icon={ShoppingCart}
              color="bg-green-500"
            />
            <MetricCard
              title="Total Revenue"
              value={`₦${metrics.totalRevenue.toLocaleString()}`}
              icon={DollarSign}
              color="bg-yellow-500"
            />
            <MetricCard
              title="Pending Transactions"
              value={metrics.pendingTransactions}
              icon={BarChart2}
              color="bg-purple-500"
            />
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Recent Activity
            </h3>
            <p className="text-gray-500">
              Transaction activity chart will be implemented here
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard; 