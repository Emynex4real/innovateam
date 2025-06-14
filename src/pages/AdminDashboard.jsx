import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAdmin } from '../contexts/AdminContext';
import {
  Users,
  ShoppingCart,
  DollarSign,
  BarChart2
} from 'lucide-react';

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
  console.log('AdminDashboard FUNCTION BODY running');
  const {
    dashboardMetrics,
    fetchDashboardMetrics,
    isLoading,
    error
  } = useAdmin();

  useEffect(() => {
    fetchDashboardMetrics();
    // eslint-disable-next-line
  }, []);

  console.log('AdminDashboard RETURN about to render');
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Admin Dashboard</h2>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      {isLoading || !dashboardMetrics ? (
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
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <MetricCard
              title="Total Users"
              value={dashboardMetrics.totalUsers}
              icon={Users}
              color="bg-blue-500"
            />
            <MetricCard
              title="Total Transactions"
              value={dashboardMetrics.totalTransactions}
              icon={ShoppingCart}
              color="bg-green-500"
            />
            <MetricCard
              title="Total Revenue"
              value={`₦${dashboardMetrics.revenue.toLocaleString()}`}
              icon={DollarSign}
              color="bg-yellow-500"
            />
            <MetricCard
              title="Active Services"
              value={dashboardMetrics.totalServices}
              icon={BarChart2}
              color="bg-purple-500"
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
                {dashboardMetrics.recentUsers?.map(u => (
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
                {dashboardMetrics.recentTransactions?.map(t => (
                  <li key={t.id} className="mb-2 flex justify-between items-center">
                    <span>{t.user.name}</span>
                    <span className="text-xs text-gray-500">₦{t.amount}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Services</h3>
              <ul>
                {dashboardMetrics.recentServices?.map(s => (
                  <li key={s.id} className="mb-2 flex justify-between items-center">
                    <span>{s.name}</span>
                    <span className="text-xs text-gray-500">₦{s.price}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Activity Chart</h3>
            <p className="text-gray-500">(Chart coming soon...)</p>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard; 