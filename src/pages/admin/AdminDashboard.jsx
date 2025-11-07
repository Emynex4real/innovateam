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
  const [lastTransactionCount, setLastTransactionCount] = useState(0);

  useEffect(() => {
    loadDashboardData();
    
    // Auto-refresh every 30 seconds for real-time updates
    const interval = setInterval(() => {
      loadDashboardData();
    }, 30000);
    
    return () => clearInterval(interval);
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

  const testDirectTransaction = async () => {
    toast.loading('Testing transaction flow...');
    const currentUser = JSON.parse(localStorage.getItem('confirmedUser') || '{}');
    
    console.log('🧪 Transaction Flow Test:');
    console.log('Current user:', currentUser);
    
    if (!currentUser.id || !currentUser.email) {
      toast.error('No user logged in');
      return;
    }
    
    try {
      const supabaseWalletService = (await import('../../services/supabaseWallet.service')).default;
      const result = await supabaseWalletService.addTransaction(
        currentUser.id,
        currentUser.email,
        {
          description: 'Admin Test Transaction',
          amount: 50,
          type: 'credit',
          status: 'successful'
        }
      );
      
      console.log('Direct Supabase result:', result);
      
      if (result.success) {
        toast.success('Transaction saved to Supabase!');
        setTimeout(() => loadDashboardData(), 1000);
      } else {
        toast.error('Supabase transaction failed: ' + result.error);
      }
    } catch (error) {
      console.error('Transaction test error:', error);
      toast.error('Test failed: ' + error.message);
    }
  };

  const debugTransactions = async () => {
    toast.loading('Checking transactions table...');
    try {
      const result = await supabaseAdminService.getAllTransactions();
      console.log('🔍 Debug Transactions Result:', result);
      if (result.success) {
        console.log('📊 Total transactions found:', result.transactions.length);
        console.log('📋 Transactions data:', result.transactions);
        toast.success(`Found ${result.transactions.length} total transactions`);
      } else {
        console.error('❌ Transaction fetch failed:', result.error);
        toast.error('Failed to fetch transactions: ' + result.error);
      }
    } catch (error) {
      console.error('❌ Debug error:', error);
      toast.error('Debug failed: ' + error.message);
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
        <div className="flex gap-2 flex-wrap">
          <Button onClick={loadDashboardData} variant="outline">
            Refresh Data
          </Button>
          <Button onClick={debugTransactions} variant="outline">
            Debug Transactions
          </Button>
          <Button onClick={testDirectTransaction} variant="outline">
            Test Direct Transaction
          </Button>
          <Button onClick={() => {
            const currentUser = JSON.parse(localStorage.getItem('confirmedUser') || '{}');
            const isValidUUID = currentUser.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(currentUser.id);
            
            console.log('🔍 Current User Debug:');
            console.log('User from localStorage:', currentUser);
            console.log('Has valid UUID:', isValidUUID);
            
            if (!isValidUUID) {
              toast.error('User has invalid UUID format');
            } else {
              toast.success('User has valid UUID');
            }
          }} variant="outline">
            Debug Current User
          </Button>
          <Button onClick={async () => {
            toast.loading('Creating auth user...');
            const currentUser = JSON.parse(localStorage.getItem('confirmedUser') || '{}');
            
            if (!currentUser.email) {
              toast.error('No user email found');
              return;
            }
            
            try {
              // Create real Supabase auth user
              const { createClient } = await import('@supabase/supabase-js');
              const supabaseAdmin = createClient(
                'https://jdedscbvbkjvqmmdabig.supabase.co',
                'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkZWRzY2J2YmtqdnFtbWRhYmlnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTgwNzI3MywiZXhwIjoyMDc1MzgzMjczfQ.OAtp8dTtIuekKgcAo5WagT30xpzZiTivKxH-LujRFW4',
                { auth: { autoRefreshToken: false, persistSession: false } }
              );
              
              const { data, error } = await supabaseAdmin.auth.admin.createUser({
                email: currentUser.email,
                password: 'tempPassword123!',
                email_confirm: true,
                user_metadata: {
                  full_name: currentUser.user_metadata?.full_name || 'User'
                }
              });
              
              if (error) throw error;
              
              // Update localStorage with real user ID
              const updatedUser = { ...currentUser, id: data.user.id };
              localStorage.setItem('confirmedUser', JSON.stringify(updatedUser));
              
              toast.success('Real Supabase user created!');
              console.log('Created user:', data.user);
              setTimeout(() => loadDashboardData(), 1000);
            } catch (error) {
              console.error('User creation failed:', error);
              toast.error('Failed to create user: ' + error.message);
            }
          }} variant="outline">
            Create Real User
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'users', label: 'Users' },
          { id: 'transactions', label: 'Transactions' }
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

      {/* Users Tab */}
      {activeTab === 'users' && (
        <Card>
          <CardContent className="p-0">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold">All Users ({users.length})</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-4">Name</th>
                    <th className="text-left p-4">Phone</th>
                    <th className="text-left p-4">Role</th>
                    <th className="text-left p-4">Status</th>
                    <th className="text-left p-4">Wallet Balance</th>
                    <th className="text-left p-4">Created</th>
                    <th className="text-left p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, index) => (
                    <tr key={user.id || index} className="border-b hover:bg-muted/50">
                      <td className="p-4">
                        <div>
                          <span className="font-medium">{user.name}</span>
                          <p className="text-sm text-muted-foreground">{user.id}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-sm">{user.phone || 'N/A'}</span>
                      </td>
                      <td className="p-4">
                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                          {user.role}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                          {user.status}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <span className="font-medium">₦{user.walletBalance?.toLocaleString()}</span>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="text-sm">{new Date(user.createdAt).toLocaleDateString()}</p>
                          <p className="text-xs text-muted-foreground">{new Date(user.createdAt).toLocaleTimeString()}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => {
                            console.log('User Details:', user);
                            alert(`User: ${user.name}\nID: ${user.id}\nPhone: ${user.phone}\nRole: ${user.role}\nStatus: ${user.status}\nWallet: ₦${user.walletBalance?.toLocaleString()}\nCreated: ${new Date(user.createdAt).toLocaleString()}`);
                          }}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => {
                            const newRole = user.role === 'admin' ? 'user' : 'admin';
                            console.log(`Changing ${user.name} role to ${newRole}`);
                            // Add role update logic here
                          }}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => {
                            const newStatus = user.status === 'active' ? 'banned' : 'active';
                            console.log(`Changing ${user.name} status to ${newStatus}`);
                            // Add status update logic here
                          }}>
                            <Ban className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {users.length === 0 && (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No users found</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Overview Tab */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Users</p>
                    <p className="text-2xl font-bold">{stats.totalUsers}</p>
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
                    <p className="text-2xl font-bold">{stats.totalTransactions}</p>
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

          {/* Recent Transaction Alert */}
          {transactions.length > 0 && (
            <Card className="bg-green-50 dark:bg-green-900/20 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-green-800 dark:text-green-200">Latest Transaction</h3>
                    <p className="text-sm text-green-600 dark:text-green-300">
                      {transactions[0]?.description || 'New Transaction'} - ₦{transactions[0]?.amount?.toLocaleString() || '0'} 
                      ({new Date(transactions[0]?.created_at).toLocaleTimeString()})
                    </p>
                  </div>
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Users Section */}
          <Card>
            <CardContent className="p-0">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold">All Users ({users.length})</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left p-4">Name</th>
                      <th className="text-left p-4">Email</th>
                      <th className="text-left p-4">Role</th>
                      <th className="text-left p-4">Status</th>
                      <th className="text-left p-4">Wallet Balance</th>
                      <th className="text-left p-4">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user, index) => (
                      <tr key={user.id || index} className="border-b">
                        <td className="p-4">
                          <span className="font-medium">{user.name}</span>
                        </td>
                        <td className="p-4">
                          <span className="text-sm">{user.email}</span>
                        </td>
                        <td className="p-4">
                          <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                            {user.role}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                            {user.status}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <span className="font-medium">₦{user.walletBalance?.toLocaleString()}</span>
                        </td>
                        <td className="p-4">
                          <span className="text-sm">{new Date(user.createdAt).toLocaleDateString()}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {users.length === 0 && (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No users found</p>
                </div>
              )}
            </CardContent>
          </Card>



        </div>
      )}

      {/* Transactions Tab */}
      {activeTab === 'transactions' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Recent Transactions</h2>
            <Badge variant="outline">{transactions.length} total</Badge>
          </div>
          
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left p-4">User</th>
                      <th className="text-left p-4">Description</th>
                      <th className="text-left p-4">Amount</th>
                      <th className="text-left p-4">Type</th>
                      <th className="text-left p-4">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.slice(0, 10).map((transaction, index) => (
                      <tr key={transaction.id || index} className="border-b">
                        <td className="p-4">
                          <div>
                            <p className="font-medium">{transaction.user_email || 'Unknown'}</p>
                            <p className="text-sm text-muted-foreground">{transaction.user_id}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="text-sm">{transaction.description || 'Transaction'}</span>
                        </td>
                        <td className="p-4">
                          <span className="font-medium">₦{transaction.amount?.toLocaleString() || '0'}</span>
                        </td>
                        <td className="p-4">
                          <Badge variant={transaction.type === 'credit' ? 'default' : 'secondary'}>
                            {transaction.type || 'unknown'}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div>
                            <p className="text-sm">{new Date(transaction.created_at).toLocaleDateString()}</p>
                            <p className="text-xs text-muted-foreground">{new Date(transaction.created_at).toLocaleTimeString()}</p>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {transactions.length === 0 && (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No transactions found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;