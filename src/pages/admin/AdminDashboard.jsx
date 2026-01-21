import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { 
  Users, DollarSign, Activity, TrendingUp, Sun, Moon, 
  Search, Download, ChevronLeft, ChevronRight, Wallet, Eye, BookOpen 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend, LabelList 
} from 'recharts';
import directSupabaseService from '../../services/directSupabase.service';
import UserDetailModal from '../../components/UserDetailModal';
import { useDarkMode } from '../../contexts/DarkModeContext';
import AIQuestions from './AIQuestions';
import AdminLeaderboard from './AdminLeaderboard';
import UploadTextbook from './UploadTextbook';
import TutorialCenters from './TutorialCenters';
import toast from 'react-hot-toast';
import { supabase } from '../../config/supabase'; 

// Deleted Centers Component
const DeletedCentersTable = ({ isDarkMode }) => {
  const [deletedCenters, setDeletedCenters] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    loadDeletedCenters();
  }, []);

  const loadDeletedCenters = async () => {
    try {
      // Get deleted centers
      const { data: centers, error: centersError } = await supabase
        .from('tutorial_centers')
        .select('id, name, access_code, deleted_at, deleted_by, deletion_reason, tutor_id')
        .not('deleted_at', 'is', null)
        .order('deleted_at', { ascending: false });

      if (centersError) throw centersError;

      // Get tutor details
      const tutorIds = [...new Set(centers.map(c => c.tutor_id))];
      const { data: tutors, error: tutorsError } = await supabase
        .from('user_profiles')
        .select('id, full_name, email')
        .in('id', tutorIds);

      if (tutorsError) throw tutorsError;

      // Combine data
      const centersWithTutors = centers.map(center => ({
        ...center,
        tutor: tutors.find(t => t.id === center.tutor_id)
      }));

      setDeletedCenters(centersWithTutors);
    } catch (error) {
      console.error('Error loading deleted centers:', error);
      toast.error('Failed to load deleted centers');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (deletedCenters.length === 0) {
    return <div className="text-center py-8 text-gray-500">No deleted centers found</div>;
  }

  return (
    <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
      <table className="w-full text-sm">
        <thead className={isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50'}>
          <tr>
            <th className="p-3 text-left">Center Name</th>
            <th className="p-3 text-left">Access Code</th>
            <th className="p-3 text-left">Tutor</th>
            <th className="p-3 text-left">Deleted At</th>
            <th className="p-3 text-left">Reason</th>
          </tr>
        </thead>
        <tbody>
          {deletedCenters.map(center => (
            <tr key={center.id} className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
              <td className="p-3 font-medium">{center.name}</td>
              <td className="p-3 font-mono text-xs">{center.access_code}</td>
              <td className="p-3">
                <div>{center.tutor?.full_name || 'Unknown'}</div>
                <div className="text-xs text-gray-500">{center.tutor?.email}</div>
              </td>
              <td className="p-3 text-sm">
                {new Date(center.deleted_at).toLocaleString()}
              </td>
              <td className="p-3 text-sm">
                <span className={`px-2 py-1 rounded text-xs ${
                  center.deletion_reason 
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' 
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                }`}>
                  {center.deletion_reason || 'No reason provided'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}; 

// --- STAT CARD COMPONENT ---
const StatCard = ({ title, value, icon: Icon, isDarkMode, subValue }) => (
  <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} hover:shadow-lg transition-all`}>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{title}</p>
          <h3 className={`text-2xl font-bold mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{value}</h3>
          {subValue && <p className="text-xs text-green-500 mt-1 flex items-center">↑ {subValue}</p>}
        </div>
        <div className={`p-3 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
          <Icon className={`h-6 w-6 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
        </div>
      </div>
    </CardContent>
  </Card>
);

const AdminDashboardContent = () => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  
  // --- STATE MANAGEMENT ---
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  
  // Data
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [creditRequests, setCreditRequests] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  
  // REAL CHART DATA STATE (Replaces Mock Data)
  const [chartData, setChartData] = useState([]);

  // Modals & Actions
  const [selectedUser, setSelectedUser] = useState(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [walletModalUser, setWalletModalUser] = useState(null);
  const [walletAmount, setWalletAmount] = useState('');
  const [walletType, setWalletType] = useState('credit');
  const [roleModalUser, setRoleModalUser] = useState(null);
  const [newRole, setNewRole] = useState('');
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastData, setBroadcastData] = useState({
    title: '',
    message: '',
    type: 'announcement',
    priority: 'normal',
    targetAudience: 'all'
  });

  // Pagination & Search
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [itemsPerPage] = useState(10);

  // --- INITIAL DATA LOAD ---
  useEffect(() => {
    loadStats();
    loadCreditRequests(); 
  }, []);

  // --- TAB SWITCH LOAD ---
  useEffect(() => {
    if (activeTab === 'users' || activeTab === 'transactions') {
      loadTableData();
    }
  }, [activeTab, currentPage, searchTerm]);

  // --- DATA FETCHING FUNCTIONS ---

  const loadStats = async () => {
    // console.log('📊 [AdminDashboard] Loading stats...');
    // 1. Load General Stats (Top Cards)
    const statsResult = await directSupabaseService.getDashboardStats();
    // console.log('📊 [AdminDashboard] Stats result:', statsResult);
    if (statsResult.success) {
      // console.log('✅ [AdminDashboard] Stats loaded:', statsResult.stats);
      setStats(statsResult.stats);
    } else {
      console.error('❌ [AdminDashboard] Failed to load stats:', statsResult.error);
    }

    // 2. Load Real Chart Data (Graphs)
    // Checks if the new service method exists before calling to prevent crashes
    if (directSupabaseService.getChartData) {
      const chartResult = await directSupabaseService.getChartData();
      // console.log('📊 [AdminDashboard] Chart result:', chartResult);
      if (chartResult.success) {
        // console.log('✅ [AdminDashboard] Chart data loaded:', chartResult.chartData);
        setChartData(chartResult.chartData);
      }
    }
  };

  const loadCreditRequests = async () => {
    try {
      const result = await directSupabaseService.getCreditRequests();
      if (result.success) setCreditRequests(result.requests);
    } catch (error) {
      // Credit requests table doesn't exist - skip silently
      setCreditRequests([]);
    }
  };

  const loadTableData = async () => {
    setLoading(true);
    try {
      let result;
      if (activeTab === 'users') {
        result = await directSupabaseService.getAllUsers(currentPage, itemsPerPage, searchTerm);
        if (result.success) {
          setUsers(result.users);
          setTotalItems(result.totalCount || 0);
        }
      } else if (activeTab === 'transactions') {
        result = await directSupabaseService.getAllTransactions(currentPage, itemsPerPage, searchTerm);
        if (result.success) {
          setTransactions(result.transactions);
          setTotalItems(result.totalCount || 0);
        }
      }
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // --- FAST REFRESH FUNCTION ---
  const handleRefresh = async () => {
    const loadingToast = toast.loading('Refreshing dashboard...');
    setLoading(true);
    try {
      await Promise.all([
        loadStats(), // Refreshes Stats AND Charts
        loadCreditRequests(),
        (activeTab === 'users' || activeTab === 'transactions') ? loadTableData() : Promise.resolve()
      ]);
      toast.success('Dashboard updated');
    } catch (error) {
      toast.error('Refresh failed');
    } finally {
      toast.dismiss(loadingToast);
      setLoading(false);
    }
  };

  // --- ACTION HANDLERS ---

  const handleWalletUpdate = async () => {
    if (!walletModalUser || !walletAmount) return;
    const amount = parseFloat(walletAmount);
    if (isNaN(amount) || amount <= 0) return toast.error('Invalid amount');

    const loadingToast = toast.loading('Updating wallet...');
    try {
      // Call the secure stored procedure
      const { data, error } = await supabase.rpc('admin_adjust_wallet', {
        target_user_id: walletModalUser.id,
        adjustment_amount: amount,
        adjustment_type: walletType,
        admin_notes: `Admin ${walletType} - Manual adjustment`
      });

      if (error) throw error;
      
      if (data && !data.success) {
        throw new Error(data.error || 'Failed to update wallet');
      }

      toast.dismiss(loadingToast);
      toast.success(`Wallet ${walletType}ed successfully`);
      setWalletModalUser(null);
      setWalletAmount('');
      loadTableData(); 
      loadStats();
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error(error.message);
    }
  };

  const handleRoleUpdate = async () => {
    if (!roleModalUser || !newRole) return toast.error('Please select a role');

    const loadingToast = toast.loading('Updating role...');
    try {
      const { data, error } = await supabase.rpc('admin_update_user_role', {
        target_user_id: roleModalUser.id,
        new_role: newRole,
        reason: `Role changed to ${newRole} by admin`
      });

      if (error) throw error;
      
      if (data && !data.success) {
        throw new Error(data.error || 'Failed to update role');
      }

      toast.dismiss(loadingToast);
      toast.success(data.message || 'Role updated successfully');
      setRoleModalUser(null);
      setNewRole('');
      loadTableData();
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error(error.message);
    }
  };

  const handleBroadcastNotification = async () => {
    if (!broadcastData.title || !broadcastData.message) {
      return toast.error('Title and message are required');
    }

    const loadingToast = toast.loading('Sending notification...');
    try {
      const { data, error } = await supabase.rpc('admin_broadcast_notification', {
        notification_title: broadcastData.title,
        notification_message: broadcastData.message,
        notification_type: broadcastData.type,
        notification_priority: broadcastData.priority,
        target_audience: broadcastData.targetAudience
      });

      if (error) throw error;
      
      if (data && !data.success) {
        throw new Error(data.error || 'Failed to send notification');
      }

      toast.dismiss(loadingToast);
      toast.success(data.message || 'Notification sent successfully');
      setShowBroadcastModal(false);
      setBroadcastData({
        title: '',
        message: '',
        type: 'announcement',
        priority: 'normal',
        targetAudience: 'all'
      });
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error(error.message);
    }
  };

  const handleCreditRequest = async (requestId, action, userId, amount) => {
    const loadingToast = toast.loading('Processing request...');
    try {
      if (action === 'approve') {
        const { data: profile } = await supabase.from('user_profiles').select('wallet_balance').eq('id', userId).single();
        await supabase.from('user_profiles').update({ wallet_balance: (profile.wallet_balance || 0) + amount }).eq('id', userId);
        await supabase.from('transactions').insert({
          user_id: userId, amount, type: 'credit', status: 'successful', description: 'Credit Request Approved'
        });
      }

      await supabase.from('credit_requests')
        .update({ status: action === 'approve' ? 'approved' : 'rejected' })
        .eq('id', requestId);

      toast.dismiss(loadingToast);
      toast.success(`Request ${action}d`);
      loadCreditRequests(); 
      loadStats(); // Refresh charts
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error('Action failed');
    }
  };

  // --- RENDERERS ---

  const renderPagination = () => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    return (
      <div className="flex items-center justify-between mt-4">
        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Page {currentPage} of {totalPages || 1} (Total: {totalItems})
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Admin Portal</h1>
            <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Manage users, finances, and AI content.</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={toggleDarkMode} variant="outline" size="icon" className="rounded-full">
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Button onClick={() => setShowBroadcastModal(true)} variant="default" className="flex items-center gap-2">
               <Activity className="h-4 w-4" /> 
               Broadcast Notification
            </Button>
            <Button onClick={handleRefresh} variant="outline" className="flex items-center gap-2">
               <Activity className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> 
               Refresh
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <div className={`flex flex-wrap gap-2 p-1 rounded-xl w-full md:w-fit ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
          {[
            { id: 'overview', label: 'Overview', icon: Activity },
            { id: 'users', label: 'Users', icon: Users },
            { id: 'transactions', label: 'Transactions', icon: DollarSign },
            { id: 'credit-requests', label: 'Credits', icon: TrendingUp },
            { id: 'tutorial-centers', label: 'Tutorial Centers', icon: Activity },
            { id: 'deleted-centers', label: 'Deleted Centers', icon: Activity },
            { id: 'leaderboard', label: 'Leaderboard', icon: TrendingUp },
            { id: 'ai-questions', label: 'AI Studio', icon: Activity },
            { id: 'upload-textbook', label: 'Upload Textbook', icon: BookOpen }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setSearchTerm(''); setCurrentPage(1); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : (isDarkMode ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-black hover:bg-gray-200')
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* --- MAIN CONTENT --- */}
        <div className="min-h-[500px]">
          
          {/* 1. OVERVIEW TAB (With REAL Charts) */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Total Revenue" value={`₦${stats?.totalRevenue?.toLocaleString() || 0}`} icon={DollarSign} isDarkMode={isDarkMode} />
                <StatCard title="Total Users" value={stats?.totalUsers || 0} icon={Users} isDarkMode={isDarkMode} />
                <StatCard title="Transactions" value={stats?.totalTransactions || 0} icon={Activity} isDarkMode={isDarkMode} />
                <StatCard title="Active Today" value={stats?.activeToday || 0} icon={TrendingUp} isDarkMode={isDarkMode} />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Revenue Chart */}
                <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
                  <CardContent className="p-6">
                    <h3 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Revenue Trends (Last 7 Days)</h3>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#e5e7eb'} />
                          <XAxis dataKey="name" stroke={isDarkMode ? '#9CA3AF' : '#4B5563'} fontSize={12} />
                          <YAxis stroke={isDarkMode ? '#9CA3AF' : '#4B5563'} tickFormatter={(val) => `₦${val}`} fontSize={12} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: isDarkMode ? '#1F2937' : '#fff', borderColor: isDarkMode ? '#374151' : '#e5e7eb', color: isDarkMode ? '#fff' : '#000' }}
                            formatter={(value) => [`₦${value.toLocaleString()}`, 'Revenue']}
                          />
                          <Legend />
                          <Bar dataKey="revenue" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Daily Revenue">
                            <LabelList dataKey="revenue" position="top" formatter={(v) => v > 0 ? `₦${v}` : ''} style={{ fill: isDarkMode ? '#9CA3AF' : '#4B5563', fontSize: 10 }} />
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* User Growth Chart */}
                <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
                  <CardContent className="p-6">
                    <h3 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>New Users (Last 7 Days)</h3>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#e5e7eb'} />
                          <XAxis dataKey="name" stroke={isDarkMode ? '#9CA3AF' : '#4B5563'} fontSize={12} />
                          <YAxis stroke={isDarkMode ? '#9CA3AF' : '#4B5563'} fontSize={12} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: isDarkMode ? '#1F2937' : '#fff', borderColor: isDarkMode ? '#374151' : '#e5e7eb', color: isDarkMode ? '#fff' : '#000' }}
                          />
                          <Legend />
                          <Line type="monotone" dataKey="users" stroke="#10B981" strokeWidth={3} activeDot={{ r: 8 }} name="New Users">
                             <LabelList dataKey="users" position="top" offset={10} formatter={(v) => v > 0 ? v : ''} style={{ fill: isDarkMode ? '#9CA3AF' : '#4B5563', fontSize: 10 }} />
                          </Line>
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* 2. USERS TAB */}
          {activeTab === 'users' && (
            <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
              <CardContent className="p-6">
                <div className="flex justify-between mb-4">
                  <div className="relative w-1/3">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input placeholder="Search users..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
                  </div>
                  <Button variant="outline"><Download className="h-4 w-4 mr-2"/> Export</Button>
                </div>
                <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
                  <table className="w-full text-sm">
                    <thead className={isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50'}>
                      <tr>
                        <th className="p-3 text-left">User</th>
                        <th className="p-3 text-left">Phone</th>
                        <th className="p-3 text-left">Role</th>
                        <th className="p-3 text-left">Balance</th>
                        <th className="p-3 text-left">Status</th>
                        <th className="p-3 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(user => (
                        <tr key={user.id} className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                          <td className="p-3">
                            <div className="font-medium">{user.name}</div>
                            <div className="text-xs text-gray-500">{user.email}</div>
                          </td>
                          <td className="p-3 text-sm">{user.phone || 'N/A'}</td>
                          <td className="p-3">
                            <Badge variant={user.role === 'admin' ? 'default' : 'outline'}>
                              {user.role}
                            </Badge>
                          </td>
                          <td className="p-3 font-mono text-green-500">₦{user.walletBalance}</td>
                          <td className="p-3"><Badge variant="outline">{user.status}</Badge></td>
                          <td className="p-3 flex gap-2">
                            <Button size="sm" variant="ghost" onClick={() => { setSelectedUser(user); setIsUserModalOpen(true); }} title="View Details">
                               <Eye className="h-4 w-4"/>
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => setWalletModalUser(user)} title="Manage Wallet">
                               <Wallet className="h-4 w-4"/>
                            </Button>
                            {user.email !== 'emynex4real@gmail.com' && (
                              <Button size="sm" variant="ghost" onClick={() => { setRoleModalUser(user); setNewRole(user.role); }} title="Change Role">
                                 <Users className="h-4 w-4"/>
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {renderPagination()}
              </CardContent>
            </Card>
          )}

          {/* 3. TRANSACTIONS TAB */}
          {activeTab === 'transactions' && (
            <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
              <CardContent className="p-6">
                <div className="relative w-1/3 mb-4">
                   <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                   <Input placeholder="Search transactions..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
                </div>
                <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
                  <table className="w-full text-sm">
                    <thead className={isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50'}>
                      <tr>
                        <th className="p-3 text-left">ID</th>
                        <th className="p-3 text-left">User</th>
                        <th className="p-3 text-left">Amount</th>
                        <th className="p-3 text-left">Type</th>
                        <th className="p-3 text-left">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map(tx => (
                        <tr key={tx.id} className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                          <td className="p-3 font-mono text-xs">{tx.id.substring(0,8)}...</td>
                          <td className="p-3">{tx.userName}</td>
                          <td className={`p-3 font-mono ${tx.type === 'credit' ? 'text-green-500' : 'text-red-500'}`}>
                            {tx.type === 'credit' ? '+' : '-'}₦{tx.amount}
                          </td>
                          <td className="p-3"><Badge variant="outline">{tx.type}</Badge></td>
                          <td className="p-3 text-gray-500">{new Date(tx.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {renderPagination()}
              </CardContent>
            </Card>
          )}

          {/* 4. CREDIT REQUESTS TAB */}
          {activeTab === 'credit-requests' && (
            <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-4">Pending Requests</h3>
                <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
                  <table className="w-full text-sm">
                    <thead className={isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50'}>
                      <tr>
                        <th className="p-3 text-left">User</th>
                        <th className="p-3 text-left">Amount</th>
                        <th className="p-3 text-left">Status</th>
                        <th className="p-3 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {creditRequests.map(req => (
                        <tr key={req.id} className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                          <td className="p-3">{req.user_profiles?.full_name || 'Unknown'}</td>
                          <td className="p-3 font-bold text-green-500">₦{req.amount}</td>
                          <td className="p-3"><Badge>{req.status}</Badge></td>
                          <td className="p-3">
                            {req.status === 'pending' && (
                              <div className="flex gap-2">
                                <Button size="sm" className="bg-green-600" onClick={() => handleCreditRequest(req.id, 'approve', req.user_id, req.amount)}>Approve</Button>
                                <Button size="sm" variant="destructive" onClick={() => handleCreditRequest(req.id, 'reject')}>Reject</Button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'ai-questions' && <AIQuestions />}
          {activeTab === 'leaderboard' && <AdminLeaderboard />}
          {activeTab === 'upload-textbook' && <UploadTextbook />}
          {activeTab === 'tutorial-centers' && <TutorialCenters />}
          
          {/* 5. DELETED CENTERS TAB */}
          {activeTab === 'deleted-centers' && (
            <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-4">Deleted Tutorial Centers (Audit Trail)</h3>
                <DeletedCentersTable isDarkMode={isDarkMode} />
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* --- MODALS --- */}
      
      {/* 1. Wallet Modal */}
      {walletModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className={`rounded-lg p-6 max-w-md w-full ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className="text-lg font-bold mb-4">Manage Wallet: {walletModalUser.name}</h3>
            <p className="mb-4">Current Balance: <span className="text-green-500 font-mono">₦{walletModalUser.walletBalance}</span></p>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button onClick={() => setWalletType('credit')} variant={walletType === 'credit' ? 'default' : 'outline'} className="flex-1">Credit</Button>
                <Button onClick={() => setWalletType('debit')} variant={walletType === 'debit' ? 'destructive' : 'outline'} className="flex-1">Debit</Button>
              </div>
              <Input type="number" placeholder="Amount" value={walletAmount} onChange={(e) => setWalletAmount(e.target.value)} />
              <div className="flex gap-2">
                <Button onClick={handleWalletUpdate} className="flex-1">Confirm</Button>
                <Button onClick={() => setWalletModalUser(null)} variant="outline" className="flex-1">Cancel</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Role Change Modal */}
      {roleModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className={`rounded-lg p-6 max-w-md w-full ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className="text-lg font-bold mb-4">Change Role: {roleModalUser.name}</h3>
            <p className="mb-4">Current Role: <Badge variant="outline">{roleModalUser.role}</Badge></p>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">New Role</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className={`flex h-10 w-full rounded-md border px-3 py-2 text-sm ${
                    isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                  }`}
                >
                  <option value="student">Student</option>
                  <option value="tutor">Tutor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleRoleUpdate} className="flex-1">Update Role</Button>
                <Button onClick={() => setRoleModalUser(null)} variant="outline" className="flex-1">Cancel</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. User Detail Modal */}
      <UserDetailModal 
        user={selectedUser}
        isOpen={isUserModalOpen}
        onClose={() => { setIsUserModalOpen(false); setSelectedUser(null); }}
        isDarkMode={isDarkMode}
      />

      {/* 4. Broadcast Notification Modal */}
      {showBroadcastModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className={`rounded-lg p-6 max-w-lg w-full ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className="text-lg font-bold mb-4">Broadcast Notification</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input
                  placeholder="Notification title"
                  value={broadcastData.title}
                  onChange={(e) => setBroadcastData({...broadcastData, title: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Message</label>
                <textarea
                  placeholder="Notification message"
                  value={broadcastData.message}
                  onChange={(e) => setBroadcastData({...broadcastData, message: e.target.value})}
                  rows={4}
                  className={`flex w-full rounded-md border px-3 py-2 text-sm ${
                    isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                  }`}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Send To</label>
                <select
                  value={broadcastData.targetAudience}
                  onChange={(e) => setBroadcastData({...broadcastData, targetAudience: e.target.value})}
                  className={`flex h-10 w-full rounded-md border px-3 py-2 text-sm ${
                    isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                  }`}
                >
                  <option value="all">All Users</option>
                  <option value="students">Students Only</option>
                  <option value="tutors">Tutors Only</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Type</label>
                  <select
                    value={broadcastData.type}
                    onChange={(e) => setBroadcastData({...broadcastData, type: e.target.value})}
                    className={`flex h-10 w-full rounded-md border px-3 py-2 text-sm ${
                      isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                    }`}
                  >
                    <option value="info">Info</option>
                    <option value="success">Success</option>
                    <option value="warning">Warning</option>
                    <option value="error">Error</option>
                    <option value="announcement">Announcement</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Priority</label>
                  <select
                    value={broadcastData.priority}
                    onChange={(e) => setBroadcastData({...broadcastData, priority: e.target.value})}
                    className={`flex h-10 w-full rounded-md border px-3 py-2 text-sm ${
                      isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                    }`}
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleBroadcastNotification} className="flex-1">
                  Send to {broadcastData.targetAudience === 'all' ? 'All Users' : broadcastData.targetAudience === 'students' ? 'Students' : 'Tutors'}
                </Button>
                <Button onClick={() => setShowBroadcastModal(false)} variant="outline" className="flex-1">Cancel</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const AdminDashboard = () => <AdminDashboardContent />;

export default AdminDashboard;
