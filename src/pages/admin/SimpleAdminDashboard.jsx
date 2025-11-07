import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Users, DollarSign, Activity, CheckCircle } from 'lucide-react';
import simpleWalletService from '../../services/simpleWallet.service';
import { testSupabaseConnection } from '../../utils/testSupabaseConnection';
import DebugPanel from '../../components/DebugPanel';
import toast from 'react-hot-toast';

const SimpleAdminDashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTransactions();
    
    // Auto-refresh every 5 seconds for better real-time feel
    const interval = setInterval(loadTransactions, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadTransactions = async () => {
    try {
      const result = await simpleWalletService.getAllTransactions();
      if (result.success) {
        setTransactions(result.transactions);
      }
    } catch (error) {
      console.error('Failed to load transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTestUser = async () => {
    toast.loading('Creating test user...');
    const testEmail = `testuser${Date.now()}@example.com`;
    
    try {
      const result = await simpleWalletService.createRealUser(testEmail);
      if (result.success) {
        // Update localStorage with real user
        const userData = {
          id: result.user.id,
          email: testEmail,
          user_metadata: { full_name: 'Test User' },
          email_confirmed_at: new Date().toISOString()
        };
        localStorage.setItem('confirmedUser', JSON.stringify(userData));
        toast.success('Test user created and logged in!');
      } else {
        toast.error('Failed to create user: ' + result.error);
      }
    } catch (error) {
      toast.error('Error: ' + error.message);
    }
  };

  const createTestTransaction = async () => {
    toast.loading('Creating test transaction...');
    const currentUser = JSON.parse(localStorage.getItem('confirmedUser') || '{}');
    
    if (!currentUser.email) {
      toast.error('No user logged in');
      return;
    }
    
    try {
      const result = await simpleWalletService.addTransaction(
        currentUser.email,
        Math.floor(Math.random() * 1000) + 100,
        'Test Transaction',
        'credit'
      );
      
      if (result.success) {
        toast.success('Transaction created!');
        loadTransactions();
      } else {
        toast.error('Failed: ' + result.error);
      }
    } catch (error) {
      toast.error('Error: ' + error.message);
    }
  };

  const testConnection = async () => {
    toast.loading('Testing Supabase connection...');
    try {
      const result = await testSupabaseConnection();
      if (result.success) {
        toast.success(`Connection successful! Found ${result.totalTransactions} transactions`);
        loadTransactions();
      } else {
        toast.error('Connection failed: ' + result.error);
      }
    } catch (error) {
      toast.error('Test failed: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-32 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Simple Admin Dashboard</h1>
        <div className="flex gap-2">
          <Button onClick={loadTransactions} variant="outline">
            Refresh
          </Button>
          <Button onClick={createTestUser} variant="outline">
            Create Test User
          </Button>
          <Button onClick={createTestTransaction} variant="outline">
            Test Transaction
          </Button>
          <Button onClick={testConnection} variant="outline">
            Test Supabase
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Transactions</p>
                <p className="text-2xl font-bold">{transactions.length}</p>
              </div>
              <Activity className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="text-2xl font-bold">
                  ₦{transactions.reduce((sum, t) => sum + (t.amount || 0), 0).toLocaleString()}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Unique Users</p>
                <p className="text-2xl font-bold">
                  {new Set(transactions.map(t => t.user_email)).size}
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Latest Transaction Alert */}
      {transactions.length > 0 && (
        <Card className="bg-green-50 dark:bg-green-900/20 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-green-800 dark:text-green-200">Latest Transaction</h3>
                <p className="text-sm text-green-600 dark:text-green-300">
                  {transactions[0]?.description} - ₦{transactions[0]?.amount?.toLocaleString()} 
                  from {transactions[0]?.user_email}
                </p>
              </div>
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Debug Panel */}
      <DebugPanel />

      {/* Transactions Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-4">User Email</th>
                  <th className="text-left p-4">Description</th>
                  <th className="text-left p-4">Amount</th>
                  <th className="text-left p-4">Type</th>
                  <th className="text-left p-4">Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.slice(0, 20).map((transaction, index) => (
                  <tr key={transaction.id || index} className="border-b">
                    <td className="p-4">
                      <span className="font-medium">{transaction.user_email}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm">{transaction.description}</span>
                    </td>
                    <td className="p-4">
                      <span className="font-medium">₦{transaction.amount?.toLocaleString()}</span>
                    </td>
                    <td className="p-4">
                      <Badge variant={transaction.type === 'credit' ? 'default' : 'secondary'}>
                        {transaction.type}
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
  );
};

export default SimpleAdminDashboard;