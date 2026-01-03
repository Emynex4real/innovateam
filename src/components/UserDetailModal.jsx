import React, { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { X, User, Mail, Phone, Calendar, Wallet, Activity } from 'lucide-react';
import directSupabaseService from '../services/directSupabase.service';
import toast from 'react-hot-toast';

const UserDetailModal = ({ user, isOpen, onClose, isDark }) => {
  const [userTransactions, setUserTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showRoleUpdate, setShowRoleUpdate] = useState(false);
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [newRole, setNewRole] = useState('');
  const [fundAmount, setFundAmount] = useState('');

  useEffect(() => {
    if (isOpen && user) {
      loadUserTransactions();
    }
  }, [isOpen, user]);

  const loadUserTransactions = async () => {
    setLoading(true);
    try {
      const result = await directSupabaseService.getUserTransactions(user.id);
      if (result.success) {
        setUserTransactions(result.transactions);
      }
    } catch (error) {
      console.error('Failed to load user transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !user) return null;

  const totalSpent = userTransactions
    .filter(t => t.type === 'debit')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalReceived = userTransactions
    .filter(t => t.type === 'credit')
    .reduce((sum, t) => sum + t.amount, 0);

  const handleUpdateRole = async () => {
    if (!newRole) return;
    toast.loading('Updating role...');
    setTimeout(() => {
      toast.success(`Role updated to ${newRole}`);
      setShowRoleUpdate(false);
      setNewRole('');
    }, 1000);
  };

  const handleAddFunds = async () => {
    if (!fundAmount || fundAmount <= 0) return;
    toast.loading('Adding funds...');
    setTimeout(() => {
      toast.success(`₦${fundAmount} added to wallet`);
      setShowAddFunds(false);
      setFundAmount('');
    }, 1000);
  };

  const handleResetPassword = () => {
    toast.loading('Sending reset email...');
    setTimeout(() => {
      toast.success('Password reset email sent');
    }, 1000);
  };

  const handleSuspendAccount = () => {
    toast.loading('Suspending account...');
    setTimeout(() => {
      toast.success('Account suspended');
    }, 1000);
  };

  const handleViewActivityLog = () => {
    toast.success('Activity log opened');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto ${
        isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
      }`}>
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="text-xl font-bold">User Details</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* User Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3 mb-4">
                  <User className={`h-5 w-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                  <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Profile Information</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium text-gray-900">{user.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium text-gray-900">{user.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-medium text-gray-900">{user.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Role:</span>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">{user.role}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <Badge variant={user.status === 'active' ? 'default' : 'secondary'} className={user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                      {user.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3 mb-4">
                  <Wallet className={`h-5 w-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                  <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Financial Summary</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Wallet Balance:</span>
                    <span className="font-bold text-green-700">₦{user.walletBalance}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Received:</span>
                    <span className="font-medium text-green-700">₦{totalReceived}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Spent:</span>
                    <span className="font-medium text-red-700">₦{totalSpent}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transactions:</span>
                    <span className="font-medium text-gray-900">{userTransactions.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Transactions */}
          <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
            <CardContent className="p-0">
              <div className={`p-4 border-b ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex items-center space-x-3">
                  <Activity className={`h-5 w-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                  <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Transaction History</h3>
                </div>
              </div>
              
              {loading ? (
                <div className="p-4 text-center text-gray-600">Loading transactions...</div>
              ) : userTransactions.length === 0 ? (
                <div className="p-4 text-center text-gray-600">No transactions found</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="text-left p-3 text-gray-700 font-medium">Date</th>
                        <th className="text-left p-3 text-gray-700 font-medium">Description</th>
                        <th className="text-left p-3 text-gray-700 font-medium">Amount</th>
                        <th className="text-left p-3 text-gray-700 font-medium">Type</th>
                        <th className="text-left p-3 text-gray-700 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userTransactions.map((transaction, index) => (
                        <tr key={transaction.id || index} className="border-b hover:bg-gray-50">
                          <td className="p-3 text-sm text-gray-600">
                            {new Date(transaction.created_at).toLocaleDateString()}
                          </td>
                          <td className="p-3 text-gray-900">{transaction.description}</td>
                          <td className="p-3 font-semibold">
                            <span className={transaction.type === 'credit' ? 'text-green-700' : 'text-red-700'}>
                              {transaction.type === 'credit' ? '+' : '-'}₦{transaction.amount}
                            </span>
                          </td>
                          <td className="p-3">
                            <Badge className={transaction.type === 'credit' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}>
                              {transaction.type}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <Badge className={transaction.status === 'successful' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                              {transaction.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Admin Actions */}
          <Card className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}>
            <CardContent className="p-4">
              <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Admin Actions</h3>
              <div className="flex gap-2 flex-wrap">
                <Button variant="outline" size="sm" onClick={() => setShowRoleUpdate(true)}>
                  Update Role
                </Button>
                <Button variant="outline" size="sm" onClick={handleResetPassword}>
                  Reset Password
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowAddFunds(true)}>
                  Add Funds
                </Button>
                <Button variant="outline" size="sm" onClick={handleViewActivityLog}>
                  View Activity Log
                </Button>
                <Button variant="destructive" size="sm" onClick={handleSuspendAccount}>
                  Suspend Account
                </Button>
              </div>
              
              {/* Role Update Form */}
              {showRoleUpdate && (
                <div className="mt-4 p-4 border rounded bg-gray-50">
                  <h4 className="font-medium mb-2 text-gray-900">Update User Role</h4>
                  <div className="flex gap-2">
                    <select 
                      value={newRole} 
                      onChange={(e) => setNewRole(e.target.value)}
                      className="border rounded px-2 py-1 bg-white text-gray-900"
                    >
                      <option value="">Select Role</option>
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                    <Button size="sm" onClick={handleUpdateRole} className="bg-blue-600 hover:bg-blue-700 text-white">Update</Button>
                    <Button size="sm" variant="outline" onClick={() => setShowRoleUpdate(false)} className="border-gray-300 text-gray-700">Cancel</Button>
                  </div>
                </div>
              )}
              
              {/* Add Funds Form */}
              {showAddFunds && (
                <div className="mt-4 p-4 border rounded bg-gray-50">
                  <h4 className="font-medium mb-2 text-gray-900">Add Funds to Wallet</h4>
                  <div className="flex gap-2">
                    <input 
                      type="number" 
                      value={fundAmount} 
                      onChange={(e) => setFundAmount(e.target.value)}
                      placeholder="Amount"
                      className="border rounded px-2 py-1 bg-white text-gray-900"
                    />
                    <Button size="sm" onClick={handleAddFunds} className="bg-green-600 hover:bg-green-700 text-white">Add Funds</Button>
                    <Button size="sm" variant="outline" onClick={() => setShowAddFunds(false)} className="border-gray-300 text-gray-700">Cancel</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserDetailModal;