import React, { useEffect, useState } from 'react';
import { useAdmin } from '../contexts/AdminContext';
import adminService from '../services/admin.service';
import { toast } from 'react-toastify';
import Spinner from '../components/Spinner';

console.log('AdminTransactions loaded, adminService:', adminService);

const AdminTransactions = () => {
  console.log('AdminTransactions FUNCTION BODY running');
  const {
    transactions,
    fetchTransactions,
    isLoading,
    error
  } = useAdmin();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalTx, setModalTx] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editTx, setEditTx] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    console.log('[AdminTransactions] useEffect running, calling fetchTransactions');
    fetchTransactions();
    // eslint-disable-next-line
  }, []);

  const filtered = transactions.filter(t =>
    (t.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      t.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
      t.type?.toLowerCase().includes(search.toLowerCase())) &&
    (statusFilter ? t.status === statusFilter : true) &&
    (typeFilter ? t.type === typeFilter : true)
  );

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
  const totalAmount = filtered.reduce((sum, t) => sum + Number(t.amount), 0);

  // Export to CSV
  const exportToCSV = () => {
    const csvRows = [
      ['User', 'Email', 'Amount', 'Type', 'Status', 'Date'],
      ...filtered.map(t => [
        t.user?.name,
        t.user?.email,
        t.amount,
        t.type,
        t.status,
        t.createdAt ? new Date(t.createdAt).toLocaleString() : ''
      ])
    ];
    const csvContent = csvRows.map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transactions.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  console.log('AdminTransactions RETURN about to render');
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Transactions</h2>
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
      {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-2">{error}</div>}
      {isLoading ? (
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
                <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded mr-2" onClick={handleEdit}>Edit</button>
                <button className="mt-4 bg-red-600 text-white px-4 py-2 rounded mr-2" onClick={() => setConfirmDelete(true)}>Delete</button>
                <button className="mt-4 bg-gray-400 text-white px-4 py-2 rounded" onClick={closeModal}>Close</button>
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