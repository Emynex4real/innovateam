import React, { useState, useEffect } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { useDarkMode } from '../contexts/DarkModeContext';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  CalendarDaysIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline';

const ModernTransactions = () => {
  const { transactions, loading, fetchWalletData } = useWallet();
  const { isDarkMode } = useDarkMode();
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    fetchWalletData();
  }, []);

  useEffect(() => {
    let filtered = transactions;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(transaction =>
        transaction.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(transaction => transaction.status === statusFilter);
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(transaction => transaction.type === typeFilter);
    }

    setFilteredTransactions(filtered);
  }, [transactions, searchTerm, statusFilter, typeFilter]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-yellow-600" />;
      case 'failed':
        return <XCircleIcon className="h-5 w-5 text-red-600" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTotalAmount = () => {
    return filteredTransactions.reduce((sum, transaction) => {
      return transaction.type === 'credit' 
        ? sum + parseFloat(transaction.amount)
        : sum - parseFloat(transaction.amount);
    }, 0);
  };

  const getTransactionStats = () => {
    const completed = filteredTransactions.filter(t => t.status === 'completed');
    const pending = filteredTransactions.filter(t => t.status === 'pending');
    const credits = filteredTransactions.filter(t => t.type === 'credit');
    const debits = filteredTransactions.filter(t => t.type === 'debit');

    return {
      total: filteredTransactions.length,
      completed: completed.length,
      pending: pending.length,
      credits: credits.length,
      debits: debits.length,
      totalCredits: credits.reduce((sum, t) => sum + parseFloat(t.amount), 0),
      totalDebits: debits.reduce((sum, t) => sum + parseFloat(t.amount), 0)
    };
  };

  const stats = getTransactionStats();

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Transaction History</h1>
          <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mt-1`}>View and manage your transaction history</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BanknotesIcon className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                <p className="text-xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <ArrowUpIcon className="h-5 w-5 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Credits</p>
                <p className="text-xl font-bold text-green-600">₦{stats.totalCredits.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <ArrowDownIcon className="h-5 w-5 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Debits</p>
                <p className="text-xl font-bold text-red-600">₦{stats.totalDebits.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CheckCircleIcon className="h-5 w-5 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-xl font-bold text-gray-900">{stats.completed}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            {/* Type Filter */}
            <div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="credit">Credits</option>
                <option value="debit">Debits</option>
              </select>
            </div>
          </div>
        </div>

        {/* Transactions List */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Transactions ({filteredTransactions.length})
              </h3>
              <div className="flex items-center text-sm text-gray-600">
                <FunnelIcon className="h-4 w-4 mr-1" />
                Filtered Results
              </div>
            </div>
          </div>
          
          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="text-center py-12">
                <BanknotesIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h4>
                <p className="text-gray-500">
                  {transactions.length === 0 
                    ? "You haven't made any transactions yet" 
                    : "Try adjusting your search or filter criteria"
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-lg ${
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
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <CalendarDaysIcon className="h-4 w-4 mr-1" />
                          {new Date(transaction.createdAt).toLocaleDateString()} at{' '}
                          {new Date(transaction.createdAt).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex items-center space-x-4">
                      <div>
                        <p className={`text-lg font-semibold ${
                          transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'credit' ? '+' : '-'}₦{parseFloat(transaction.amount).toLocaleString()}
                        </p>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(transaction.status)}`}>
                          {transaction.status}
                        </span>
                      </div>
                      {getStatusIcon(transaction.status)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernTransactions;