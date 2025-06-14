import React, { useEffect, useState } from 'react';
import { useAdmin } from '../contexts/AdminContext';
import adminService from '../services/admin.service';
import { toast } from 'react-toastify';
import Spinner from '../components/Spinner';

const AdminServices = () => {
  console.log('AdminServices FUNCTION BODY running');
  const {
    services,
    fetchServices,
    isLoading,
    error
  } = useAdmin();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalService, setModalService] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editService, setEditService] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newService, setNewService] = useState({ name: '', type: '', price: '', status: 'active' });
  const [selectedIds, setSelectedIds] = useState([]);
  const allSelected = services.length > 0 && services.every(s => selectedIds.includes(s.id));

  useEffect(() => {
    fetchServices();
    // eslint-disable-next-line
  }, []);

  const filtered = services.filter(s =>
    (s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.type?.toLowerCase().includes(search.toLowerCase())) &&
    (typeFilter ? s.type === typeFilter : true) &&
    (statusFilter ? s.status === statusFilter : true)
  );

  const openModal = (service) => {
    setModalService(service);
    setEditService(service);
    setEditMode(false);
    setShowModal(true);
    setConfirmDelete(false);
  };
  const closeModal = () => {
    setModalService(null);
    setEditService(null);
    setEditMode(false);
    setShowModal(false);
    setConfirmDelete(false);
  };

  const handleEdit = () => setEditMode(true);
  const handleEditChange = e => setEditService({ ...editService, [e.target.name]: e.target.value });
  const handleEditSave = async () => {
    try {
      await adminService.updateService(editService.id, editService);
      toast.success('Service updated');
      fetchServices();
      setEditMode(false);
    } catch (err) {
      toast.error('Failed to update service');
    }
  };
  const handleDelete = async () => {
    try {
      await adminService.deleteService(modalService.id);
      toast.success('Service deleted');
      fetchServices();
      closeModal();
    } catch (err) {
      toast.error('Failed to delete service');
    }
  };

  const openAddModal = () => {
    setNewService({ name: '', type: '', price: '', status: 'active' });
    setShowAddModal(true);
  };
  const closeAddModal = () => setShowAddModal(false);
  const handleAddChange = e => setNewService({ ...newService, [e.target.name]: e.target.value });
  const handleAddService = async () => {
    try {
      await adminService.addService(newService);
      toast.success('Service added');
      fetchServices();
      closeAddModal();
    } catch (err) {
      toast.error('Failed to add service');
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    const csvRows = [
      ['Name', 'Type', 'Price', 'Status', 'Usage'],
      ...filtered.map(s => [s.name, s.type, s.price, s.status, s.usage])
    ];
    const csvContent = csvRows.map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'services.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleSelect = id => setSelectedIds(ids => ids.includes(id) ? ids.filter(i => i !== id) : [...ids, id]);
  const toggleSelectAll = () => setSelectedIds(allSelected ? [] : filtered.map(s => s.id));

  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedIds.length} services? This cannot be undone.`)) return;
    try {
      await Promise.all(selectedIds.map(id => adminService.deleteService(id)));
      toast.success('Services deleted');
      fetchServices();
      setSelectedIds([]);
    } catch (err) {
      toast.error('Failed to delete services');
    }
  };

  console.log('AdminServices RETURN about to render');
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Services</h2>
      <div className="flex flex-wrap gap-2 mb-4">
        <input
          type="text"
          placeholder="Search by name or type"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="p-2 border rounded w-full max-w-xs"
        />
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="p-2 border rounded">
          <option value="">All Types</option>
          {/* Dynamically list types if available */}
          <option value="type1">Type 1</option>
          <option value="type2">Type 2</option>
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="p-2 border rounded">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={openAddModal}>Add Service</button>
        <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={exportToCSV}>Export</button>
        {selectedIds.length > 0 && (
          <button className="bg-red-600 text-white px-4 py-2 rounded" onClick={handleBulkDelete}>Delete Selected ({selectedIds.length})</button>
        )}
      </div>
      {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-2">{error}</div>}
      {isLoading ? (
        <Spinner size={40} className="my-8" />
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border rounded">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b"><input type="checkbox" checked={allSelected} onChange={toggleSelectAll} /></th>
                <th className="py-2 px-4 border-b">Name</th>
                <th className="py-2 px-4 border-b">Type</th>
                <th className="py-2 px-4 border-b">Price</th>
                <th className="py-2 px-4 border-b">Status</th>
                <th className="py-2 px-4 border-b">Usage</th>
                <th className="py-2 px-4 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-400">
                    <div className="flex flex-col items-center">
                      <span className="text-5xl mb-2">🛠️</span>
                      <span>No services found.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map(service => (
                  <tr key={service._id || service.id}>
                    <td className="py-2 px-4 border-b"><input type="checkbox" checked={selectedIds.includes(service.id)} onChange={() => toggleSelect(service.id)} /></td>
                    <td className="py-2 px-4 border-b">{service.name}</td>
                    <td className="py-2 px-4 border-b">{service.type}</td>
                    <td className="py-2 px-4 border-b">₦{service.price}</td>
                    <td className="py-2 px-4 border-b">{service.status || 'active'}</td>
                    <td className="py-2 px-4 border-b">{service.usage || 0}</td>
                    <td className="py-2 px-4 border-b">
                      <button className="text-blue-600 hover:underline mr-2" onClick={() => openModal(service)}>View</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
      {/* Service Modal */}
      {showModal && modalService && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
            <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-800" onClick={closeModal}>&times;</button>
            <h3 className="text-lg font-semibold mb-2">Service Details</h3>
            {editMode ? (
              <>
                <div className="mb-2"><b>Name:</b> <input name="name" value={editService.name} onChange={handleEditChange} className="border p-1 rounded w-full" /></div>
                <div className="mb-2"><b>Type:</b> <input name="type" value={editService.type} onChange={handleEditChange} className="border p-1 rounded w-full" /></div>
                <div className="mb-2"><b>Price:</b> <input name="price" value={editService.price} onChange={handleEditChange} className="border p-1 rounded w-full" /></div>
                <div className="mb-2"><b>Status:</b> <select name="status" value={editService.status} onChange={handleEditChange} className="border p-1 rounded w-full"><option value="active">Active</option><option value="inactive">Inactive</option></select></div>
                <button className="mt-4 bg-green-600 text-white px-4 py-2 rounded mr-2" onClick={handleEditSave}>Save</button>
                <button className="mt-4 bg-gray-400 text-white px-4 py-2 rounded" onClick={() => setEditMode(false)}>Cancel</button>
              </>
            ) : (
              <>
                <div className="mb-2"><b>Name:</b> {modalService.name}</div>
                <div className="mb-2"><b>Type:</b> {modalService.type}</div>
                <div className="mb-2"><b>Price:</b> ₦{modalService.price}</div>
                <div className="mb-2"><b>Status:</b> {modalService.status}</div>
                <div className="mb-2"><b>Usage:</b> {modalService.usage || 0}</div>
                <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded mr-2" onClick={handleEdit}>Edit</button>
                <button className="mt-4 bg-red-600 text-white px-4 py-2 rounded mr-2" onClick={() => setConfirmDelete(true)}>Delete</button>
                <button className="mt-4 bg-gray-400 text-white px-4 py-2 rounded" onClick={closeModal}>Close</button>
                {confirmDelete && (
                  <div className="mt-4 p-2 bg-red-100 text-red-700 rounded">
                    Are you sure you want to delete this service?
                    <button className="ml-2 bg-red-600 text-white px-2 py-1 rounded" onClick={handleDelete}>Yes, Delete</button>
                    <button className="ml-2 bg-gray-400 text-white px-2 py-1 rounded" onClick={() => setConfirmDelete(false)}>Cancel</button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
      {/* Add Service Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
            <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-800" onClick={closeAddModal}>&times;</button>
            <h3 className="text-lg font-semibold mb-2">Add New Service</h3>
            <div className="mb-2"><b>Name:</b> <input name="name" value={newService.name} onChange={handleAddChange} className="border p-1 rounded w-full" /></div>
            <div className="mb-2"><b>Type:</b> <input name="type" value={newService.type} onChange={handleAddChange} className="border p-1 rounded w-full" /></div>
            <div className="mb-2"><b>Price:</b> <input name="price" value={newService.price} onChange={handleAddChange} className="border p-1 rounded w-full" /></div>
            <div className="mb-2"><b>Status:</b> <select name="status" value={newService.status} onChange={handleAddChange} className="border p-1 rounded w-full"><option value="active">Active</option><option value="inactive">Inactive</option></select></div>
            <button className="mt-4 bg-green-600 text-white px-4 py-2 rounded mr-2" onClick={handleAddService}>Add Service</button>
            <button className="mt-4 bg-gray-400 text-white px-4 py-2 rounded" onClick={closeAddModal}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminServices; 