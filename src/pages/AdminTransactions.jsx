import React, { useEffect, useState } from 'react';
import { useAdmin } from '../contexts/AdminContext';
import adminService from '../services/admin.service';
import { toast } from 'react-toastify';

const AdminTransactions = () => {
  const { isAdmin, isAdminResolved } = useAdmin();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalTx, setModalTx] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editTx, setEditTx] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isStatusUpdating, setIsStatusUpdating] = useState(false);

  useEffect(() => {
    if (isAdminResolved && isAdmin) {
      fetchTransactions();
    }
  }, [isAdminResolved, isAdmin]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminService.getTransactions();
      const transactionsData = Array.isArray(response) ? response : [];
      setTransactions(transactionsData);
    } catch (err) {
      setError(err.message || 'Failed to fetch transactions');
      toast.error('Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  const filtered = transactions.filter(tx => {
    const matchesSearch = !search || 
      tx.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      tx.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
      tx.type?.toLowerCase().includes(search.toLowerCase()) ||
      tx.description?.toLowerCase().includes(search.toLowerCase());
      
    const matchesStatus = !statusFilter || tx.status === statusFilter;
    const matchesType = !typeFilter || tx.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const totalAmount = filtered
    .filter(tx => tx.status === 'completed')
    .reduce((sum, tx) => sum + (parseFloat(tx.amount) || 0), 0);

  const openModal = (tx) => {
    setModalTx(tx);
    setEditTx({ ...tx });
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

  const handleEditChange = (e) => {
    setEditTx({ ...editTx, [e.target.name]: e.target.value });
  };

  const handleEditSave = async () => {
    try {
      await adminService.updateTransaction(editTx.id, editTx);
      toast.success('Transaction updated');
      fetchTransactions();
      setEditMode(false);
      setModalTx({ ...editTx });
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

  const exportToCSV = () => {
    const csvRows = [
      ['ID', 'User', 'Email', 'Amount', 'Type', 'Status', 'Date', 'Description'],
      ...filtered.map(t => [
        t.id || '',
        t.user?.name || 'N/A',
        t.user?.email || 'N/A',
        t.amount || '0',
        t.type || 'N/A',
        t.status || 'N/A',
        new Date(t.createdAt).toLocaleDateString(),
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
    
    toast.success('Transactions exported successfully');
  };

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

  const getTypeBadgeClass = (type) => {
    switch (type?.toLowerCase()) {
      case 'purchase':
        return 'bg-blue-100 text-blue-800';
      case 'refund':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isAdminResolved) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p>You don't have admin privileges.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Transactions Management</h1>
          <p className="text-gray-600">Monitor and manage all transactions</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Transactions</h3>
            <p className="text-3xl font-bold text-blue-600">{filtered.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Completed</h3>
            <p className="text-3xl font-bold text-green-600">
              {filtered.filter(t => t.status === 'completed').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Pending</h3>
            <p className="text-3xl font-bold text-yellow-600">
              {filtered.filter(t => t.status === 'pending').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
            <p className="text-3xl font-bold text-purple-600">₦{totalAmount.toLocaleString()}</p>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-wrap gap-4 mb-4">
            <input
              type="text"
              placeholder="Search by user, email, type, or description"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 min-w-64 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)} 
              className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
            <select 
              value={typeFilter} 
              onChange={(e) => setTypeFilter(e.target.value)} 
              className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="purchase">Purchase</option>
              <option value="refund">Refund</option>
            </select>
          </div>

          <div className="flex flex-wrap gap-2">
            <button 
              onClick={exportToCSV}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Export CSV
            </button>
            <button 
              onClick={fetchTransactions}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
            <button 
              onClick={fetchTransactions}
              className="mt-2 text-red-600 underline hover:no-underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* Transactions Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Transactions ({filtered.length})
            </h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                        <div className="flex flex-col items-center">
                          <span className="text-5xl mb-4">💸</span>
                          <span>No transactions found</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((tx) => (
                      <tr key={tx.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {tx.user?.name || 'Unknown User'}
                            </div>
                            <div className="text-sm text-gray-500">{tx.user?.email || 'N/A'}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            ₦{parseFloat(tx.amount || 0).toLocaleString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeBadgeClass(tx.type)}`}>
                            {tx.type || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(tx.status)}`}>
                            {tx.status || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(tx.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => openModal(tx)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Transaction Modal */}
        {showModal && modalTx && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-96 overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Transaction Details</h3>
                  <button 
                    onClick={closeModal}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <span className="sr-only">Close</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="px-6 py-4">
                {editMode ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Amount</label>
                      <input 
                        name="amount" 
                        type="number"
                        value={editTx.amount || ''} 
                        onChange={handleEditChange} 
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Type</label>
                      <select 
                        name="type" 
                        value={editTx.type || ''} 
                        onChange={handleEditChange} 
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="purchase">Purchase</option>
                        <option value="refund">Refund</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <select 
                        name="status" 
                        value={editTx.status || ''} 
                        onChange={handleEditChange} 
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                        <option value="failed">Failed</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Description</label>
                      <textarea 
                        name="description" 
                        value={editTx.description || ''} 
                        onChange={handleEditChange} 
                        rows={3}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Transaction ID:</span>
                      <p className="text-sm text-gray-900">{modalTx.id}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">User:</span>
                      <p className="text-sm text-gray-900">{modalTx.user?.name || 'Unknown User'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Email:</span>
                      <p className="text-sm text-gray-900">{modalTx.user?.email || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Amount:</span>
                      <p className="text-sm text-gray-900">₦{parseFloat(modalTx.amount || 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Type:</span>
                      <p className="text-sm text-gray-900">{modalTx.type || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Status:</span>
                      <p className="text-sm text-gray-900">{modalTx.status || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Date:</span>
                      <p className="text-sm text-gray-900">
                        {new Date(modalTx.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Description:</span>
                      <p className="text-sm text-gray-900">{modalTx.description || 'No description'}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="px-6 py-4 border-t border-gray-200">
                {editMode ? (
                  <div className="flex justify-end space-x-3">
                    <button 
                      onClick={() => setEditMode(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleEditSave}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Save Changes
                    </button>
                  </div>
                ) : (
                  <div className="flex justify-between">
                    <div className="space-x-3">
                      {modalTx.status === 'pending' && (
                        <>
                          <button 
                            onClick={handleApprove}
                            disabled={isStatusUpdating}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                          >
                            {isStatusUpdating ? 'Approving...' : 'Approve'}
                          </button>
                          <button 
                            onClick={handleReject}
                            disabled={isStatusUpdating}
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                          >
                            {isStatusUpdating ? 'Rejecting...' : 'Reject'}
                          </button>
                        </>
                      )}
                      <button 
                        onClick={handleEdit}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => setConfirmDelete(true)}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                    <button 
                      onClick={closeModal}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Close
                    </button>
                  </div>
                )}

                {confirmDelete && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-red-700 mb-3">
                      Are you sure you want to delete this transaction? This action cannot be undone.
                    </p>
                    <div className="flex space-x-3">
                      <button 
                        onClick={handleDelete}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                      >
                        Yes, Delete
                      </button>
                      <button 
                        onClick={() => setConfirmDelete(false)}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminTransactions;