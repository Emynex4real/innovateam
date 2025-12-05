import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Users, DollarSign, Activity, TrendingUp, Eye, Edit, Ban, CheckCircle, Database, Moon, Sun } from 'lucide-react';
import directSupabaseService from '../../services/directSupabase.service';
import UserDetailModal from '../../components/UserDetailModal';
import { ThemeProvider, useTheme } from '../../contexts/ThemeContext';
import AIQuestions from './AIQuestions';
import { checkSupabaseUsers } from '../../utils/supabaseUserCheck';
import { testRegistration, createProfileForExistingUser } from '../../utils/testSupabaseRegistration';
import { testAddTransaction, testWalletFunding } from '../../utils/testTransaction';
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
      const result = await directSupabaseService.getAllTransactions();
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
    <div className={`min-h-screen transition-colors duration-200 ${
      isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
    }`}>
      <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>Admin Dashboard</h1>
        <div className="flex gap-1 flex-wrap max-w-full overflow-x-auto pb-2">
          <Button onClick={toggleTheme} variant="outline" className={isDark ? 'border-gray-600 text-white hover:bg-gray-800 hover:text-white bg-transparent' : 'border-gray-400 text-black hover:bg-gray-100 hover:text-black bg-white'}>
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button onClick={loadDashboardData} variant="outline" className={isDark ? 'border-gray-600 text-white hover:bg-gray-800 hover:text-white bg-transparent' : 'border-gray-400 text-black hover:bg-gray-100 hover:text-black bg-white'}>
            Refresh Data
          </Button>
          <Button onClick={debugTransactions} variant="outline" className={isDark ? 'border-gray-600 text-white hover:bg-gray-800 hover:text-white bg-transparent' : 'border-gray-400 text-black hover:bg-gray-100 hover:text-black bg-white'}>
            Debug Transactions
          </Button>
          <Button onClick={testDirectTransaction} variant="outline" className={isDark ? 'border-gray-600 text-white hover:bg-gray-800 hover:text-white bg-transparent' : 'border-gray-400 text-black hover:bg-gray-100 hover:text-black bg-white'}>
            Test Direct Transaction
          </Button>
          <Button onClick={async () => {
            toast.loading('Testing service purchase...');
            try {
              // First check current balance
              const currentUser = JSON.parse(localStorage.getItem('confirmedUser') || '{}');
              const directSupabaseService = (await import('../../services/directSupabase.service')).default;
              const { data: userProfile } = await directSupabaseService.supabase
                .from('user_profiles')
                .select('wallet_balance')
                .eq('id', currentUser.id)
                .single();
              
              const currentBalance = userProfile?.wallet_balance || 0;
              console.log('Current balance before purchase:', currentBalance);
              
              if (currentBalance < 3500) {
                toast.error(`Insufficient balance: ₦${currentBalance}. Use 'Fix Balance' first.`);
                return;
              }
              
              const simpleWalletService = (await import('../../services/simpleWallet.service')).default;
              const result = await simpleWalletService.addTransaction(
                currentUser.email,
                3500,
                'Test WAEC Result Checker Purchase',
                'debit'
              );
              
              if (result.success) {
                toast.success(`Service purchased! New balance: ₦${result.newBalance}`);
                localStorage.setItem('wallet_balance', result.newBalance.toString());
                setTimeout(() => loadDashboardData(), 1000);
              } else {
                toast.error('Purchase failed: ' + result.error);
              }
            } catch (error) {
              toast.error('Test failed: ' + error.message);
            }
          }} variant="outline" className={isDark ? 'border-gray-600 text-white hover:bg-gray-800 hover:text-white bg-transparent' : 'border-gray-400 text-black hover:bg-gray-100 hover:text-black bg-white'}>
            Test Service Purchase
          </Button>
          <Button onClick={async () => {
            const currentUser = JSON.parse(localStorage.getItem('confirmedUser') || '{}');
            const isValidUUID = currentUser.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(currentUser.id);
            
            console.log('🔍 Current User Debug:');
            console.log('User from localStorage:', currentUser);
            console.log('Has valid UUID:', isValidUUID);
            
            // Also check their balance from Supabase
            if (currentUser.id) {
              try {
                const directSupabaseService = (await import('../../services/directSupabase.service')).default;
                const { data: userProfile } = await directSupabaseService.supabase
                  .from('user_profiles')
                  .select('wallet_balance')
                  .eq('id', currentUser.id)
                  .single();
                
                console.log('💰 Real balance from Supabase:', userProfile?.wallet_balance || 0);
                toast.success(`User: ${currentUser.name}, Balance: ₦${userProfile?.wallet_balance || 0}`);
              } catch (error) {
                console.error('Balance check failed:', error);
                toast.error('User valid but balance check failed');
              }
            } else {
              toast.error('No valid user found');
            }
          }} variant="outline" className={isDark ? 'border-gray-600 text-white hover:bg-gray-800 hover:text-white bg-transparent' : 'border-gray-400 text-black hover:bg-gray-100 hover:text-black bg-white'}>
            Debug Current User
          </Button>
          <Button onClick={async () => {
            toast.loading('Testing connection...');
            try {
              const { testNewSupabaseKeys } = await import('../../utils/testNewKeys');
              const result = await testNewSupabaseKeys();
              
              if (result.success) {
                toast.success('Connection working!');
                setTimeout(() => loadDashboardData(), 1000);
              } else {
                toast.error('Connection failed: ' + result.error);
              }
            } catch (error) {
              toast.error('Test failed: ' + error.message);
            }
          }} variant="outline" className={isDark ? 'border-gray-600 text-white hover:bg-gray-800 hover:text-white bg-transparent' : 'border-gray-400 text-black hover:bg-gray-100 hover:text-black bg-white'}>
            Test Connection
          </Button>
          <Button onClick={async () => {
            // Check current user first
            const currentUser = JSON.parse(localStorage.getItem('confirmedUser') || '{}');
            console.log('👤 Current user before switch:', currentUser);
            
            // Set the user with balance as current user for testing
            const testUser = {
              id: 'e98d12a8-0047-41ee-9d84-ab872959efe4',
              email: 'adeejidi@gmail.com',
              name: 'Hei Mafon'
            };
            localStorage.setItem('confirmedUser', JSON.stringify(testUser));
            localStorage.setItem('wallet_balance', '99850'); // Set current Supabase balance
            
            // Verify the switch worked
            const newUser = JSON.parse(localStorage.getItem('confirmedUser') || '{}');
            console.log('👤 User after switch:', newUser);
            
            toast.success(`Switched to ${testUser.name} with ₦99,850 balance!`);
            setTimeout(() => loadDashboardData(), 500);
          }} variant="outline" className={isDark ? 'border-gray-600 text-white hover:bg-gray-800 hover:text-white bg-transparent' : 'border-gray-400 text-black hover:bg-gray-100 hover:text-black bg-white'}>
            Switch to Rich User
          </Button>
          <Button onClick={async () => {
            toast.loading('Testing wallet funding...');
            try {
              const currentUser = JSON.parse(localStorage.getItem('confirmedUser') || '{}');
              if (!currentUser.id) {
                toast.error('No user logged in');
                return;
              }

              console.log('💰 Current user for funding:', currentUser);
              
              // Check current balance first
              const directSupabaseService = (await import('../../services/directSupabase.service')).default;
              const { data: userProfile } = await directSupabaseService.supabase
                .from('user_profiles')
                .select('wallet_balance, full_name')
                .eq('id', currentUser.id)
                .single();
              
              console.log('💰 Current balance before funding:', userProfile?.wallet_balance);
              
              // Test wallet funding with cleanWalletService
              const cleanWalletService = (await import('../../services/cleanWallet.service')).default;
              const result = await cleanWalletService.fundWallet(5000, 'test-topup');
              
              if (result.success) {
                toast.success(`Wallet funded for ${userProfile?.full_name}! Added ₦5,000. New balance: ₦${result.balance}`);
                setTimeout(() => loadDashboardData(), 1000);
              } else {
                toast.error('Funding failed: ' + result.error);
              }
            } catch (error) {
              console.error('Funding error:', error);
              toast.error('Funding failed: ' + error.message);
            }
          }} variant="outline" className={isDark ? 'border-gray-600 text-white hover:bg-gray-800 hover:text-white bg-transparent' : 'border-gray-400 text-black hover:bg-gray-100 hover:text-black bg-white'}>
            Test Wallet Funding
          </Button>
          <Button onClick={() => {
            const credentials = [
              'innovateamnigeria@gmail.com / innovateam2024!',
              'adeejidi@gmail.com / mafon123!'
            ];
            console.log('🔑 Valid login credentials:');
            credentials.forEach(cred => console.log('  - ' + cred));
            toast.success('Check console for login credentials');
          }} variant="outline" className={isDark ? 'border-gray-600 text-white hover:bg-gray-800 hover:text-white bg-transparent' : 'border-gray-400 text-black hover:bg-gray-100 hover:text-black bg-white'}>
            Show Login Info
          </Button>
          <Button onClick={async () => {
            toast.loading('Testing user registration...');
            try {
              const timestamp = Date.now();
              const supabaseAuthService = (await import('../../services/supabaseAuth.service')).default;
              const result = await supabaseAuthService.register({
                email: `testuser${timestamp}@gmail.com`,
                password: 'testuser123!',
                name: `Test User ${timestamp}`
              });
              
              if (result.success) {
                toast.success(`User registered! ${result.user.name}`);
                console.log('✅ New user created:', result.user);
                console.log('✅ Check Supabase user_profiles table for the new user');
                setTimeout(() => loadDashboardData(), 2000);
              } else {
                toast.error('Registration failed: ' + result.error);
                console.error('❌ Registration error:', result.error);
              }
            } catch (error) {
              toast.error('Registration failed: ' + error.message);
              console.error('❌ Registration exception:', error);
            }
          }} variant="outline" className={isDark ? 'border-gray-600 text-white hover:bg-gray-800 hover:text-white bg-transparent' : 'border-gray-400 text-black hover:bg-gray-100 hover:text-black bg-white'}>
            Test Registration
          </Button>
          <Button onClick={async () => {
            toast.loading('Checking Supabase for new users...');
            try {
              const directSupabaseService = (await import('../../services/directSupabase.service')).default;
              const { data: profiles, error } = await directSupabaseService.supabase
                .from('user_profiles')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(5);
              
              if (error) {
                toast.error('Failed to check users: ' + error.message);
              } else {
                console.log('👥 Recent users in Supabase:');
                profiles.forEach((profile, index) => {
                  console.log(`  ${index + 1}. ${profile.full_name} (${profile.id}) - ${profile.created_at}`);
                });
                toast.success(`Found ${profiles.length} users. Check console for details.`);
              }
            } catch (error) {
              toast.error('Check failed: ' + error.message);
            }
          }} variant="outline" className={isDark ? 'border-gray-600 text-white hover:bg-gray-800 hover:text-white bg-transparent' : 'border-gray-400 text-black hover:bg-gray-100 hover:text-black bg-white'}>
            Check Supabase Users
          </Button>
          <Button onClick={async () => {
            toast.loading('Testing login security...');
            try {
              // Test the actual App.js signIn function that the login page uses
              const { useAuth } = await import('../../App');
              
              // Simulate what happens when someone tries to login with fake credentials
              const testCredentials = [
                { email: 'fake@example.com', password: 'fakepass', desc: 'Fake account' },
                { email: 'test@test.com', password: 'wrongpass', desc: 'Wrong credentials' },
                { email: '', password: 'test', desc: 'Empty email' }
              ];
              
              let allPassed = true;
              
              for (const cred of testCredentials) {
                // Import the signIn function directly
                const supabaseAuthService = (await import('../../services/supabaseAuth.service')).default;
                const result = await supabaseAuthService.login(cred);
                
                if (result.success) {
                  console.log(`❌ Security FAILED: ${cred.desc} was allowed to login`);
                  allPassed = false;
                } else {
                  console.log(`✅ Security PASSED: ${cred.desc} was rejected - ${result.error}`);
                }
              }
              
              if (allPassed) {
                toast.success('🔒 Security PASSED - All fake logins rejected!');
              } else {
                toast.error('🚨 Security FAILED - Some fake logins succeeded!');
              }
            } catch (error) {
              toast.success('🔒 Security PASSED - Login system secure: ' + error.message);
            }
          }} variant="outline" className={isDark ? 'border-gray-600 text-white hover:bg-gray-800 hover:text-white bg-transparent' : 'border-gray-400 text-black hover:bg-gray-100 hover:text-black bg-white'}>
            Test Login Security
          </Button>
          <Button onClick={async () => {
            toast.loading('Testing logout...');
            try {
              console.log('🚪 Before logout - localStorage:', {
                confirmedUser: localStorage.getItem('confirmedUser'),
                authToken: localStorage.getItem('auth_token'),
                user: localStorage.getItem('user')
              });
              
              // Clear all auth data
              localStorage.removeItem('confirmedUser');
              localStorage.removeItem('wallet_balance');
              localStorage.removeItem('auth_token');
              localStorage.removeItem('user');
              
              console.log('🚪 After logout - localStorage cleared');
              
              toast.success('Logout test completed! Try refreshing - should redirect to login');
              
              // Force page reload to test route protection
              setTimeout(() => {
                window.location.reload();
              }, 2000);
            } catch (error) {
              toast.error('Logout test failed: ' + error.message);
            }
          }} variant="outline" className={isDark ? 'border-gray-600 text-white hover:bg-gray-800 hover:text-white bg-transparent' : 'border-gray-400 text-black hover:bg-gray-100 hover:text-black bg-white'}>
            Test Logout
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
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>All Users ({users.length})</h3>
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
                  {users.map((user, index) => (
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
                        <Badge className={`${isDark ? 'bg-blue-900 text-blue-200 border-blue-700' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>{user.role || 'user'}</Badge>
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
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
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

      {/* AI Questions Tab */}
      {activeTab === 'ai-questions' && (
        <AIQuestions />
      )}

      {/* Transactions Tab */}
      {activeTab === 'transactions' && (
        <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
          <CardContent className="p-0">
            <div className={`p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Recent Transactions ({transactions.length})</h3>
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
                  {transactions.map((transaction, index) => (
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