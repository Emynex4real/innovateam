import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Users, DollarSign, Activity, TrendingUp, Eye, Edit, Ban, CheckCircle, Database, Moon, Sun, Search, Wallet, Download, Trophy } from 'lucide-react';
import directSupabaseService from '../../services/directSupabase.service';
import UserDetailModal from '../../components/UserDetailModal';
import { ThemeProvider, useTheme } from '../../contexts/ThemeContext';
import AIQuestions from './AIQuestions';

import toast from 'react-hot-toast';

const AdminDashboardContent = () => {
  const { isDark, toggleTheme } = useTheme();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [supabaseStatus, setSupabaseStatus] = useState(null);
  const [lastTransactionCount, setLastTransactionCount] = useState(0);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [transactionSearch, setTransactionSearch] = useState('');
  const [walletModalUser, setWalletModalUser] = useState(null);
  const [walletAmount, setWalletAmount] = useState('');
  const [walletType, setWalletType] = useState('credit');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [statsResult, usersResult, transactionsResult] = await Promise.all([
        directSupabaseService.getDashboardStats(),
        directSupabaseService.getAllUsers(),
        directSupabaseService.getAllTransactions()
      ]);
      
      // Mock services data for now
      const servicesResult = { success: true, services: [] };

      if (statsResult.success) setStats(statsResult.stats);
      if (usersResult.success) setUsers(usersResult.users);
      if (transactionsResult.success) {
        const newTransactions = transactionsResult.transactions;
        if (lastTransactionCount > 0 && newTransactions.length > lastTransactionCount) {
          toast.success(`New transaction received! Total: ${newTransactions.length}`);
        }
        setTransactions(newTransactions);
        setLastTransactionCount(newTransactions.length);
      }
      if (servicesResult.success) setServices(servicesResult.services);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleWalletUpdate = async () => {
    if (!walletModalUser || !walletAmount) return;
    const amount = parseFloat(walletAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Invalid amount');
      return;
    }

    const loadingToast = toast.loading('Updating wallet...');
    try {
      const supabase = (await import('../../config/supabase')).default;
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('wallet_balance')
        .eq('id', walletModalUser.id)
        .single();

      const currentBalance = profile?.wallet_balance || 0;
      const newBalance = walletType === 'credit' ? currentBalance + amount : currentBalance - amount;

      if (newBalance < 0) {
        toast.dismiss(loadingToast);
        toast.error('Insufficient balance for debit');
        return;
      }

      const { error } = await supabase
        .from('user_profiles')
        .update({ wallet_balance: newBalance })
        .eq('id', walletModalUser.id);

      if (error) throw error;

      await supabase.from('transactions').insert({
        user_id: walletModalUser.id,
        amount: amount,
        type: walletType,
        status: 'successful',
        description: `Admin ${walletType} - Manual adjustment`
      });

      toast.dismiss(loadingToast);
      toast.success(`₦${amount} ${walletType}ed successfully`);
      setWalletModalUser(null);
      setWalletAmount('');
      await loadDashboardData();
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error('Failed: ' + error.message);
    }
  };

  const exportToCSV = (data, filename) => {
    const csv = data.map(row => Object.values(row).join(',')).join('\n');
    const header = Object.keys(data[0]).join(',');
    const blob = new Blob([header + '\n' + csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    toast.success('Exported successfully');
  };

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
    user.id?.toLowerCase().includes(userSearch.toLowerCase()) ||
    user.phone?.includes(userSearch)
  );

  const filteredTransactions = transactions.filter(tx => 
    tx.id?.toLowerCase().includes(transactionSearch.toLowerCase()) ||
    tx.description?.toLowerCase().includes(transactionSearch.toLowerCase())
  );



  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
    }`}>
      <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>Admin Dashboard</h1>
        <div className="flex gap-2">
          <Button onClick={toggleTheme} variant="outline" className={isDark ? 'border-gray-600 text-white hover:bg-gray-800 hover:text-white bg-transparent' : 'border-gray-400 text-black hover:bg-gray-100 hover:text-black bg-white'}>
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button onClick={loadDashboardData} variant="outline" className={isDark ? 'border-gray-600 text-white hover:bg-gray-800 hover:text-white bg-transparent' : 'border-gray-400 text-black hover:bg-gray-100 hover:text-black bg-white'}>
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className={`flex space-x-1 p-1 rounded-lg w-fit ${
        isDark ? 'bg-gray-800' : 'bg-gray-200'
      }`}>
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'users', label: 'Users' },
          { id: 'transactions', label: 'Transactions' },
          { id: 'leaderboard', label: '🏆 Leaderboard' },
          { id: 'ai-questions', label: '🤖 AI Questions' }
        ].map(tab => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? 'default' : 'ghost'}
            onClick={() => setActiveTab(tab.id)}
            size="sm"
            className={activeTab === tab.id 
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : (isDark ? 'text-white hover:bg-gray-700' : 'text-black hover:bg-gray-200')
            }
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Total Users</p>
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>{stats?.totalUsers || 0}</p>
                </div>
                <Users className={`h-8 w-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
              </div>
            </CardContent>
          </Card>
          
          <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Total Transactions</p>
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>{stats?.totalTransactions || 0}</p>
                </div>
                <Activity className={`h-8 w-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
              </div>
            </CardContent>
          </Card>
          
          <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Total Revenue</p>
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>₦{stats?.totalRevenue || 0}</p>
                </div>
                <DollarSign className={`h-8 w-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
              </div>
            </CardContent>
          </Card>
          
          <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Today's Revenue</p>
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>₦{stats?.todayRevenue || 0}</p>
                </div>
                <TrendingUp className={`h-8 w-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
          <CardContent className="p-0">
            <div className={`p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>All Users ({filteredUsers.length})</h3>
                <Button onClick={() => exportToCSV(users.map(u => ({name: u.name, phone: u.phone, balance: u.walletBalance, created: u.createdAt})), 'users.csv')} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" /> Export
                </Button>
              </div>
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <input
                  type="text"
                  placeholder="Search by name, ID, or phone..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={isDark ? 'bg-gray-700' : 'bg-gray-100'}>
                  <tr>
                    <th className={`text-left p-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Name</th>
                    <th className={`text-left p-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Phone</th>
                    <th className={`text-left p-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Role</th>
                    <th className={`text-left p-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Status</th>
                    <th className={`text-left p-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Wallet Balance</th>
                    <th className={`text-left p-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Created</th>
                    <th className={`text-left p-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user, index) => (
                    <tr key={user.id || index} className={`border-b ${isDark ? 'border-gray-700 hover:bg-gray-700/50' : 'border-gray-200 hover:bg-gray-50'}`}>
                      <td className="p-4">
                        <div>
                          <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{user.name}</span>
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{user.id}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{user.phone || 'N/A'}</span>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={async () => {
                            const newRole = user.role === 'admin' ? 'user' : 'admin';
                            if (!window.confirm(`Change ${user.name}'s role to ${newRole}?`)) return;
                            
                            const loadingToast = toast.loading('Updating role...');
                            try {
                              const supabase = (await import('../../config/supabase')).default;
                              const { error } = await supabase
                                .from('user_profiles')
                                .update({ role: newRole })
                                .eq('id', user.id);
                              
                              if (error) throw error;
                              toast.dismiss(loadingToast);
                              toast.success(`${user.name} is now ${newRole}`);
                              await loadDashboardData();
                            } catch (error) {
                              toast.dismiss(loadingToast);
                              toast.error('Failed: ' + error.message);
                              console.error('Role update error:', error);
                            }
                          }}
                          className={`px-3 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                            user.role === 'admin'
                              ? 'bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900 dark:text-purple-200'
                              : 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200'
                          }`}
                        >
                          {user.role || 'user'} ↻
                        </button>
                      </td>
                      <td className="p-4">
                        <Badge className={user.status === 'active' ? (isDark ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800') : (isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800')}>
                          {user.status || 'active'}
                        </Badge>
                      </td>
                      <td className={`p-4 font-semibold ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                        ₦{user.walletBalance || 0}
                      </td>
                      <td className={`p-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setSelectedUser(user);
                              setIsUserModalOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setWalletModalUser(user)}
                          >
                            <Wallet className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Leaderboard Tab */}
      {activeTab === 'leaderboard' && (
        <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Student Leaderboard</h3>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Track top performers for rewards</p>
                </div>
                <Button onClick={() => {
                  const data = users.map(u => {
                    try {
                      const stats = JSON.parse(localStorage.getItem(`practice_stats_${u.id}`) || '{}');
                      const history = JSON.parse(localStorage.getItem(`practice_history_${u.id}`) || '[]');
                      const totalCorrect = stats.totalCorrect || 0;
                      const totalQuestions = stats.totalQuestions || 0;
                      const averageScore = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
                      const points = (totalCorrect * 10) + (history.length * 50) + (averageScore * 2);
                      return { name: u.name, points, sessions: history.length, score: averageScore };
                    } catch { return null; }
                  }).filter(Boolean);
                  const csv = data.map(r => Object.values(r).join(',')).join('\n');
                  const blob = new Blob(['Name,Points,Sessions,Score\n' + csv], { type: 'text/csv' });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'leaderboard.csv';
                  a.click();
                  toast.success('Exported successfully');
                }} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" /> Export
                </Button>
              </div>
              
              {(() => {
                const leaderboardData = users.map(user => {
                  try {
                    const stats = JSON.parse(localStorage.getItem(`practice_stats_${user.id}`) || '{}');
                    const history = JSON.parse(localStorage.getItem(`practice_history_${user.id}`) || '[]');
                    const totalCorrect = stats.totalCorrect || 0;
                    const totalQuestions = stats.totalQuestions || 0;
                    const averageScore = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
                    const level = Math.floor(totalQuestions / 50) + 1;
                    
                    // Calculate streak
                    const sortedHistory = [...history].sort((a, b) => new Date(b.date) - new Date(a.date));
                    let streak = 0;
                    for (let i = 0; i < sortedHistory.length; i++) {
                      const sessionDate = new Date(sortedHistory[i].date).toDateString();
                      const expectedDate = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toDateString();
                      if (sessionDate === expectedDate) streak++;
                      else break;
                    }
                    
                    const points = (totalCorrect * 10) + (history.length * 50) + (averageScore * 2);
                    return {
                      ...user,
                      totalSessions: history.length,
                      averageScore,
                      points,
                      totalQuestions,
                      level,
                      streak
                    };
                  } catch {
                    return { ...user, totalSessions: 0, averageScore: 0, points: 0, totalQuestions: 0, level: 1, streak: 0 };
                  }
                }).filter(u => u.totalSessions > 0).sort((a, b) => b.points - a.points);

                return leaderboardData.length === 0 ? (
                  <div className="text-center py-12">
                    <Trophy className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
                    <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>No practice data available yet</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className={isDark ? 'bg-gray-700' : 'bg-gray-100'}>
                        <tr>
                          <th className={`text-left p-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Rank</th>
                          <th className={`text-left p-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Student</th>
                          <th className={`text-left p-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Level</th>
                          <th className={`text-left p-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Streak</th>
                          <th className={`text-left p-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Points</th>
                          <th className={`text-left p-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Avg Score</th>
                        </tr>
                      </thead>
                      <tbody>
                        {leaderboardData.map((student, index) => (
                          <tr key={student.id} className={`border-b ${isDark ? 'border-gray-700 hover:bg-gray-700/50' : 'border-gray-200 hover:bg-gray-50'}`}>
                            <td className="p-4">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                                index === 0 ? 'bg-yellow-100 text-yellow-700' :
                                index === 1 ? 'bg-gray-100 text-gray-700' :
                                index === 2 ? 'bg-orange-100 text-orange-700' :
                                isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                              }`}>
                                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                              </div>
                            </td>
                            <td className="p-4">
                              <div>
                                <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{student.name}</p>
                                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{student.totalSessions} sessions</p>
                              </div>
                            </td>
                            <td className="p-4">
                              <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200">
                                Level {student.level}
                              </Badge>
                            </td>
                            <td className="p-4">
                              <span className="flex items-center gap-1 text-orange-600 dark:text-orange-400 font-semibold">
                                🔥 {student.streak} days
                              </span>
                            </td>
                            <td className="p-4">
                              <span className={`font-bold text-lg ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                                {student.points.toLocaleString()}
                              </span>
                            </td>
                            <td className="p-4">
                              <span className={`font-semibold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                                {student.averageScore}%
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })()}
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Questions Tab */}
      {activeTab === 'ai-questions' && (
        <AIQuestions />
      )}

      {/* Transactions Tab */}
      {activeTab === 'transactions' && (
        <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
          <CardContent className="p-0">
            <div className={`p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Recent Transactions ({filteredTransactions.length})</h3>
                <Button onClick={() => exportToCSV(transactions.map(t => ({id: t.id, amount: t.amount, type: t.type, status: t.status, date: t.created_at})), 'transactions.csv')} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" /> Export
                </Button>
              </div>
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <input
                  type="text"
                  placeholder="Search by ID or description..."
                  value={transactionSearch}
                  onChange={(e) => setTransactionSearch(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={isDark ? 'bg-gray-700' : 'bg-gray-100'}>
                  <tr>
                    <th className={`text-left p-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>ID</th>
                    <th className={`text-left p-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Amount</th>
                    <th className={`text-left p-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Type</th>
                    <th className={`text-left p-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Status</th>
                    <th className={`text-left p-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Description</th>
                    <th className={`text-left p-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((transaction, index) => (
                    <tr key={transaction.id || index} className={`border-b ${isDark ? 'border-gray-700 hover:bg-gray-700/50' : 'border-gray-200 hover:bg-gray-50'}`}>
                      <td className={`p-4 font-mono text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{transaction.id}</td>
                      <td className={`p-4 font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>₦{transaction.amount}</td>
                      <td className="p-4">
                        <Badge className={transaction.type === 'credit' ? (isDark ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800') : (isDark ? 'bg-orange-900 text-orange-200' : 'bg-orange-100 text-orange-800')}>
                          {transaction.type}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Badge className={transaction.status === 'successful' ? (isDark ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800') : (isDark ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800')}>
                          {transaction.status}
                        </Badge>
                      </td>
                      <td className={`p-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{transaction.description}</td>
                      <td className={`p-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* User Detail Modal */}
      <UserDetailModal 
        user={selectedUser}
        isOpen={isUserModalOpen}
        onClose={() => {
          setIsUserModalOpen(false);
          setSelectedUser(null);
        }}
        isDark={isDark}
      />

      {/* Wallet Management Modal */}
      {walletModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className={`rounded-lg p-6 max-w-md w-full ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Manage Wallet - {walletModalUser.name}
            </h3>
            <p className={`text-sm mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Current Balance: <span className="font-bold text-green-600">₦{walletModalUser.walletBalance}</span>
            </p>
            
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Type</label>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setWalletType('credit')}
                    variant={walletType === 'credit' ? 'default' : 'outline'}
                    className={walletType === 'credit' ? 'bg-green-600 hover:bg-green-700' : ''}
                  >
                    Credit
                  </Button>
                  <Button
                    onClick={() => setWalletType('debit')}
                    variant={walletType === 'debit' ? 'default' : 'outline'}
                    className={walletType === 'debit' ? 'bg-red-600 hover:bg-red-700' : ''}
                  >
                    Debit
                  </Button>
                </div>
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Amount</label>
                <input
                  type="number"
                  value={walletAmount}
                  onChange={(e) => setWalletAmount(e.target.value)}
                  placeholder="Enter amount"
                  className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <Button onClick={handleWalletUpdate} className="flex-1 bg-blue-600 hover:bg-blue-700">
                Update Wallet
              </Button>
              <Button onClick={() => { setWalletModalUser(null); setWalletAmount(''); }} variant="outline" className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  return (
    <ThemeProvider>
      <AdminDashboardContent />
    </ThemeProvider>
  );
};

export default AdminDashboard;