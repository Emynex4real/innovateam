import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Users, DollarSign, Activity, TrendingUp, Eye, Edit, Ban, CheckCircle, Database } from 'lucide-react';
import supabaseAdminService from '../../services/supabaseAdmin.service';
import { checkSupabaseUsers } from '../../utils/supabaseUserCheck';
import { testRegistration, createProfileForExistingUser } from '../../utils/testSupabaseRegistration';
import { testAddTransaction, testWalletFunding } from '../../utils/testTransaction';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [supabaseStatus, setSupabaseStatus] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [statsResult, usersResult, transactionsResult] = await Promise.all([
        supabaseAdminService.getDashboardStats(),
        supabaseAdminService.getAllUsers(),
        supabaseAdminService.getAllTransactions()
      ]);
      
      // Mock services data for now
      const servicesResult = { success: true, services: [] };

      if (statsResult.success) setStats(statsResult.stats);
      if (usersResult.success) setUsers(usersResult.users);
      if (transactionsResult.success) setTransactions(transactionsResult.transactions);
      if (servicesResult.success) setServices(servicesResult.services);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (userId, action, value) => {
    try {
      let result;
      if (action === 'role') {
        result = await supabaseAdminService.updateUserRole(userId, value);
      } else if (action === 'status') {
        result = await supabaseAdminService.updateUserStatus(userId, value);
      }

      if (result.success) {
        toast.success(result.message);
        loadDashboardData();
      }
    } catch (error) {
      toast.error('Action failed');
    }
  };
  
  const checkSupabaseData = async () => {
    const status = await checkSupabaseUsers();
    setSupabaseStatus(status);
    
    if (status.error) {
      toast.error('Supabase check failed');
    } else {
      toast.success('Supabase status updated');
    }
  };
  
  const testSupabaseRegistration = async () => {
    toast.loading('Testing registration...');
    const result = await testRegistration();
    
    if (result.success) {
      toast.success('Registration test successful! Check console for details.');
      setTimeout(() => loadDashboardData(), 3000);
    } else {
      toast.error('Registration test failed: ' + result.error);
    }
  };
  
  const createExistingUserProfile = async () => {
    toast.loading('Creating profile for existing user...');
    const result = await createProfileForExistingUser();
    
    if (result.success) {
      toast.success('Profile created! Check user_profiles table.');
      setTimeout(() => loadDashboardData(), 2000);
    } else {
      toast.error('Profile creation failed: ' + result.error);
    }
  };
  
  const testTransaction = async () => {
    toast.loading('Testing transaction...');
    const result = await testAddTransaction();
    
    if (result.success) {
      toast.success('Transaction created! Check transactions table.');
      setTimeout(() => loadDashboardData(), 2000);
    } else {
      toast.error('Transaction failed: ' + result.error);
    }
  };
  
  const testFunding = async () => {
    toast.loading('Testing wallet funding...');
    const result = await testWalletFunding();
    
    if (result.success) {
      toast.success('Funding successful! Check transactions table.');
      setTimeout(() => loadDashboardData(), 2000);
    } else {
      toast.error('Funding failed: ' + result.error);
    }
  };

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
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex gap-2">
          <Button onClick={loadDashboardData} variant="outline">
            Refresh Data
          </Button>
          <Button onClick={checkSupabaseData} variant="outline">
            <Database className="w-4 h-4 mr-2" />
            Check Supabase
          </Button>
          <Button onClick={testSupabaseRegistration} variant="outline">
            Test Registration
          </Button>
          <Button onClick={createExistingUserProfile} variant="outline">
            Create Profile for Existing User
          </Button>
          <Button onClick={testTransaction} variant="outline">
            Test Transaction
          </Button>
          <Button onClick={testFunding} variant="outline">
            Test Wallet Funding
          </Button>
        </div>
      </div>

      {/* Supabase Status */}
      {supabaseStatus && (
        <Card className="bg-blue-50 dark:bg-blue-900/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-blue-800 dark:text-blue-200">Supabase Status</h3>
                <p className="text-sm text-blue-600 dark:text-blue-300">
                  Session: {supabaseStatus.hasSession ? '✅ Active' : '❌ None'} | 
                  Current User: {supabaseStatus.currentUser || 'None'} | 
                  Data Source: localStorage (Supabase requires service key for user access)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'users', label: 'Users' },
          { id: 'transactions', label: 'Transactions' },
          { id: 'services', label: 'Services' }
        ].map(tab => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? 'default' : 'ghost'}
            onClick={() => setActiveTab(tab.id)}
            size="sm"
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Users</p>
                    <p className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</p>
                    <p className="text-xs text-green-600">+{stats.todayUsers} today</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                    <p className="text-2xl font-bold">₦{stats.totalRevenue.toLocaleString()}</p>
                    <p className="text-xs text-green-600">+₦{stats.todayRevenue.toLocaleString()} today</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Transactions</p>
                    <p className="text-2xl font-bold">{stats.totalTransactions.toLocaleString()}</p>
                    <p className="text-xs text-green-600">+{stats.todayTransactions} today</p>
                  </div>
                  <Activity className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Growth Rate</p>
                    <p className="text-2xl font-bold">{stats.monthlyGrowth}%</p>
                    <p className="text-xs text-green-600">This month</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {users.slice(0, 5).map(user => (
                    <div key={user.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                      <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                        {user.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {transactions.slice(0, 5).map(transaction => (
                    <div key={transaction.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-sm text-muted-foreground">{transaction.userEmail}</p>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                          {transaction.type === 'credit' ? '+' : '-'}₦{transaction.amount.toLocaleString()}
                        </p>
                        <Badge variant={transaction.status === 'successful' ? 'default' : 'destructive'}>
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {users.map(user => (
                <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                      <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                        {user.role}
                      </Badge>
                      <Badge variant={user.status === 'active' ? 'default' : 'destructive'}>
                        {user.status}
                      </Badge>
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">
                      Balance: ₦{user.walletBalance.toLocaleString()} • 
                      Joined: {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUserAction(user.id, 'role', user.role === 'admin' ? 'user' : 'admin')}
                    >
                      {user.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                    </Button>
                    <Button
                      size="sm"
                      variant={user.status === 'active' ? 'destructive' : 'default'}
                      onClick={() => handleUserAction(user.id, 'status', user.status === 'active' ? 'inactive' : 'active')}
                    >
                      {user.status === 'active' ? 'Deactivate' : 'Activate'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transactions Tab */}
      {activeTab === 'transactions' && (
        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transactions.map(transaction => (
                <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {transaction.userEmail} • {new Date(transaction.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-semibold ${transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.type === 'credit' ? '+' : '-'}₦{transaction.amount.toLocaleString()}
                    </p>
                    <Badge variant={transaction.status === 'successful' ? 'default' : 'destructive'}>
                      {transaction.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Services Tab */}
      {activeTab === 'services' && (
        <Card>
          <CardHeader>
            <CardTitle>Service Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map((service, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">{service.name}</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Usage:</span>
                      <span className="font-medium">{service.usage} times</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Revenue:</span>
                      <span className="font-medium">₦{service.revenue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Growth:</span>
                      <span className={`font-medium ${service.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {service.growth > 0 ? '+' : ''}{service.growth}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminDashboard;