import React, { useEffect, useState } from 'react';
import { useAdmin } from '../contexts/AdminContext';
import adminService from '../services/admin.service';
import { toast } from 'react-toastify';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  BanknotesIcon,
  CreditCardIcon,
  UserIcon
} from '@heroicons/react/24/outline';

const ModernAdminTransactions = () => {
  const { isAdmin, isAdminResolved } = useAdmin();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [modalTx, setModalTx] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editTx, setEditTx] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isStatusUpdating, setIsStatusUpdating] = useState(false);
  const [selectedTransactions, setSelectedTransactions] = useState([]);

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

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedTransactions = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const stats = {
    total: filtered.length,
    completed: filtered.filter(tx => tx.status === 'completed').length,
    pending: filtered.filter(tx => tx.status === 'pending').length,
    failed: filtered.filter(tx => tx.status === 'failed').length,
    totalAmount: filtered
      .filter(tx => tx.status === 'completed')
      .reduce((sum, tx) => sum + (parseFloat(tx.amount) || 0), 0)
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'failed':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'purchase':
        return <CreditCardIcon className="h-4 w-4" />;
      case 'refund':
        return <BanknotesIcon className="h-4 w-4" />;
      default:
        return <CreditCardIcon className="h-4 w-4" />;
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

  const handleBulkAction = async (action) => {
    if (selectedTransactions.length === 0) {
      toast.warning('Please select transactions first');
      return;
    }

    try {
      for (const txId of selectedTransactions) {
        if (action === 'approve') {
          await adminService.updateTransaction(txId, { status: 'completed' });
        } else if (action === 'reject') {
          await adminService.updateTransaction(txId, { status: 'failed' });
        }
      }
      toast.success(`${selectedTransactions.length} transactions ${action}d successfully`);
      setSelectedTransactions([]);
      fetchTransactions();
    } catch (error) {
      toast.error(`Failed to ${action} transactions`);
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
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Transaction Management</h1>
        <p className="text-gray-600 mt-2">Monitor and manage all platform transactions</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Transactions</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <CreditCardIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <ClockIcon className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-3xl font-bold text-purple-600">₦{stats.totalAmount.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <BanknotesIcon className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)} 
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
            
            <select 
              value={typeFilter} 
              onChange={(e) => setTypeFilter(e.target.value)} 
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="purchase">Purchase</option>
              <option value="refund">Refund</option>
            </select>
          </div>

          <div className="flex gap-3">
            {selectedTransactions.length > 0 && (
              <>
                <button 
                  onClick={() => handleBulkAction('approve')}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Approve Selected
                </button>
                <button 
                  onClick={() => handleBulkAction('reject')}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Reject Selected
                </button>
              </>
            )}
            <button 
              onClick={exportToCSV}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTransactions(paginatedTransactions.map(tx => tx.id));
                          } else {
                            setSelectedTransactions([]);
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
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
                  {paginatedTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                        <div className="flex flex-col items-center">
                          <CreditCardIcon className="h-12 w-12 text-gray-300 mb-4" />
                          <span>No transactions found</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedTransactions.includes(tx.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedTransactions([...selectedTransactions, tx.id]);
                              } else {
                                setSelectedTransactions(selectedTransactions.filter(id => id !== tx.id));
                              }
                            }}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                              {(tx.user?.name || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {tx.user?.name || 'Unknown User'}
                              </div>
                              <div className="text-sm text-gray-500">{tx.user?.email || 'N/A'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            ₦{parseFloat(tx.amount || 0).toLocaleString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getTypeIcon(tx.type)}
                            <span className="ml-2 text-sm text-gray-900 capitalize">{tx.type || 'N/A'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadgeClass(tx.status)}`}>
                            {getStatusIcon(tx.status)}
                            <span className="ml-1 capitalize">{tx.status || 'N/A'}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(tx.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                setModalTx(tx);
                                setEditTx({ ...tx });
                                setEditMode(false);
                                setShowModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </button>
                            <button className="text-green-600 hover:text-green-900 p-1 rounded">
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button className="text-red-600 hover:text-red-900 p-1 rounded">
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                        <span className="font-medium">
                          {Math.min(currentPage * itemsPerPage, filtered.length)}
                        </span>{' '}
                        of <span className="font-medium">{filtered.length}</span> results
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                        <button
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        >
                          <ChevronLeftIcon className="h-5 w-5" />
                        </button>
                        {[...Array(totalPages)].map((_, i) => (
                          <button
                            key={i + 1}
                            onClick={() => setCurrentPage(i + 1)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              currentPage === i + 1
                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {i + 1}
                          </button>
                        ))}
                        <button
                          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage === totalPages}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        >
                          <ChevronRightIcon className="h-5 w-5" />
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ModernAdminTransactions;