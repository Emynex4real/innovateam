import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useWallet } from '../contexts/WalletContext';
import { toast } from 'react-toastify';
import {
  WalletIcon,
  CreditCardIcon,
  DocumentTextIcon,
  AcademicCapIcon,
  ChartBarIcon,
  BellIcon,
  UserCircleIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  CheckCircleIcon,
  PlusIcon,
  EyeIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

const UserDashboard = () => {
  const { user } = useAuth();
  const { balance, transactions, loading: walletLoading, fetchWalletData } = useWallet();
  const [stats, setStats] = useState({
    totalSpent: 0,
    servicesUsed: 0,
    pendingTransactions: 0,
    completedTransactions: 0
  });

  useEffect(() => {
    fetchWalletData();
  }, []);

  useEffect(() => {
    if (transactions.length > 0) {
      const completed = transactions.filter(t => t.status === 'completed');
      const pending = transactions.filter(t => t.status === 'pending');
      
      setStats({
        totalSpent: completed.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0),
        servicesUsed: completed.length,
        pendingTransactions: pending.length,
        completedTransactions: completed.length
      });
    }
  }, [transactions]);

  const services = [
    {
      id: 1,
      name: 'JAMB Services',
      description: 'Registration, Result Checking, Admission',
      icon: AcademicCapIcon,
      color: 'from-blue-500 to-blue-600',
      href: '/jamb-services'
    },
    {
      id: 2,
      name: 'O-Level Upload',
      description: 'Upload and verify O-Level results',
      icon: DocumentTextIcon,
      color: 'from-green-500 to-green-600',
      href: '/olevel-upload'
    },
    {
      id: 3,
      name: 'AI Examiner',
      description: 'Practice tests and assessments',
      icon: ChartBarIcon,
      color: 'from-purple-500 to-purple-600',
      href: '/ai-examiner'
    },
    {
      id: 4,
      name: 'Course Advisor',
      description: 'Get personalized course recommendations',
      icon: UserCircleIcon,
      color: 'from-orange-500 to-orange-600',
      href: '/course-advisor'
    }
  ];

  const StatCard = ({ title, value, icon: Icon, color, change }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className={`p-3 rounded-lg bg-gradient-to-r ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        {change && (
          <div className="flex items-center text-sm font-medium text-green-600">
            <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
            {change}%
          </div>
        )}
      </div>
      <div className="mt-4">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      </div>
    </div>
  );

  const ServiceCard = ({ service }) => (
    <div className="group bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:border-blue-200 transition-all cursor-pointer">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg bg-gradient-to-r ${service.color}`}>
          <service.icon className="h-6 w-6 text-white" />
        </div>
        <ArrowRightIcon className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{service.name}</h3>
      <p className="text-sm text-gray-600">{service.description}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user?.name || user?.email?.split('@')[0]}!
              </h1>
              <p className="text-gray-600 mt-1">Here's what's happening with your account</p>
            </div>
            <div className="mt-4 sm:mt-0 flex items-center space-x-3">
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg relative">
                <BellIcon className="h-6 w-6" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </div>

        {/* Wallet Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-2xl p-8 text-white">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center mb-2">
                  <WalletIcon className="h-6 w-6 mr-2" />
                  <span className="text-blue-100">Wallet Balance</span>
                </div>
                <div className="text-4xl font-bold mb-2">
                  ₦{walletLoading ? '...' : balance.toLocaleString()}
                </div>
                <p className="text-blue-100">Available for services</p>
              </div>
              <div className="mt-6 sm:mt-0">
                <button className="bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-colors inline-flex items-center">
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Fund Wallet
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Spent"
            value={`₦${stats.totalSpent.toLocaleString()}`}
            icon={CreditCardIcon}
            color="from-green-500 to-green-600"
          />
          <StatCard
            title="Services Used"
            value={stats.servicesUsed}
            icon={CheckCircleIcon}
            color="from-blue-500 to-blue-600"
          />
          <StatCard
            title="Pending"
            value={stats.pendingTransactions}
            icon={ClockIcon}
            color="from-yellow-500 to-yellow-600"
          />
          <StatCard
            title="Completed"
            value={stats.completedTransactions}
            icon={CheckCircleIcon}
            color="from-purple-500 to-purple-600"
          />
        </div>

        {/* Services Grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Available Services</h2>
            <button className="text-blue-600 hover:text-blue-700 font-medium">View All</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Transactions */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center">
                View All <ArrowRightIcon className="h-4 w-4 ml-1" />
              </button>
            </div>
            <div className="p-6">
              {walletLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-8">
                  <CreditCardIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No transactions yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {transactions.slice(0, 5).map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${
                          transaction.type === 'credit' ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          <CreditCardIcon className={`h-5 w-5 ${
                            transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                          }`} />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{transaction.description}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(transaction.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${
                          transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'credit' ? '+' : '-'}₦{transaction.amount}
                        </p>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          transaction.status === 'completed' 
                            ? 'bg-green-100 text-green-800'
                            : transaction.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {transaction.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-between p-3 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                  <div className="flex items-center">
                    <WalletIcon className="h-5 w-5 text-blue-600 mr-3" />
                    <span className="font-medium text-gray-900">Fund Wallet</span>
                  </div>
                  <ArrowRightIcon className="h-4 w-4 text-gray-400" />
                </button>
                <button className="w-full flex items-center justify-between p-3 text-left bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                  <div className="flex items-center">
                    <DocumentTextIcon className="h-5 w-5 text-green-600 mr-3" />
                    <span className="font-medium text-gray-900">View History</span>
                  </div>
                  <ArrowRightIcon className="h-4 w-4 text-gray-400" />
                </button>
                <button className="w-full flex items-center justify-between p-3 text-left bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
                  <div className="flex items-center">
                    <UserCircleIcon className="h-5 w-5 text-purple-600 mr-3" />
                    <span className="font-medium text-gray-900">Edit Profile</span>
                  </div>
                  <ArrowRightIcon className="h-4 w-4 text-gray-400" />
                </button>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-xl p-6 text-white">
              <h3 className="text-lg font-semibold mb-2">Need Help?</h3>
              <p className="text-green-100 text-sm mb-4">
                Get support for any issues or questions
              </p>
              <button className="bg-white text-green-600 px-4 py-2 rounded-lg font-medium hover:bg-green-50 transition-colors">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;