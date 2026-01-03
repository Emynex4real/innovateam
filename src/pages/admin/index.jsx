import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { AdminService } from '../../services/supabase/admin.service';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../../components/ui/dropdown-menu';
import { Separator } from '../../components/ui/separator';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import ThemeToggle from '../../components/ui/theme-toggle';
import { Menu, X } from 'lucide-react';
import AIQuestions from './AIQuestions';
import UploadTextbook from './UploadTextbook';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalTransactions: 0,
    revenue: 0,
    courses: 0,
    recommendations: 0
  });
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [courseRecommendations, setCourseRecommendations] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('connected');
  const [showDropdown, setShowDropdown] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const { user, signOut } = useAuth();

  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const handleDashboard = () => {
    navigate('/dashboard');
  };

  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: '📊' },
    { id: 'users', name: 'User Management', icon: '👥' },
    { id: 'transactions', name: 'Transactions', icon: '💳' },
    { id: 'ai-questions', name: 'AI Questions', icon: '🤖' },
    { id: 'upload-textbook', name: 'Upload Textbook', icon: '📚' },
    { id: 'courses', name: 'Course Management', icon: '📖' },
    { id: 'analytics', name: 'Analytics', icon: '📈' },
    { id: 'settings', name: 'System Settings', icon: '⚙️' },
  ];

  useEffect(() => {
    loadDashboardData();
    
    // Refresh data every 30 seconds
    const interval = setInterval(loadDashboardData, 30000);
    
    return () => {
      clearInterval(interval);
    };
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {

      
      const [metricsResult, usersResult, transactionsResult, courseResult, analyticsResult] = await Promise.all([
        AdminService.getDashboardMetrics(),
        AdminService.getUsers(),
        AdminService.getTransactions(),
        AdminService.getCourseRecommendations(),
        AdminService.getAnalytics()
      ]);
      
      if (metricsResult.success) {
        setStats(metricsResult.data);
      }
      
      if (usersResult.success) {
        setUsers(usersResult.data);
      }
      
      if (transactionsResult.success) {
        setTransactions(transactionsResult.data);
      }
      
      if (courseResult.success) {
        setCourseRecommendations(courseResult.data);
      }
      
      if (analyticsResult.success) {
        setAnalytics(analyticsResult.data);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (userId, action, newRole = null) => {
    setActionLoading(true);
    try {
      if (action === 'makeAdmin') {
        await AdminService.updateUserRole(userId, 'admin');
      } else if (action === 'makeUser') {
        await AdminService.updateUserRole(userId, 'student');
      } else if (action === 'delete') {
        await AdminService.deleteUser(userId);
      }
      await loadDashboardData();
    } catch (error) {
      console.error('User action failed:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleTransactionAction = async (transactionId, status) => {
    setActionLoading(true);
    try {
      await AdminService.updateTransactionStatus(transactionId, status);
      await loadDashboardData();
    } catch (error) {
      console.error('Transaction action failed:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': 
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
              <button 
                onClick={loadDashboardData}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 border-0 text-white shadow-xl">
                <CardContent className="p-6 relative">
                  <div className="absolute top-4 right-4 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm font-medium">Total Users</p>
                      <p className="text-3xl font-bold mt-2">{stats.totalUsers || 0}</p>
                      <p className="text-blue-100 text-xs mt-1">Active: {stats.activeUsers || 0}</p>
                    </div>
                    <div className="text-4xl opacity-20">👥</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 border-0 text-white shadow-xl">
                <CardContent className="p-6 relative">
                  <div className="absolute top-4 right-4 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-emerald-100 text-sm font-medium">Total Revenue</p>
                      <p className="text-3xl font-bold mt-2">₦{(stats.revenue || 0).toLocaleString()}</p>
                      <p className="text-emerald-100 text-xs mt-1">Today: ₦{(stats.todayRevenue || 0).toLocaleString()}</p>
                    </div>
                    <div className="text-4xl opacity-20">💰</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 border-0 text-white shadow-xl">
                <CardContent className="p-6 relative">
                  <div className="absolute top-4 right-4 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm font-medium">Transactions</p>
                      <p className="text-3xl font-bold mt-2">{stats.totalTransactions || 0}</p>
                      <p className="text-purple-100 text-xs mt-1">Pending: {stats.pendingTransactions || 0}</p>
                    </div>
                    <div className="text-4xl opacity-20">💳</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 border-0 text-white shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100 text-sm font-medium">Recommendations</p>
                      <p className="text-3xl font-bold mt-2">{stats.recommendations || 8901}</p>
                      <p className="text-orange-100 text-xs mt-1">+18% this month</p>
                    </div>
                    <div className="text-4xl opacity-20">📊</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold">Recent Users</CardTitle>
                    <Badge variant="outline" className="text-xs">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                      Live
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {users.slice(0, 5).map((user, index) => (
                    <div key={user.id || index} className="flex items-center justify-between p-3 rounded-lg bg-slate-50/50 hover:bg-slate-100/50 transition-colors border border-slate-200/50">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs">
                            {(user.name || user.email)?.charAt(0)?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{user.name || user.email}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      <Badge variant={user.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                        {user.status || 'active'}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
              
              <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold">Recent Transactions</CardTitle>
                    <Badge variant="outline" className="text-xs">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                      Live
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {transactions.slice(0, 5).map((tx, index) => (
                    <div key={tx.id || index} className="flex items-center justify-between p-3 rounded-lg bg-slate-50/50 hover:bg-slate-100/50 transition-colors border border-slate-200/50">
                      <div>
                        <p className="font-medium text-sm">{tx.service || 'Service'}</p>
                        <p className="text-xs text-muted-foreground">₦{(tx.amount || 0).toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">{tx.userEmail}</p>
                      </div>
                      <Badge 
                        variant={tx.status === 'completed' ? 'default' : tx.status === 'pending' ? 'secondary' : 'destructive'}
                        className="text-xs"
                      >
                        {tx.status || 'completed'}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        );
        
      case 'users': 
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h2>
              <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                Add New User
              </Button>
            </div>
            
            <div className="bg-white rounded-lg shadow border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm">
                              {(user.name || user.email)?.charAt(0)?.toUpperCase()}
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900">{user.name || 'N/A'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded ${
                            user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {user.status || 'active'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className={`px-2 py-1 text-xs rounded ${
                            user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {user.role || 'student'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                          {user.role !== 'admin' ? (
                            <button 
                              onClick={() => handleUserAction(user.id, 'makeAdmin')}
                              disabled={actionLoading}
                              className="text-purple-600 hover:text-purple-900 disabled:opacity-50"
                            >
                              Make Admin
                            </button>
                          ) : (
                            <button 
                              onClick={() => handleUserAction(user.id, 'makeUser')}
                              disabled={actionLoading}
                              className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                            >
                              Remove Admin
                            </button>
                          )}
                          <button 
                            onClick={() => handleUserAction(user.id, 'delete')}
                            disabled={actionLoading}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
        
      case 'transactions':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Transaction Management</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg shadow border">
                <h3 className="text-sm font-medium text-gray-600">Total Revenue</h3>
                <p className="text-2xl font-bold text-green-600">₦{(stats.revenue || 0).toLocaleString()}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow border">
                <h3 className="text-sm font-medium text-gray-600">Completed</h3>
                <p className="text-2xl font-bold text-blue-600">{transactions.filter(t => t.status === 'completed').length}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow border">
                <h3 className="text-sm font-medium text-gray-600">Pending</h3>
                <p className="text-2xl font-bold text-yellow-600">{transactions.filter(t => t.status === 'pending').length}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow border">
                <h3 className="text-sm font-medium text-gray-600">Failed</h3>
                <p className="text-2xl font-bold text-red-600">{transactions.filter(t => t.status === 'failed').length}</p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {transactions.map((tx, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tx.id || `TX${index + 1}`}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tx.userEmail || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tx.service || 'Service'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₦{(tx.amount || 0).toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded ${
                            tx.status === 'completed' ? 'bg-green-100 text-green-800' : 
                            tx.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {tx.status || 'completed'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(tx.createdAt || Date.now()).toLocaleDateString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                          {tx.status === 'pending' && (
                            <>
                              <button 
                                onClick={() => handleTransactionAction(tx.id, 'completed')}
                                disabled={actionLoading}
                                className="text-green-600 hover:text-green-900 disabled:opacity-50"
                              >
                                Approve
                              </button>
                              <button 
                                onClick={() => handleTransactionAction(tx.id, 'failed')}
                                disabled={actionLoading}
                                className="text-red-600 hover:text-red-900 disabled:opacity-50"
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
        
      case 'courses': 
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Course Management</h2>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                Add New Course
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow border">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">FUTA Courses</h3>
                <p className="text-3xl font-bold text-blue-600">65</p>
                <p className="text-sm text-gray-600">Active courses</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow border">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Recommendations</h3>
                <p className="text-3xl font-bold text-green-600">{stats.recommendations || 0}</p>
                <p className="text-sm text-gray-600">Generated this month</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow border">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Success Rate</h3>
                <p className="text-3xl font-bold text-purple-600">94.5%</p>
                <p className="text-sm text-gray-600">Admission success</p>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Course Recommendations</h3>
              <div className="space-y-4">
                {courseRecommendations.slice(0, 10).map((rec, index) => (
                  <div key={rec.id || index} className="flex items-center justify-between p-4 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium text-gray-900">{rec.users?.full_name || rec.users?.email}</p>
                      <p className="text-sm text-gray-600">JAMB Score: {rec.jamb_score}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-green-600">{rec.match_percentage}% match</p>
                      <p className="text-xs text-gray-500">{new Date(rec.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
                {courseRecommendations.length === 0 && (
                  <p className="text-center text-gray-500 py-4">No course recommendations yet</p>
                )}
              </div>
            </div>
          </div>
        );
        
      case 'analytics': 
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics & Reports</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow border">
                <h3 className="text-sm font-medium text-gray-600">Daily Active Users</h3>
                <p className="text-2xl font-bold text-gray-900">{analytics.dailyActiveUsers || 0}</p>
                <p className="text-xs text-green-600">+12% from yesterday</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow border">
                <h3 className="text-sm font-medium text-gray-600">Conversion Rate</h3>
                <p className="text-2xl font-bold text-gray-900">{analytics.conversionRate || 0}%</p>
                <p className="text-xs text-green-600">+0.5% from last week</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow border">
                <h3 className="text-sm font-medium text-gray-600">Avg Session Duration</h3>
                <p className="text-2xl font-bold text-gray-900">{analytics.avgSessionDuration || '0m 0s'}</p>
                <p className="text-xs text-red-600">-2% from last week</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow border">
                <h3 className="text-sm font-medium text-gray-600">Bounce Rate</h3>
                <p className="text-2xl font-bold text-gray-900">{analytics.bounceRate || 0}%</p>
                <p className="text-xs text-green-600">-3% from last week</p>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Services</h3>
              <div className="space-y-3">
                {[
                  { name: 'Course Advisor', usage: 85, color: 'bg-blue-500' },
                  { name: 'WAEC Checker', usage: 72, color: 'bg-green-500' },
                  { name: 'JAMB Services', usage: 68, color: 'bg-purple-500' },
                  { name: 'AI Examiner', usage: 45, color: 'bg-orange-500' },
                  { name: 'O-Level Upload', usage: 38, color: 'bg-red-500' }
                ].map((service, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-32 text-sm text-gray-700">{service.name}</div>
                    <div className="flex-1 mx-4">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className={`${service.color} h-2 rounded-full`} style={{ width: `${service.usage}%` }}></div>
                      </div>
                    </div>
                    <div className="w-12 text-sm text-gray-600">{service.usage}%</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
        
      case 'ai-questions':
        return <AIQuestions />;
        
      case 'upload-textbook':
        return <UploadTextbook />;
        
      case 'settings': 
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">System Settings</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">General Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Site Name</label>
                    <input type="text" defaultValue="ArewaGate" className="w-full p-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Admin Email</label>
                    <input type="email" defaultValue={user?.email} className="w-full p-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Maintenance Mode</label>
                    <select className="w-full p-2 border rounded-lg">
                      <option value="off">Off</option>
                      <option value="on">On</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">API Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">DeepSeek API Status</label>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-sm text-green-600">Connected</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rate Limit</label>
                    <input type="number" defaultValue="100" className="w-full p-2 border rounded-lg" />
                    <p className="text-xs text-gray-500 mt-1">Requests per minute</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cache Duration</label>
                    <select className="w-full p-2 border rounded-lg">
                      <option value="300">5 minutes</option>
                      <option value="900">15 minutes</option>
                      <option value="3600">1 hour</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">System Actions</h3>
              <div className="flex space-x-4">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Save Settings
                </button>
                <button className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700">
                  Clear Cache
                </button>
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                  Backup Database
                </button>
                <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                  System Restart
                </button>
              </div>
            </div>
          </div>
        );
        
      default: 
        return <div className="p-6"><h2 className="text-2xl font-bold text-gray-900">Welcome to Admin Panel</h2></div>;
    }
  };

  return (
    <div className="flex h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 lg:hidden z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out lg:transform-none ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        <div className="flex items-center justify-between h-16 border-b border-gray-200 dark:border-gray-700 px-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Admin</h1>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
        
        <nav className="mt-6 px-3">
          {navigation.map((item) => (
            <Button
              key={item.id}
              variant={activeTab === item.id ? "default" : "ghost"}
              className={`w-full justify-start mb-1 h-11 ${
                activeTab === item.id 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              onClick={() => {
                setActiveTab(item.id);
                setSidebarOpen(false);
              }}
            >
              <span className="mr-3 text-lg">{item.icon}</span>
              {item.name}
            </Button>
          ))}
          
          <Separator className="my-6" />
          
          <div className="space-y-1">
            <Button
              variant="ghost"
              className="w-full justify-start h-11 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => {
                handleDashboard();
                setSidebarOpen(false);
              }}
            >
              <span className="mr-3 text-lg">🏠</span>
              Return to Dashboard
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start h-11 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
              onClick={() => {
                handleLogout();
                setSidebarOpen(false);
              }}
            >
              <span className="mr-3 text-lg">🚪</span>
              Sign Out
            </Button>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 h-16 flex items-center justify-between px-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Admin Dashboard
            </h2>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                connectionStatus === 'connected' ? 'bg-green-500 animate-pulse' :
                connectionStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' :
                connectionStatus === 'polling' ? 'bg-blue-500 animate-pulse' :
                'bg-red-500'
              }`}></div>
              <Badge variant="outline" className="text-xs">
                {connectionStatus === 'connected' ? 'Live' : 
                 connectionStatus === 'polling' ? 'Polling' : 
                 connectionStatus}
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <ThemeToggle />
            <Button 
              onClick={loadDashboardData}
              disabled={loading}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full" onClick={() => setShowDropdown(!showDropdown)}>
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-blue-600 text-white">
                      {user?.name?.charAt(0) || 'A'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              {showDropdown && (
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.name || 'Admin'}</p>
                      <p className="text-xs leading-none text-gray-500 dark:text-gray-400">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleDashboard}>
                    🏠 Return to Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    🚪 Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              )}
            </DropdownMenu>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default AdminPanel;