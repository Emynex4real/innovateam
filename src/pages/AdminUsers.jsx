import React, { useEffect, useState } from 'react';
import { useAdmin } from '../contexts/AdminContext';
import adminService from '../services/admin.service';
import { toast } from 'react-toastify';

const AdminUsers = () => {
  console.log('AdminUsers FUNCTION BODY running');
  const {
    users,
    fetchUsers,
    isLoading,
    error,
    setSelectedUser,
    selectedUser
  } = useAdmin();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalUser, setModalUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'user', status: 'active' });
  const [selectedIds, setSelectedIds] = useState([]);
  const [userTransactions, setUserTransactions] = useState([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [transactionsError, setTransactionsError] = useState(null);
  const [activeTab, setActiveTab] = useState('details');
  const allSelected = users.length > 0 && users.every(u => selectedIds.includes(u.id));

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line
  }, []);

  // Periodic auto-refresh (every 30 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchUsers();
    }, 30000); // 30 seconds
    return () => clearInterval(interval);
  }, [fetchUsers]);

  const filtered = users.filter(u =>
    (u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())) &&
    (roleFilter ? u.role === roleFilter : true) &&
    (statusFilter ? u.status === statusFilter : true)
  );

  const openModal = (user) => {
    setModalUser(user);
    setEditUser(user);
    setEditMode(false);
    setShowModal(true);
    setConfirmDelete(false);
  };
  const closeModal = () => {
    setModalUser(null);
    setEditUser(null);
    setEditMode(false);
    setShowModal(false);
    setConfirmDelete(false);
  };

  const handleEdit = () => setEditMode(true);
  const handleEditChange = e => setEditUser({ ...editUser, [e.target.name]: e.target.value });
  const handleEditSave = async () => {
    try {
      await adminService.updateUser(editUser.id, editUser);
      toast.success('User updated');
      fetchUsers();
      setEditMode(false);
    } catch (err) {
      toast.error('Failed to update user');
    }
  };
  const handleDelete = async () => {
    try {
      await adminService.deleteUser(modalUser.id);
      toast.success('User deleted');
      fetchUsers();
      closeModal();
    } catch (err) {
      toast.error('Failed to delete user');
    }
  };

  const openAddModal = () => {
    setNewUser({ name: '', email: '', role: 'user', status: 'active' });
    setShowAddModal(true);
  };
  const closeAddModal = () => setShowAddModal(false);
  const handleAddChange = e => setNewUser({ ...newUser, [e.target.name]: e.target.value });
  const handleAddUser = async () => {
    try {
      await adminService.addUser(newUser);
      toast.success('User added');
      fetchUsers();
      closeAddModal();
    } catch (err) {
      toast.error('Failed to add user');
    }
  };

  const toggleSelect = id => setSelectedIds(ids => ids.includes(id) ? ids.filter(i => i !== id) : [...ids, id]);
  const toggleSelectAll = () => setSelectedIds(allSelected ? [] : filtered.map(u => u.id));

  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedIds.length} users? This cannot be undone.`)) return;
    try {
      await Promise.all(selectedIds.map(id => adminService.deleteUser(id)));
      toast.success('Users deleted');
      fetchUsers();
      setSelectedIds([]);
    } catch (err) {
      toast.error('Failed to delete users');
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    const csvRows = [
      ['Name', 'Email', 'Role', 'Status'],
      ...filtered.map(u => [u.name, u.email, u.role, u.status])
    ];
    const csvContent = csvRows.map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'users.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Activate/Deactivate handlers
  const handleActivate = async () => {
    try {
      await adminService.activateUser(modalUser.id);
      toast.success('User activated');
      fetchUsers();
      setModalUser({ ...modalUser, status: 'active' });
    } catch (err) {
      toast.error('Failed to activate user');
    }
  };
  const handleDeactivate = async () => {
    try {
      await adminService.deactivateUser(modalUser.id);
      toast.success('User deactivated');
      fetchUsers();
      setModalUser({ ...modalUser, status: 'inactive' });
    } catch (err) {
      toast.error('Failed to deactivate user');
    }
  };

  console.log('AdminUsers RETURN about to render');
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Users</h2>
      <div className="flex flex-wrap gap-2 mb-4">
        <input
          type="text"
          placeholder="Search by name or email"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="p-2 border rounded w-full max-w-xs"
        />
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="p-2 border rounded">
          <option value="">All Roles</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="p-2 border rounded">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={openAddModal}>Add User</button>
        <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={exportToCSV}>Export</button>
        {selectedIds.length > 0 && (
          <button className="bg-red-600 text-white px-4 py-2 rounded" onClick={handleBulkDelete}>Delete Selected ({selectedIds.length})</button>
        )}
      </div>
      {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-2">{error}</div>}
      {isLoading ? (
        <div>Loading users...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border rounded">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b"><input type="checkbox" checked={allSelected} onChange={toggleSelectAll} /></th>
                <th className="py-2 px-4 border-b">Name</th>
                <th className="py-2 px-4 border-b">Email</th>
                <th className="py-2 px-4 border-b">Role</th>
                <th className="py-2 px-4 border-b">Status</th>
                <th className="py-2 px-4 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-4">No users found.</td></tr>
              ) : (
                filtered.map(user => (
                  <tr key={user._id || user.id}>
                    <td className="py-2 px-4 border-b"><input type="checkbox" checked={selectedIds.includes(user.id)} onChange={() => toggleSelect(user.id)} /></td>
                    <td className="py-2 px-4 border-b">{user.name}</td>
                    <td className="py-2 px-4 border-b">{user.email}</td>
                    <td className="py-2 px-4 border-b">{user.role || 'user'}</td>
                    <td className="py-2 px-4 border-b">{user.status || 'active'}</td>
                    <td className="py-2 px-4 border-b">
                      <button className="text-blue-600 hover:underline mr-2" onClick={() => openModal(user)}>View</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
      {/* User Modal */}
      {showModal && modalUser && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl relative">
            <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-800" onClick={closeModal}>&times;</button>
            <h3 className="text-lg font-semibold mb-2">User Details</h3>
            <div className="flex gap-4 mb-4">
              <button className={`px-3 py-1 rounded ${activeTab==='details' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`} onClick={()=>setActiveTab('details')}>Details</button>
              <button className={`px-3 py-1 rounded ${activeTab==='transactions' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`} onClick={()=>setActiveTab('transactions')}>Transactions</button>
            </div>
            {activeTab === 'details' && (
              editMode ? (
                <>
                  <div className="mb-2"><b>Name:</b> <input name="name" value={editUser.name} onChange={handleEditChange} className="border p-1 rounded w-full" /></div>
                  <div className="mb-2"><b>Email:</b> <input name="email" value={editUser.email} onChange={handleEditChange} className="border p-1 rounded w-full" /></div>
                  <div className="mb-2"><b>Role:</b> <select name="role" value={editUser.role} onChange={handleEditChange} className="border p-1 rounded w-full"><option value="user">User</option><option value="admin">Admin</option></select></div>
                  <div className="mb-2"><b>Status:</b> <select name="status" value={editUser.status} onChange={handleEditChange} className="border p-1 rounded w-full"><option value="active">Active</option><option value="inactive">Inactive</option></select></div>
                  <button className="mt-4 bg-green-600 text-white px-4 py-2 rounded mr-2" onClick={handleEditSave}>Save</button>
                  <button className="mt-4 bg-gray-400 text-white px-4 py-2 rounded" onClick={() => setEditMode(false)}>Cancel</button>
                </>
              ) : (
                <>
                  <div className="mb-2"><b>Name:</b> {modalUser.name}</div>
                  <div className="mb-2"><b>Email:</b> {modalUser.email}</div>
                  <div className="mb-2"><b>Role:</b> {modalUser.role}</div>
                  <div className="mb-2"><b>Status:</b> {modalUser.status}</div>
                  <div className="mb-2"><b>Created:</b> {modalUser.createdAt ? new Date(modalUser.createdAt).toLocaleString() : ''}</div>
                  <div className="flex gap-2 mt-2">
                    <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={handleEdit}>Edit</button>
                    {modalUser.status === 'active' ? (
                      <button className="bg-yellow-500 text-white px-4 py-2 rounded" onClick={handleDeactivate}>Deactivate</button>
                    ) : (
                      <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={handleActivate}>Activate</button>
                    )}
                    <button className="bg-red-600 text-white px-4 py-2 rounded" onClick={() => setConfirmDelete(true)}>Delete</button>
                    <button className="bg-gray-400 text-white px-4 py-2 rounded" onClick={closeModal}>Close</button>
                  </div>
                  {confirmDelete && (
                    <div className="mt-4 p-2 bg-red-100 text-red-700 rounded">
                      Are you sure you want to delete this user?
                      <button className="ml-2 bg-red-600 text-white px-2 py-1 rounded" onClick={handleDelete}>Yes, Delete</button>
                      <button className="ml-2 bg-gray-400 text-white px-2 py-1 rounded" onClick={() => setConfirmDelete(false)}>Cancel</button>
                    </div>
                  )}
                </>
              )
            )}
            {activeTab === 'transactions' && (
              <div>
                {isLoadingTransactions ? (
                  <div className="text-center py-8">Loading transactions...</div>
                ) : transactionsError ? (
                  <div className="text-red-600">{transactionsError}</div>
                ) : userTransactions.length === 0 ? (
                  <div className="text-gray-500">No transactions found for this user.</div>
                ) : (
                  <div className="overflow-x-auto max-h-80">
                    <table className="min-w-full bg-white border rounded text-xs">
                      <thead>
                        <tr>
                          <th className="py-1 px-2 border-b">ID</th>
                          <th className="py-1 px-2 border-b">Amount</th>
                          <th className="py-1 px-2 border-b">Type</th>
                          <th className="py-1 px-2 border-b">Status</th>
                          <th className="py-1 px-2 border-b">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {userTransactions.map(tx => (
                          <tr key={tx.id}>
                            <td className="py-1 px-2 border-b">{tx.id}</td>
                            <td className="py-1 px-2 border-b">₦{tx.amount}</td>
                            <td className="py-1 px-2 border-b">{tx.type}</td>
                            <td className="py-1 px-2 border-b">{tx.status}</td>
                            <td className="py-1 px-2 border-b">{new Date(tx.createdAt).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                <button className="mt-4 bg-gray-400 text-white px-4 py-2 rounded" onClick={closeModal}>Close</button>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
            <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-800" onClick={closeAddModal}>&times;</button>
            <h3 className="text-lg font-semibold mb-2">Add New User</h3>
            <div className="mb-2"><b>Name:</b> <input name="name" value={newUser.name} onChange={handleAddChange} className="border p-1 rounded w-full" /></div>
            <div className="mb-2"><b>Email:</b> <input name="email" value={newUser.email} onChange={handleAddChange} className="border p-1 rounded w-full" /></div>
            <div className="mb-2"><b>Role:</b> <select name="role" value={newUser.role} onChange={handleAddChange} className="border p-1 rounded w-full"><option value="user">User</option><option value="admin">Admin</option></select></div>
            <div className="mb-2"><b>Status:</b> <select name="status" value={newUser.status} onChange={handleAddChange} className="border p-1 rounded w-full"><option value="active">Active</option><option value="inactive">Inactive</option></select></div>
            <button className="mt-4 bg-green-600 text-white px-4 py-2 rounded mr-2" onClick={handleAddUser}>Add User</button>
            <button className="mt-4 bg-gray-400 text-white px-4 py-2 rounded" onClick={closeAddModal}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;