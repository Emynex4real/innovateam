import React, { useState, useEffect } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { toast } from 'react-toastify';
import {
  WalletIcon,
  PlusIcon,
  MinusIcon,
  CreditCardIcon,
  BanknotesIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

const WalletPage = () => {
  const { walletBalance, transactions, loading, fetchWalletData, fundWallet } = useWallet();
  const [showFundModal, setShowFundModal] = useState(false);
  const [fundAmount, setFundAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [funding, setFunding] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchWalletData();
  }, []);

  const handleFundWallet = async (e) => {
    e.preventDefault();
    if (!fundAmount || parseFloat(fundAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setFunding(true);
    try {
      await fundWallet(parseFloat(fundAmount), paymentMethod);
      toast.success('Wallet funded successfully!');
      setShowFundModal(false);
      setFundAmount('');
      fetchWalletData();
    } catch (error) {
      toast.error('Failed to fund wallet');
    } finally {
      setFunding(false);
    }
  };

  const filteredTransactions = transactions.filter(tx => {
    if (filter === 'all') return true;
    if (filter === 'credit') return tx.type === 'credit';
    if (filter === 'debit') return tx.type === 'debit';
    return tx.status === filter;
  });

  const getTransactionIcon = (type, status) => {
    if (status === 'pending') return <ClockIcon className="h-5 w-5 text-yellow-500" />;
    if (status === 'failed') return <XCircleIcon className="h-5 w-5 text-red-500" />;
    if (type === 'credit') return <ArrowUpIcon className="h-5 w-5 text-green-500" />;
    return <ArrowDownIcon className="h-5 w-5 text-red-500" />;
  };

  const getStatusBadge = (status) => {
    const classes = {
      completed: 'bg-green-100 text-green-800 border-green-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      failed: 'bg-red-100 text-red-800 border-red-200'
    };
    return classes[status] || classes.completed;
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Wallet</h1>
        <p className="text-gray-600 mt-2">Manage your funds and view transaction history</p>
      </div>

      {/* Wallet Balance Card */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-2xl p-8 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center mb-2">
                <WalletIcon className="h-8 w-8 mr-3" />
                <span className="text-xl font-semibold">Current Balance</span>
              </div>
              <div className="text-5xl font-bold mb-2">
                ₦{loading ? '...' : walletBalance.toLocaleString()}
              </div>
              <p className="text-blue-100">Available for services and transactions</p>
            </div>
            <div className="mt-6 sm:mt-0 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowFundModal(true)}
                className="bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-colors inline-flex items-center justify-center"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Fund Wallet
              </button>
              <button
                onClick={fetchWalletData}
                className="bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-400 transition-colors inline-flex items-center justify-center"
              >
                <ArrowPathIcon className="h-5 w-5 mr-2" />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Funded</p>
              <p className="text-2xl font-bold text-green-600">
                ₦{transactions.filter(t => t.type === 'credit' && t.status === 'completed')
                  .reduce((sum, t) => sum + parseFloat(t.amount), 0).toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <ArrowUpIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Spent</p>
              <p className="text-2xl font-bold text-red-600">
                ₦{transactions.filter(t => t.type === 'debit' && t.status === 'completed')
                  .reduce((sum, t) => sum + parseFloat(t.amount), 0).toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <ArrowDownIcon className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Transactions</p>
              <p className="text-2xl font-bold text-blue-600">{transactions.length}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <CreditCardIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Transaction History</h2>
          <div className="flex items-center space-x-3">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Transactions</option>
              <option value="credit">Credits</option>
              <option value="debit">Debits</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <WalletIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
              <p className="text-gray-500">Your transaction history will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      {getTransactionIcon(transaction.type, transaction.status)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{transaction.description}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(transaction.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-semibold ${
                      transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'credit' ? '+' : '-'}₦{parseFloat(transaction.amount).toLocaleString()}
                    </p>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusBadge(transaction.status)}`}>
                      {transaction.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Fund Wallet Modal */}
      {showFundModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Fund Your Wallet</h3>
            </div>
            <form onSubmit={handleFundWallet} className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (₦)
                </label>
                <input
                  type="number"
                  value={fundAmount}
                  onChange={(e) => setFundAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="card">Debit/Credit Card</option>
                  <option value="bank">Bank Transfer</option>
                  <option value="ussd">USSD</option>
                </select>
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowFundModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={funding}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {funding ? 'Processing...' : 'Fund Wallet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletPage;