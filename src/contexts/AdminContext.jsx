import React, { createContext, useContext, useState } from 'react';
import { useAuth } from './AuthContext';
import adminService from '../services/admin.service';

const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
  const { user } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activePage, setActivePage] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dashboardMetrics, setDashboardMetrics] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);

  const fetchDashboardMetrics = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await adminService.getDashboardMetrics();
      setDashboardMetrics(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch dashboard metrics');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async (params) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await adminService.getUsers(params);
      setUsers(data.users);
    } catch (err) {
      setError(err.message || 'Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTransactions = async (params) => {
    console.log('[ADMIN CONTEXT] fetchTransactions called');
    setIsLoading(true);
    setError(null);
    try {
      const data = await adminService.getTransactions(params);
      setTransactions(data.transactions);
    } catch (err) {
      setError(err.message || 'Failed to fetch transactions');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchServices = async (params) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await adminService.getServices(params);
      setServices(data.services);
    } catch (err) {
      setError(err.message || 'Failed to fetch services');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(prev => !prev);
  };

  const isAdmin = user?.isAdmin === true || user?.role === 'admin';
  console.log('[AdminContext] user:', user);
  console.log('[AdminContext] isAdmin:', isAdmin);

  const value = {
    isSidebarCollapsed,
    toggleSidebar,
    activePage,
    setActivePage,
    isLoading,
    setIsLoading,
    error,
    setError,
    isAdmin,
    dashboardMetrics,
    fetchDashboardMetrics,
    users,
    fetchUsers,
    selectedUser,
    setSelectedUser,
    transactions,
    fetchTransactions,
    selectedTransaction,
    setSelectedTransaction,
    services,
    fetchServices,
    selectedService,
    setSelectedService
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}; 