import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useWallet } from '../contexts/WalletContext';
import { useDarkMode } from '../contexts/DarkModeContext';
import { Link } from 'react-router-dom';
import {
  WalletIcon,
  DocumentTextIcon,
  AcademicCapIcon,
  ChartBarIcon,
  BellIcon,
  UserCircleIcon,
  ArrowTrendingUpIcon,
  CheckCircleIcon,
  PlusIcon,
  BookOpenIcon,
  ClipboardDocumentCheckIcon,
  LightBulbIcon,
  StarIcon
} from '@heroicons/react/24/outline';

const EducationalDashboard = () => {
  const { user } = useAuth();
  const { walletBalance, transactions, loading: walletLoading, fetchWalletData } = useWallet();
  const { isDarkMode } = useDarkMode();
  const [stats, setStats] = useState({
    totalSpent: 0,
    servicesUsed: 0,
    completedTransactions: 0,
    successRate: 0
  });

  useEffect(() => {
    fetchWalletData();
  }, []);

  useEffect(() => {
    if (transactions.length > 0) {
      const completed = transactions.filter(t => t.status === 'completed');
      setStats({
        totalSpent: completed.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0),
        servicesUsed: completed.length,
        completedTransactions: completed.length,
        successRate: completed.length > 0 ? (completed.length / transactions.length) * 100 : 0
      });
    }
  }, [transactions]);

  const services = [
    {
      id: 1,
      name: 'JAMB Services',
      description: 'Registration & result checking',
      icon: AcademicCapIcon,
      color: 'blue',
      href: 'buy-admission-letter',
      price: '₦500'
    },
    {
      id: 2,
      name: 'O-Level Upload',
      description: 'Result verification service',
      icon: DocumentTextIcon,
      color: 'green',
      href: 'buy-olevel-upload',
      price: '₦1,000'
    },
    {
      id: 3,
      name: 'AI Examiner',
      description: 'Practice tests & feedback',
      icon: LightBulbIcon,
      color: 'purple',
      href: 'ai-examiner',
      price: '₦750'
    },
    {
      id: 4,
      name: 'Course Advisor',
      description: 'University course guidance',
      icon: BookOpenIcon,
      color: 'orange',
      href: 'course-advisor',
      price: 'Free'
    }
  ];

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Welcome, {user?.name || user?.email?.split('@')[0]}
              </h1>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mt-1`}>Your educational services dashboard</p>
            </div>
            <div className="flex items-center space-x-3">
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
                <BellIcon className="h-5 w-5" />
              </button>
              <Link to="profile" className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
                <UserCircleIcon className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Wallet Card */}
        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-sm border p-6 mb-8`}>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center mb-2">
                <WalletIcon className="h-5 w-5 text-blue-600 mr-2" />
                <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Wallet Balance</span>
              </div>
              <div className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                ₦{walletLoading ? '...' : (walletBalance || 0).toLocaleString()}
              </div>
            </div>
            <div className="flex space-x-3">
              <Link 
                to="wallet" 
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                <PlusIcon className="h-4 w-4 inline mr-1" />
                Add Funds
              </Link>
              <Link 
                to="transactions" 
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                History
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ChartBarIcon className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Spent</p>
                <p className="text-xl font-bold text-gray-900">₦{(stats.totalSpent || 0).toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircleIcon className="h-5 w-5 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Services Used</p>
                <p className="text-xl font-bold text-gray-900">{stats.servicesUsed}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <ArrowTrendingUpIcon className="h-5 w-5 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-xl font-bold text-gray-900">{stats.successRate.toFixed(1)}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <StarIcon className="h-5 w-5 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Level</p>
                <p className="text-xl font-bold text-gray-900">{Math.floor((stats.totalSpent || 0) / 1000) + 1}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Services Grid */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Educational Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service) => (
              <Link key={service.id} to={service.href} className="block">
                <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
                  <div className={`p-3 bg-${service.color}-100 rounded-lg w-fit mb-4`}>
                    <service.icon className={`h-6 w-6 text-${service.color}-600`} />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{service.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">{service.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-gray-900">{service.price}</span>
                    <span className="text-sm text-blue-600 font-medium">Learn more →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
              <Link to="transactions" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                View All
              </Link>
            </div>
          </div>
          
          <div className="p-6">
            {walletLoading ? (
              <div className="flex items-center justify-center h-20">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-8">
                <ClipboardDocumentCheckIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">No transactions yet</h4>
                <p className="text-gray-500 mb-4">Start using our educational services to see your activity here.</p>
                <Link 
                  to="buy-olevel-upload" 
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Explore Services
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {transactions.slice(0, 5).map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="font-medium text-gray-900">{transaction.description}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(transaction.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">₦{transaction.amount}</p>
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
      </div>
    </div>
  );
};

export default EducationalDashboard;