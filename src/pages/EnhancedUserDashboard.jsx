import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useWallet } from '../contexts/WalletContext';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
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
  ArrowRightIcon,
  StarIcon,
  FireIcon,
  TrophyIcon,
  CalendarDaysIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  SparklesIcon,
  GiftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

const EnhancedUserDashboard = () => {
  const { user } = useAuth();
  const { balance, transactions, loading: walletLoading, fetchWalletData } = useWallet();
  const [stats, setStats] = useState({
    totalSpent: 0,
    servicesUsed: 0,
    pendingTransactions: 0,
    completedTransactions: 0,
    monthlySpending: 0,
    savingsThisMonth: 0,
    streakDays: 7
  });
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchWalletData();
  }, []);

  useEffect(() => {
    if (transactions.length > 0) {
      const completed = transactions.filter(t => t.status === 'completed');
      const pending = transactions.filter(t => t.status === 'pending');
      const thisMonth = new Date();
      const monthlyTxs = completed.filter(t => {
        const txDate = new Date(t.createdAt);
        return txDate.getMonth() === thisMonth.getMonth() && txDate.getFullYear() === thisMonth.getFullYear();
      });
      
      setStats({
        totalSpent: completed.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0),
        servicesUsed: completed.length,
        pendingTransactions: pending.length,
        completedTransactions: completed.length,
        monthlySpending: monthlyTxs.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0),
        savingsThisMonth: Math.max(0, balance - 1000),
        streakDays: 7
      });
    }
  }, [transactions, balance]);

  const services = [
    {
      id: 1,
      name: 'JAMB Services',
      description: 'Registration, Result Checking, Admission',
      icon: AcademicCapIcon,
      color: 'from-blue-500 to-blue-600',
      href: '/jamb-services',
      popular: true,
      price: '₦500'
    },
    {
      id: 2,
      name: 'O-Level Upload',
      description: 'Upload and verify O-Level results',
      icon: DocumentTextIcon,
      color: 'from-green-500 to-green-600',
      href: '/olevel-upload',
      price: '₦1,000'
    },
    {
      id: 3,
      name: 'AI Examiner',
      description: 'Practice tests and assessments',
      icon: ChartBarIcon,
      color: 'from-purple-500 to-purple-600',
      href: '/ai-examiner',
      new: true,
      price: '₦750'
    },
    {
      id: 4,
      name: 'Course Advisor',
      description: 'Get personalized course recommendations',
      icon: UserCircleIcon,
      color: 'from-orange-500 to-orange-600',
      href: '/course-advisor',
      price: 'Free'
    }
  ];

  const achievements = [
    { id: 1, name: 'First Purchase', icon: StarIcon, unlocked: true },
    { id: 2, name: 'Big Spender', icon: TrophyIcon, unlocked: stats.totalSpent > 5000 },
    { id: 3, name: 'Regular User', icon: FireIcon, unlocked: stats.streakDays > 5 }
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
    <Link to={service.href} className="block">
      <div className="group bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:border-blue-200 transition-all cursor-pointer relative overflow-hidden">
        {service.popular && (
          <div className="absolute top-3 right-3 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
            Popular
          </div>
        )}
        {service.new && (
          <div className="absolute top-3 right-3 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
            New
          </div>
        )}
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-lg bg-gradient-to-r ${service.color}`}>
            <service.icon className="h-6 w-6 text-white" />
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-gray-900">{service.price}</p>
            <ArrowRightIcon className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors ml-auto" />
          </div>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{service.name}</h3>
        <p className="text-sm text-gray-600">{service.description}</p>
      </div>
    </Link>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">
                  Welcome back, {user?.name || user?.email?.split('@')[0]}!
                </h1>
                <div className="flex items-center space-x-1">
                  {achievements.filter(a => a.unlocked).map(achievement => (
                    <div key={achievement.id} className="p-1 bg-yellow-100 rounded-full">
                      <achievement.icon className="h-4 w-4 text-yellow-600" />
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-gray-600">Here's your personalized dashboard overview</p>
              <div className="flex items-center space-x-4 mt-2">
                <div className="flex items-center text-sm text-green-600">
                  <FireIcon className="h-4 w-4 mr-1" />
                  {stats.streakDays} day streak
                </div>
                <div className="flex items-center text-sm text-blue-600">
                  <TrophyIcon className="h-4 w-4 mr-1" />
                  Level {Math.floor(stats.totalSpent / 1000) + 1}
                </div>
              </div>
            </div>
            <div className="mt-4 sm:mt-0 flex items-center space-x-3">
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg relative">
                <BellIcon className="h-6 w-6" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                <GiftIcon className="h-6 w-6" />
              </button>
              <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold relative">
                {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
                <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-white"></div>
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
                <Link to="/wallet" className="bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-colors inline-flex items-center">
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Fund Wallet
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {['overview', 'services', 'transactions', 'achievements'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                    activeTab === tab
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {activeTab === 'overview' && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="Total Spent"
                value={`₦${stats.totalSpent.toLocaleString()}`}
                icon={CreditCardIcon}
                color="from-green-500 to-green-600"
              />
              <StatCard
                title="This Month"
                value={`₦${stats.monthlySpending.toLocaleString()}`}
                icon={CalendarDaysIcon}
                color="from-blue-500 to-blue-600"
              />
              <StatCard
                title="Services Used"
                value={stats.servicesUsed}
                icon={CheckCircleIcon}
                color="from-purple-500 to-purple-600"
              />
              <StatCard
                title="Savings"
                value={`₦${stats.savingsThisMonth.toLocaleString()}`}
                icon={TrophyIcon}
                color="from-yellow-500 to-yellow-600"
              />
            </div>
          </>
        )}

        {activeTab === 'achievements' && (
          <div className="mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {achievements.map((achievement) => (
                <div key={achievement.id} className={`bg-white rounded-xl shadow-sm border p-6 ${
                  achievement.unlocked ? 'border-yellow-200 bg-yellow-50' : 'border-gray-100'
                }`}>
                  <div className="flex items-center space-x-3">
                    <div className={`p-3 rounded-lg ${
                      achievement.unlocked ? 'bg-yellow-100' : 'bg-gray-100'
                    }`}>
                      <achievement.icon className={`h-6 w-6 ${
                        achievement.unlocked ? 'text-yellow-600' : 'text-gray-400'
                      }`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{achievement.name}</h3>
                      <p className={`text-sm ${
                        achievement.unlocked ? 'text-yellow-600' : 'text-gray-500'
                      }`}>
                        {achievement.unlocked ? 'Unlocked!' : 'Locked'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {(activeTab === 'overview' || activeTab === 'services') && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Available Services</h2>
                <p className="text-gray-600">Choose from our premium educational services</p>
              </div>
              <Link to="/services" className="text-blue-600 hover:text-blue-700 font-medium flex items-center">
                View All <ArrowRightIcon className="h-4 w-4 ml-1" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {services.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          </div>
        )}

        {(activeTab === 'overview' || activeTab === 'transactions') && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Transactions */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
                <Link to="/wallet" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center">
                  View All <ArrowRightIcon className="h-4 w-4 ml-1" />
                </Link>
              </div>
              <div className="p-6">
                {walletLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="text-center py-8">
                    <CreditCardIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">No transactions yet</p>
                    <Link to="/services" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      <SparklesIcon className="h-4 w-4 mr-2" />
                      Explore Services
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {transactions.slice(0, 5).map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${
                            transaction.type === 'credit' ? 'bg-green-100' : 'bg-red-100'
                          }`}>
                            {transaction.type === 'credit' ? (
                              <ArrowUpIcon className="h-5 w-5 text-green-600" />
                            ) : (
                              <ArrowDownIcon className="h-5 w-5 text-red-600" />
                            )}
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

            {/* Quick Actions & Daily Goal */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Link to="/wallet" className="w-full flex items-center justify-between p-3 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                    <div className="flex items-center">
                      <WalletIcon className="h-5 w-5 text-blue-600 mr-3" />
                      <span className="font-medium text-gray-900">Fund Wallet</span>
                    </div>
                    <ChevronRightIcon className="h-4 w-4 text-gray-400" />
                  </Link>
                  <Link to="/transactions" className="w-full flex items-center justify-between p-3 text-left bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                    <div className="flex items-center">
                      <DocumentTextIcon className="h-5 w-5 text-green-600 mr-3" />
                      <span className="font-medium text-gray-900">View History</span>
                    </div>
                    <ChevronRightIcon className="h-4 w-4 text-gray-400" />
                  </Link>
                  <Link to="/profile" className="w-full flex items-center justify-between p-3 text-left bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
                    <div className="flex items-center">
                      <UserCircleIcon className="h-5 w-5 text-purple-600 mr-3" />
                      <span className="font-medium text-gray-900">Edit Profile</span>
                    </div>
                    <ChevronRightIcon className="h-4 w-4 text-gray-400" />
                  </Link>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-xl p-6 text-white">
                <h3 className="text-lg font-semibold mb-2">🎯 Daily Goal</h3>
                <p className="text-green-100 text-sm mb-4">
                  Complete 1 service today to maintain your streak!
                </p>
                <div className="bg-white bg-opacity-20 rounded-lg p-3 mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progress</span>
                    <span>0/1</span>
                  </div>
                  <div className="w-full bg-white bg-opacity-30 rounded-full h-2">
                    <div className="bg-white h-2 rounded-full" style={{width: '0%'}}></div>
                  </div>
                </div>
                <Link to="/services" className="bg-white text-green-600 px-4 py-2 rounded-lg font-medium hover:bg-green-50 transition-colors inline-block">
                  Start Now
                </Link>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommended for You</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                    <AcademicCapIcon className="h-8 w-8 text-blue-600" />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">JAMB Registration</h4>
                      <p className="text-sm text-gray-600">Based on your profile, this service is perfect for you</p>
                    </div>
                    <Link to="/jamb-services" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                      Try Now
                    </Link>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                    <ChartBarIcon className="h-8 w-8 text-purple-600" />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">AI Practice Tests</h4>
                      <p className="text-sm text-gray-600">Boost your exam preparation with AI-powered tests</p>
                    </div>
                    <Link to="/ai-examiner" className="text-purple-600 hover:text-purple-700 font-medium text-sm">
                      Try Now
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedUserDashboard;