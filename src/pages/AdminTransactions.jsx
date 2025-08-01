import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useAdmin } from '../contexts/AdminContext';
import { useAuth } from '../contexts/AuthContext';
import adminService from '../services/admin.service';
import { toast } from 'react-toastify';
import Spinner from '../components/Spinner';

// Debug logging with more context
const debugLog = (message, data = {}) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[AdminTransactions] ${message}`, {
      timestamp: new Date().toISOString(),
      ...data
    });
  }
};

// Initial debug info
debugLog('Module loaded', {
  env: process.env.NODE_ENV,
  isDev: process.env.NODE_ENV === 'development'
});

const AdminTransactions = () => {
  // Always call hooks at the top level
  const { isAuthResolved } = useAuth();
  const { isAdminResolved, transactions = [], fetchTransactions, error: contextError } = useAdmin();
  
  console.log('[AdminTransactions] Component rendering');
  const { user, isAuthenticated } = useAuth();
  console.log('[AdminTransactions] Auth state:', { user, isAuthenticated });
  
  console.log('[AdminTransactions] Admin context:', { 
    transactionCount: transactions.length,
    contextError 
  });
  
  // State management
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalTx, setModalTx] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editTx, setEditTx] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  
  // Approve/Reject logic for pending transactions
  const [isStatusUpdating, setIsStatusUpdating] = useState(false);
  const handleApprove = async () => {
    setIsStatusUpdating(true);
    try {
      await adminService.updateTransaction(modalTx.id, { ...modalTx, status: 'completed' });
      toast.success('Transaction approved');
      fetchTransactions();
      setModalTx({ ...modalTx, status: 'completed' });
    } catch (err) {
      toast.error('Failed to approve transaction');
    } finally {
      setIsStatusUpdating(false);
    }
  };
  const handleReject = async () => {
    setIsStatusUpdating(true);
    try {
      await adminService.updateTransaction(modalTx.id, { ...modalTx, status: 'failed' });
      toast.success('Transaction rejected');
      fetchTransactions();
      setModalTx({ ...modalTx, status: 'failed' });
    } catch (err) {
      toast.error('Failed to reject transaction');
    } finally {
      setIsStatusUpdating(false);
    }
  };

  // Memoized filtered transactions
  const filtered = useMemo(() => {
    debugLog('Filtering transactions', {
      total: transactions.length,
      search,
      statusFilter,
      typeFilter
    });
    
    return transactions.filter(tx => {
      const matchesSearch = !search || 
        tx.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
        tx.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
        tx.type?.toLowerCase().includes(search.toLowerCase());
        
      const matchesStatus = !statusFilter || tx.status === statusFilter;
      const matchesType = !typeFilter || tx.type === typeFilter;
      
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [transactions, search, statusFilter, typeFilter]);

  // Calculate total amount for filtered transactions
  const totalAmount = useMemo(() => {
    return filtered.reduce((sum, tx) => sum + (parseFloat(tx.amount) || 0), 0).toFixed(2);
  }, [filtered]);

  // Debug logging - only in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      debugLog('Component rendered', {
        transactionsCount: transactions?.length,
        filteredCount: filtered?.length,
        contextError: Boolean(contextError)
      });
    }
  }, [transactions, filtered, contextError]);
  
  // Handle refresh
  const handleRefresh = useCallback(async () => {
    debugLog('Manual refresh triggered');
    setIsRefreshing(true);
    setLocalError(null);
    
    try {
      await fetchTransactions();
      toast.success('Transactions refreshed successfully');
    } catch (error) {
      const errorMessage = error.message || 'Failed to refresh transactions';
      setLocalError(errorMessage);
      toast.error(errorMessage);
      debugLog('Refresh error', { error });
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchTransactions]);

  // Fetch transactions on component mount
  useEffect(() => {
    if (!isAuthResolved || !isAdminResolved) return;
    // Only show spinner if no transactions yet
    if (transactions.length === 0) {
      setIsLoadingTransactions(true);
    }
    const loadData = async () => {
      try {
        await fetchTransactions();
      } catch (error) {
        setLocalError(error.message || 'Failed to load transactions');
      } finally {
        setIsLoadingTransactions(false);
      }
    };
    loadData();
    // If transactions already exist, don't block render
    // Optionally, you could trigger a subtle refresh indicator here
    // but do not set isLoadingTransactions to true if data is present
    // This prevents flicker
    // eslint-disable-next-line
  }, [isAuthResolved, isAdminResolved, fetchTransactions]);

  // Periodic auto-refresh (every 30 seconds)
  useEffect(() => {
    if (!isAuthResolved || !isAdminResolved) return;
    const interval = setInterval(() => {
      fetchTransactions();
    }, 30000); // 30 seconds
    return () => clearInterval(interval);
  }, [isAuthResolved, isAdminResolved, fetchTransactions]);

  // Log when transactions change
  useEffect(() => {
    console.log('[AdminTransactions] Transactions updated:', {
      count: transactions.length,
      sample: transactions[0] || 'No transactions'
    });
  }, [transactions]);
  
  // Log state changes
  useEffect(() => {
    if (transactions.length > 0) {
      debugLog('Transactions updated', { 
        count: transactions.length,
        firstId: transactions[0]?.id,
        lastId: transactions[transactions.length - 1]?.id
      });
    } else if (transactions.length === 0 && !isLoadingTransactions) {
      debugLog('No transactions available', { 
        hasError: Boolean(localError || contextError),
        error: localError || contextError
      });
    }
  }, [transactions, isLoadingTransactions, localError, contextError]);
  
  // Error handling effect
  useEffect(() => {
    if (contextError) {
      debugLog('Context error detected', { error: contextError });
      toast.error(`Error: ${contextError}`);
    }
  }, [contextError]);

  const openModal = (tx) => {
    setModalTx(tx);
    setEditTx(tx);
    setEditMode(false);
    setShowModal(true);
    setConfirmDelete(false);
  };
  const closeModal = () => {
    setModalTx(null);
    setEditTx(null);
    setEditMode(false);
    setShowModal(false);
    setConfirmDelete(false);
  };

  const handleEdit = () => setEditMode(true);
  const handleEditChange = e => setEditTx({ ...editTx, [e.target.name]: e.target.value });
  const handleEditSave = async () => {
    try {
      await adminService.updateTransaction(editTx.id, editTx);
      toast.success('Transaction updated');
      fetchTransactions();
      setEditMode(false);
    } catch (err) {
      toast.error('Failed to update transaction');
    }
  };
  const handleDelete = async () => {
    try {
      await adminService.deleteTransaction(modalTx.id);
      toast.success('Transaction deleted');
      fetchTransactions();
      closeModal();
    } catch (err) {
      toast.error('Failed to delete transaction');
    }
  };

  // Summary stats
  const transactionCount = filtered.length;
  const successTransactions = filtered.filter(t => t.status === 'completed').length;
  const successRate = transactionCount > 0 ? Math.round((successTransactions / transactionCount) * 100) : 0;

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString();
    } catch (e) {
      return 'Invalid Date';
    }
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
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

  // Export to CSV
  const exportToCSV = () => {
    try {
      const csvRows = [
        ['ID', 'User', 'Email', 'Amount', 'Type', 'Status', 'Date', 'Description'],
        ...filtered.map(t => [
          t.id || '',
          t.user?.name || 'N/A',
          t.user?.email || 'N/A',
          t.amount ? formatCurrency(t.amount) : '0.00',
          t.type || 'N/A',
          t.status || 'N/A',
          formatDate(t.createdAt),
          t.description || ''
        ])
      ];
      
      const csvContent = csvRows
        .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
        .join('\n');
        
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `transactions_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Export completed successfully');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export transactions');
    }
  };
  
  // Now, in the render, do the loading check
  if (!isAuthResolved || !isAdminResolved) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-700">Loading admin transactions...</p>
        </div>
      </div>
    );
  }

  if (isLoadingTransactions && transactions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
          </div>
          <div className="bg-white shadow rounded-lg p-6 flex items-center justify-center h-64">
            <div className="text-center">
              <Spinner className="w-12 h-12 mx-auto text-indigo-600" />
              <p className="mt-4 text-gray-600">Loading transactions...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render error state
  if ((localError || contextError) && transactions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <div className="text-center py-12">
              <div className="text-red-500 mb-4">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading transactions</h3>
              <p className="text-gray-500 mb-6">
                {localError || contextError || 'An unknown error occurred'}
              </p>
              <button
                onClick={handleRefresh}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }



  // Debug render log
  console.log('[AdminTransactions] Rendering component with state:', {
    transactionsCount: transactions.length,
    isLoadingTransactions,
    contextError,
    search,
    statusFilter,
    typeFilter
  });

  // Loading state
  if (isLoadingTransactions && transactions.length === 0) {
    console.log('[AdminTransactions] Rendering loading state');
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (contextError) {
    console.error('[AdminTransactions] Rendering error state:', contextError);
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{contextError}</span>
          <button 
            onClick={handleRefresh}
            className="ml-4 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // No transactions state
  if (transactions.length === 0) {
    console.log('[AdminTransactions] No transactions to display');
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="text-5xl mb-4">📭</div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">No transactions found</h3>
          <p className="text-gray-500 mb-6">There are no transactions to display at this time.</p>
          <button
            onClick={handleRefresh}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Transactions</h2>
        <div className="text-sm text-gray-500">
          Showing <span className="font-medium">{filtered.length}</span> of {transactions.length} transactions
        </div>
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        <input
          type="text"
          placeholder="Search by user, email, or type"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="p-2 border rounded w-full max-w-xs"
        />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="p-2 border rounded">
          <option value="">All Status</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="p-2 border rounded">
          <option value="">All Types</option>
          <option value="purchase">Purchase</option>
          <option value="refund">Refund</option>
        </select>
        <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={exportToCSV}>Export</button>
      </div>
      <div className="mb-2 text-sm text-gray-600">Total: <b>{filtered.length}</b> | Volume: <b>₦{totalAmount}</b></div>
      {contextError && <div className="bg-red-100 text-red-700 p-2 rounded mb-2">{contextError}</div>}
      {isLoadingTransactions ? (
        <Spinner size={40} className="my-8" />
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border rounded">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">User</th>
                <th className="py-2 px-4 border-b">Email</th>
                <th className="py-2 px-4 border-b">Amount</th>
                <th className="py-2 px-4 border-b">Type</th>
                <th className="py-2 px-4 border-b">Status</th>
                <th className="py-2 px-4 border-b">Date</th>
                <th className="py-2 px-4 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-400">
                    <div className="flex flex-col items-center">
                      <span className="text-5xl mb-2">💸</span>
                      <span>No transactions found.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map(tx => (
                  <tr key={tx._id || tx.id}>
                    <td className="py-2 px-4 border-b">{tx.user?.name || 'N/A'}</td>
                    <td className="py-2 px-4 border-b">{tx.user?.email || 'N/A'}</td>
                    <td className="py-2 px-4 border-b">₦{tx.amount}</td>
                    <td className="py-2 px-4 border-b">{tx.type}</td>
                    <td className="py-2 px-4 border-b">{tx.status}</td>
                    <td className="py-2 px-4 border-b">{new Date(tx.createdAt).toLocaleString()}</td>
                    <td className="py-2 px-4 border-b">
                      <button className="text-blue-600 hover:underline mr-2" onClick={() => openModal(tx)}>View</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
      {/* Transaction Modal */}
      {showModal && modalTx && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
            <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-800" onClick={closeModal}>&times;</button>
            <h3 className="text-lg font-semibold mb-2">Transaction Details</h3>
            {editMode ? (
              <>
                <div className="mb-2"><b>Amount:</b> <input name="amount" value={editTx.amount} onChange={handleEditChange} className="border p-1 rounded w-full" /></div>
                <div className="mb-2"><b>Type:</b> <input name="type" value={editTx.type} onChange={handleEditChange} className="border p-1 rounded w-full" /></div>
                <div className="mb-2"><b>Status:</b> <select name="status" value={editTx.status} onChange={handleEditChange} className="border p-1 rounded w-full"><option value="completed">Completed</option><option value="pending">Pending</option><option value="failed">Failed</option></select></div>
                <button className="mt-4 bg-green-600 text-white px-4 py-2 rounded mr-2" onClick={handleEditSave}>Save</button>
                <button className="mt-4 bg-gray-400 text-white px-4 py-2 rounded" onClick={() => setEditMode(false)}>Cancel</button>
              </>
            ) : (
              <>
                <div className="mb-2"><b>User:</b> {modalTx.user?.name}</div>
                <div className="mb-2"><b>Email:</b> {modalTx.user?.email}</div>
                <div className="mb-2"><b>Amount:</b> ₦{modalTx.amount}</div>
                <div className="mb-2"><b>Type:</b> {modalTx.type}</div>
                <div className="mb-2"><b>Status:</b> {modalTx.status}</div>
                <div className="mb-2"><b>Date:</b> {new Date(modalTx.createdAt).toLocaleString()}</div>
                {modalTx.status === 'pending' && (
                  <div className="flex gap-2 mt-4">
                    <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={handleApprove} disabled={isStatusUpdating}>
                      {isStatusUpdating ? 'Approving...' : 'Approve'}
                    </button>
                    <button className="bg-red-600 text-white px-4 py-2 rounded" onClick={handleReject} disabled={isStatusUpdating}>
                      {isStatusUpdating ? 'Rejecting...' : 'Reject'}
                    </button>
                  </div>
                )}
                <div className="flex gap-2 mt-4">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={handleEdit}>Edit</button>
                  <button className="bg-red-600 text-white px-4 py-2 rounded" onClick={() => setConfirmDelete(true)}>Delete</button>
                  <button className="bg-gray-400 text-white px-4 py-2 rounded" onClick={closeModal}>Close</button>
                </div>
                {confirmDelete && (
                  <div className="mt-4 p-2 bg-red-100 text-red-700 rounded">
                    Are you sure you want to delete this transaction?
                    <button className="ml-2 bg-red-600 text-white px-2 py-1 rounded" onClick={handleDelete}>Yes, Delete</button>
                    <button className="ml-2 bg-gray-400 text-white px-2 py-1 rounded" onClick={() => setConfirmDelete(false)}>Cancel</button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTransactions;