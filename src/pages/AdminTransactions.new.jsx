import React, { useEffect, useState, useCallback } from 'react';
import { useAdmin } from '../contexts/AdminContext';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import Spinner from '../components/Spinner';

const AdminTransactions = () => {
  const { transactions, isLoading, error: contextError, fetchTransactions } = useAdmin();
  const [localError, setLocalError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Fetch transactions on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchTransactions();
      } catch (error) {
        setLocalError(error.message || 'Failed to load transactions');
        toast.error('Failed to load transactions');
      }
    };
    
    loadData();
  }, [fetchTransactions]);

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchTransactions();
      toast.success('Transactions refreshed');
    } catch (error) {
      setLocalError(error.message || 'Failed to refresh transactions');
      toast.error('Failed to refresh transactions');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Filter transactions
  const filtered = React.useMemo(() => {
    if (!transactions) return [];
    
    return transactions.filter(tx => {
      const matchesSearch = 
        tx.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || tx.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [transactions, searchTerm, statusFilter]);

  // Loading state
  if (isLoading && !isRefreshing && (!transactions || transactions.length === 0)) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white shadow rounded-lg p-6 flex items-center justify-center h-64">
            <Spinner className="w-12 h-12 mx-auto text-indigo-600" />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if ((localError || contextError) && (!transactions || transactions.length === 0)) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading transactions</h3>
              <button
                onClick={handleRefresh}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        <div className="bg-white shadow rounded-lg p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="block w-full pl-3 pr-10 py-2 border-gray-300 rounded-md"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filtered.length > 0 ? (
                  filtered.map((tx) => (
                    <tr key={tx.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {tx.id?.substring(0, 8)}...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{tx.user?.name || 'N/A'}</div>
                        <div className="text-sm text-gray-500">{tx.user?.email || ''}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${parseFloat(tx.amount || 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          tx.status === 'completed' ? 'bg-green-100 text-green-800' :
                          tx.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {tx.status || 'unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                      No transactions found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminTransactions;
