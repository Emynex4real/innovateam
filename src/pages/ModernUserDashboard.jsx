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
  ChevronRightIcon,
  EyeIcon,
  Cog6ToothIcon,
  BoltIcon,
  ShieldCheckIcon,
  HeartIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline';

const ModernUserDashboard = () => {
  const { user } = useAuth();
  const { walletBalance, transactions, loading: walletLoading, fetchWalletData } = useWallet();
  const [stats, setStats] = useState({
    totalSpent: 0,
    servicesUsed: 0,
    pendingTransactions: 0,
    completedTransactions: 0,
    monthlySpending: 0,
    savingsThisMonth: 0,
    streakDays: 7,
    successRate: 98.5
  });
  const [activeView, setActiveView] = useState('dashboard');
  const [showNotifications, setShowNotifications] = useState(false);

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
        savingsThisMonth: Math.max(0, walletBalance - 1000),
        streakDays: 7,
        successRate: completed.length > 0 ? (completed.length / transactions.length) * 100 : 0
      });
    }
  }, [transactions, walletBalance]);

  const services = [
    {
      id: 1,
      name: 'JAMB Services',
      description: 'Complete JAMB registration & result checking',
      icon: AcademicCapIcon,
      gradient: 'from-blue-500 via-blue-600 to-indigo-700',
      href: '/jamb-services',
      popular: true,
      price: '₦500',
      rating: 4.9,
      users: '50K+'
    },
    {
      id: 2,
      name: 'O-Level Upload',
      description: 'Secure O-Level result verification',
      icon: DocumentTextIcon,
      gradient: 'from-emerald-500 via-green-600 to-teal-700',
      href: '/olevel-upload',
      price: '₦1,000',
      rating: 4.8,
      users: '30K+'
    },
    {
      id: 3,
      name: 'AI Examiner',
      description: 'AI-powered practice tests & analytics',
      icon: BoltIcon,
      gradient: 'from-purple-500 via-violet-600 to-purple-700',
      href: '/ai-examiner',
      new: true,
      price: '₦750',
      rating: 4.9,
      users: '15K+'
    },
    {
      id: 4,
      name: 'Course Advisor',
      description: 'Personalized university course recommendations',
      icon: LightBulbIcon,
      gradient: 'from-orange-500 via-amber-600 to-yellow-600',
      href: '/course-advisor',
      price: 'Free',
      rating: 4.7,
      users: '25K+'
    }
  ];

  const achievements = [
    { id: 1, name: 'First Steps', icon: StarIcon, unlocked: true, description: 'Made your first purchase', reward: '50 points' },
    { id: 2, name: 'Power User', icon: TrophyIcon, unlocked: stats.totalSpent > 5000, description: 'Spent over ₦5,000', reward: '200 points' },
    { id: 3, name: 'Streak Master', icon: FireIcon, unlocked: stats.streakDays > 5, description: '7-day activity streak', reward: '100 points' },
    { id: 4, name: 'Perfect Score', icon: ShieldCheckIcon, unlocked: stats.successRate > 95, description: '95%+ success rate', reward: '150 points' }
  ];

  const notifications = [
    { id: 1, title: 'New AI Feature Available', message: 'Try our enhanced AI Examiner with personalized feedback', type: 'feature', time: '2h ago' },
    { id: 2, title: 'Wallet Funded Successfully', message: '₦2,000 has been added to your wallet', type: 'success', time: '1d ago' },
    { id: 3, title: 'Achievement Unlocked!', message: 'You earned the "Streak Master" badge', type: 'achievement', time: '2d ago' }
  ];

  const StatCard = ({ title, value, icon: Icon, gradient, change, subtitle }) => (
    <div className="group relative overflow-hidden bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity duration-300" style={{background: `linear-gradient(135deg, ${gradient})`}}></div>
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl bg-gradient-to-r ${gradient} shadow-lg`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          {change && (
            <div className={`flex items-center text-sm font-semibold px-2 py-1 rounded-full ${
              change > 0 ? 'text-emerald-700 bg-emerald-50' : 'text-red-700 bg-red-50'
            }`}>
              <ArrowTrendingUpIcon className="h-3 w-3 mr-1" />
              {Math.abs(change)}%
            </div>
          )}
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
          <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
      </div>
    </div>
  );

  const ServiceCard = ({ service }) => (
    <Link to={service.href} className="block group">
      <div className="relative overflow-hidden bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
        <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-500" style={{background: `linear-gradient(135deg, ${service.gradient.replace('from-', '').replace('via-', '').replace('to-', '').split(' ').map(c => `var(--${c})`).join(', ')})`}}></div>
        
        {service.popular && (
          <div className="absolute -top-2 -right-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs px-3 py-1 rounded-full font-bold shadow-lg transform rotate-12">
            🔥 Popular
          </div>
        )}
        {service.new && (
          <div className="absolute -top-2 -right-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs px-3 py-1 rounded-full font-bold shadow-lg transform rotate-12">
            ✨ New
          </div>
        )}
        
        <div className="relative">
          <div className="flex items-start justify-between mb-4">
            <div className={`p-4 rounded-2xl bg-gradient-to-r ${service.gradient} shadow-xl group-hover:scale-110 transition-transform duration-300`}>
              <service.icon className="h-8 w-8 text-white" />
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-gray-900">{service.price}</p>
              <div className="flex items-center text-sm text-gray-500 mt-1">
                <StarIcon className="h-3 w-3 text-yellow-400 mr-1" />
                {service.rating}
              </div>
            </div>
          </div>
          
          <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300">
            {service.name}
          </h3>
          <p className="text-sm text-gray-600 mb-4">{service.description}</p>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 font-medium">{service.users} users</span>
            <div className="flex items-center text-blue-600 group-hover:text-purple-600 transition-colors duration-300">
              <span className="text-sm font-semibold mr-2">Explore</span>
              <ArrowRightIcon className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-6 lg:mb-0">
              <div className="flex items-center space-x-4 mb-3">
                <div className="relative">
                  <div className="h-16 w-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-xl">
                    {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-3 border-white flex items-center justify-center">
                    <div className="h-2 w-2 bg-white rounded-full"></div>
                  </div>
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Welcome back, {user?.name || user?.email?.split('@')[0]}! 👋
                  </h1>
                  <p className="text-gray-600 mt-1">Here's your personalized learning dashboard</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    {achievements.filter(a => a.unlocked).map(achievement => (
                      <div key={achievement.id} className="p-1.5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg shadow-sm">
                        <achievement.icon className="h-4 w-4 text-white" />
                      </div>
                    ))}
                  </div>
                  <span className="text-sm font-medium text-gray-600">
                    {achievements.filter(a => a.unlocked).length} achievements
                  </span>
                </div>
                
                <div className="flex items-center text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full">
                  <FireIcon className="h-4 w-4 mr-1.5" />
                  {stats.streakDays} day streak
                </div>
                
                <div className="flex items-center text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full">
                  <TrophyIcon className="h-4 w-4 mr-1.5" />
                  Level {Math.floor(stats.totalSpent / 1000) + 1}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-3 text-gray-400 hover:text-gray-600 hover:bg-white rounded-xl transition-all duration-200 relative shadow-sm border border-gray-100"
                >
                  <BellIcon className="h-6 w-6" />
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    3
                  </span>
                </button>
                
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50">
                    <div className="p-4 border-b border-gray-100">
                      <h3 className="font-semibold text-gray-900">Notifications</h3>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.map(notif => (
                        <div key={notif.id} className="p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors">
                          <h4 className="font-medium text-gray-900 text-sm">{notif.title}</h4>
                          <p className="text-gray-600 text-xs mt-1">{notif.message}</p>
                          <span className="text-gray-400 text-xs">{notif.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <Link to="/settings" className="p-3 text-gray-400 hover:text-gray-600 hover:bg-white rounded-xl transition-all duration-200 shadow-sm border border-gray-100">
                <Cog6ToothIcon className="h-6 w-6" />
              </Link>
            </div>
          </div>
        </div>

        {/* Enhanced Wallet Section */}
        <div className="mb-8">
          <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-3xl p-8 shadow-2xl">
            <div className="absolute inset-0 bg-black opacity-10"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-32 translate-x-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full translate-y-24 -translate-x-24"></div>
            
            <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="mb-6 lg:mb-0">
                <div className="flex items-center mb-3">
                  <div className="p-2 bg-white bg-opacity-20 rounded-xl mr-3">
                    <WalletIcon className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-blue-100 font-medium">Wallet Balance</span>
                </div>
                <div className="text-5xl font-bold text-white mb-2">
                  ₦{walletLoading ? '...' : (walletBalance || 0).toLocaleString()}
                </div>
                <p className="text-blue-100">Available for premium services</p>
                
                <div className="flex items-center space-x-4 mt-4">
                  <div className="text-sm">
                    <span className="text-blue-200">This month: </span>
                    <span className="text-white font-semibold">₦{(stats.monthlySpending || 0).toLocaleString()}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-blue-200">Saved: </span>
                    <span className="text-white font-semibold">₦{(stats.savingsThisMonth || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Link to="/wallet" className="bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-all duration-200 inline-flex items-center shadow-lg hover:shadow-xl">
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Fund Wallet
                </Link>
                <Link to="/transactions" className="bg-white bg-opacity-20 text-white px-6 py-3 rounded-xl font-semibold hover:bg-opacity-30 transition-all duration-200 inline-flex items-center backdrop-blur-sm">
                  <EyeIcon className="h-5 w-5 mr-2" />
                  View History
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Invested"
            value={`₦${(stats.totalSpent || 0).toLocaleString()}`}
            icon={CreditCardIcon}
            gradient="from-emerald-500 to-teal-600"
            change={12.5}
            subtitle="in your education"
          />
          <StatCard
            title="Services Used"
            value={stats.servicesUsed}
            icon={CheckCircleIcon}
            gradient="from-blue-500 to-indigo-600"
            change={8.2}
            subtitle="completed successfully"
          />
          <StatCard
            title="Success Rate"
            value={`${stats.successRate.toFixed(1)}%`}
            icon={TrophyIcon}
            gradient="from-purple-500 to-violet-600"
            change={2.1}
            subtitle="transaction success"
          />
          <StatCard
            title="Monthly Savings"
            value={`₦${(stats.savingsThisMonth || 0).toLocaleString()}`}
            icon={HeartIcon}
            gradient="from-pink-500 to-rose-600"
            change={15.3}
            subtitle="compared to last month"
          />
        </div>

        {/* Enhanced Services Grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
                Premium Services
              </h2>
              <p className="text-gray-600">Unlock your potential with our cutting-edge educational tools</p>
            </div>
            <Link to="/services" className="group flex items-center text-blue-600 hover:text-purple-600 font-semibold transition-colors duration-300">
              <span className="mr-2">Explore All</span>
              <ArrowRightIcon className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </div>

        {/* Enhanced Activity Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-blue-50">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
                <Link to="/transactions" className="text-sm text-blue-600 hover:text-purple-600 font-semibold flex items-center transition-colors duration-300">
                  View All <ChevronRightIcon className="h-4 w-4 ml-1" />
                </Link>
              </div>
            </div>
            
            <div className="p-6">
              {walletLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <SparklesIcon className="h-8 w-8 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Start Your Journey</h4>
                  <p className="text-gray-500 mb-6">No transactions yet. Explore our services to get started!</p>
                  <Link to="/services" className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300">
                    <SparklesIcon className="h-4 w-4 mr-2" />
                    Explore Services
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {transactions.slice(0, 5).map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl hover:shadow-md transition-all duration-300">
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-xl ${
                          transaction.type === 'credit' 
                            ? 'bg-gradient-to-r from-emerald-500 to-green-600' 
                            : 'bg-gradient-to-r from-red-500 to-pink-600'
                        } shadow-lg`}>
                          {transaction.type === 'credit' ? (
                            <ArrowUpIcon className="h-5 w-5 text-white" />
                          ) : (
                            <ArrowDownIcon className="h-5 w-5 text-white" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{transaction.description}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(transaction.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-bold ${
                          transaction.type === 'credit' ? 'text-emerald-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'credit' ? '+' : '-'}₦{transaction.amount}
                        </p>
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                          transaction.status === 'completed' 
                            ? 'bg-emerald-100 text-emerald-800'
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

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                {[
                  { icon: WalletIcon, label: 'Fund Wallet', href: '/wallet', color: 'from-blue-500 to-indigo-600' },
                  { icon: DocumentTextIcon, label: 'Transaction History', href: '/transactions', color: 'from-emerald-500 to-teal-600' },
                  { icon: UserCircleIcon, label: 'Edit Profile', href: '/profile', color: 'from-purple-500 to-violet-600' }
                ].map((action, index) => (
                  <Link key={index} to={action.href} className="group w-full flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50 hover:from-blue-50 hover:to-purple-50 rounded-xl transition-all duration-300">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-lg bg-gradient-to-r ${action.color} mr-3 group-hover:scale-110 transition-transform duration-300`}>
                        <action.icon className="h-4 w-4 text-white" />
                      </div>
                      <span className="font-medium text-gray-900">{action.label}</span>
                    </div>
                    <ChevronRightIcon className="h-4 w-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-300" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Achievements */}
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl shadow-sm border border-yellow-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <TrophyIcon className="h-5 w-5 text-yellow-600 mr-2" />
                Achievements
              </h3>
              <div className="space-y-3">
                {achievements.slice(0, 3).map((achievement) => (
                  <div key={achievement.id} className={`flex items-center space-x-3 p-3 rounded-xl transition-all duration-300 ${
                    achievement.unlocked 
                      ? 'bg-gradient-to-r from-yellow-100 to-orange-100 border border-yellow-200' 
                      : 'bg-gray-50 border border-gray-200'
                  }`}>
                    <div className={`p-2 rounded-lg ${
                      achievement.unlocked 
                        ? 'bg-gradient-to-r from-yellow-500 to-orange-500' 
                        : 'bg-gray-300'
                    }`}>
                      <achievement.icon className={`h-4 w-4 ${
                        achievement.unlocked ? 'text-white' : 'text-gray-500'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 text-sm">{achievement.name}</h4>
                      <p className="text-xs text-gray-600">{achievement.description}</p>
                    </div>
                    {achievement.unlocked && (
                      <span className="text-xs font-bold text-yellow-700 bg-yellow-200 px-2 py-1 rounded-full">
                        {achievement.reward}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernUserDashboard;