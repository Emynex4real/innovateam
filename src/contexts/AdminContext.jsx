import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useAuth } from './SupabaseAuthContext';
import adminService from '../services/admin.service';

const AdminContext = createContext();

// Debug logging helper
const debugAdmin = (message, data = {}) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[AdminContext] ${message}`, {
      timestamp: new Date().toISOString(),
      ...data
    });
  }
};

export const AdminProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activePage, setActivePage] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dashboardMetrics, setDashboardMetrics] = useState({
    totalUsers: 0,
    totalTransactions: 0,
    revenue: 0,
    totalServices: 0,
    recentTransactions: [],
    recentUsers: [],
    recentServices: []
  });
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);

  // Determine if the current user is an admin
  const adminStatus = useMemo(() => {
    const isAdminUser = user?.role === 'admin' || user?.isAdmin === true;
    debugAdmin('Checking admin status', {
      userId: user?.id,
      userRole: user?.role,
      userIsAdmin: user?.isAdmin,
      isAdmin: isAdminUser
    });
    return isAdminUser;
  }, [user]);

  // Log admin status changes
  useEffect(() => {
    debugAdmin('Admin status updated', {
      isAuthenticated,
      isAdmin: adminStatus,
      userId: user?.id,
      userRole: user?.role
    });
  }, [adminStatus, isAuthenticated, user]);

  const fetchDashboardMetrics = async () => {
    console.log('fetchDashboardMetrics called');
    setIsLoading(true);
    setError(null);
    try {
      console.log('Calling adminService.getDashboardMetrics()');
      const data = await adminService.getDashboardMetrics();
      console.log('Dashboard metrics received:', data);
      
      // Ensure the data has the expected structure
      const metrics = {
        totalUsers: 0,
        totalTransactions: 0,
        revenue: 0,
        totalServices: 0,
        recentTransactions: [],
        recentUsers: [],
        recentServices: [],
        ...data
      };
      setDashboardMetrics(metrics);
      return metrics;
    } catch (err) {
      console.warn('Using fallback dashboard metrics due to error:', err.message);
      setError(err.message);
      // Set default metrics in case of error
      const fallbackMetrics = {
        totalUsers: 0,
        totalTransactions: 0,
        revenue: 0,
        totalServices: 0,
        recentTransactions: [],
        recentUsers: [],
        recentServices: []
      };
      setDashboardMetrics(fallbackMetrics);
      return fallbackMetrics;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async (params) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await adminService.getUsers(params);
      setUsers(data.users || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch users');
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Fetches transactions with optional filtering parameters
   * @param {Object} params - Query parameters for filtering transactions
   * @returns {Promise<Array>} Array of transactions
   */
  const fetchTransactions = async (params = {}) => {
    const method = 'fetchTransactions';
    console.group(`[AdminContext.${method}]`);
    console.log('Starting transaction fetch with params:', params);
    console.log('Current transactions state (before):', transactions);
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Calling adminService.getTransactions()');
      const transactionsData = await adminService.getTransactions(params);
      
      // Log the received data structure for debugging
      console.log('Transactions data received:', {
        isArray: Array.isArray(transactionsData),
        count: transactionsData?.length || 0,
        sample: transactionsData?.[0] || 'No transactions'
      });
      
      // Ensure we have an array (handle both direct array and { transactions: [] } formats)
      const transactionsArray = Array.isArray(transactionsData) 
        ? transactionsData 
        : transactionsData?.transactions || [];
      
      if (!Array.isArray(transactionsArray)) {
        console.warn('Unexpected transactions data format:', transactionsData);
        throw new Error('Invalid transactions data format received from server');
      }
      
      console.log(`Processing ${transactionsArray.length} transactions`);
      
      // Transform data if needed to match expected format
      const processedTransactions = transactionsArray.map(tx => ({
        id: tx.id || `tx_${Math.random().toString(36).substr(2, 9)}`,
        user: typeof tx.user === 'object' ? tx.user : { 
          id: 'unknown', 
          name: 'Unknown User', 
          email: 'unknown@example.com' 
        },
        amount: Number(tx.amount) || 0,
        type: tx.type || 'unknown',
        status: tx.status || 'pending',
        createdAt: tx.createdAt || new Date().toISOString(),
        description: tx.description || 'No description',
        // Include all other properties from the original transaction
        ...tx
      }));
      
      setTransactions(processedTransactions);
      console.log('Transactions state updated successfully');
      return processedTransactions;
      
    } catch (error) {
      const errorMessage = error.details?.message || error.message || 'Failed to fetch transactions';
      console.error(`[AdminContext.${method}] Error:`, {
        error,
        message: errorMessage,
        code: error.code,
        stack: error.stack
      });
      
      setError(errorMessage);
      
      // Set empty array to trigger the "no transactions" UI state
      setTransactions([]);
      return [];
      
    } finally {
      console.log('Transaction fetch completed');
      console.log('Current transactions state (after):', transactions);
      console.groupEnd();
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

  // Log the value being provided to context consumers
  console.log('[AdminContext] Providing context value:', {
    transactionsCount: transactions.length,
    isLoading,
    error,
    isAdmin
  });

  // Derived state: true only when admin status is determined
  const isAdminResolved = user !== null && typeof adminStatus === 'boolean';

  const contextValue = {
    isAdmin: adminStatus,
    isAdminResolved, // <-- add this
    isSidebarCollapsed,
    toggleSidebar: () => setIsSidebarCollapsed(!isSidebarCollapsed),
    activePage,
    setActivePage,
    isLoading,
    error,
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

  // Log context value changes
  useEffect(() => {
    debugAdmin('AdminContext value updated', {
      isAdmin: contextValue.isAdmin,
      isLoading: contextValue.isLoading,
      error: contextValue.error,
      userCount: contextValue.users?.length,
      transactionCount: contextValue.transactions?.length,
      serviceCount: contextValue.services?.length
    });
  }, [contextValue]);

  return (
    <AdminContext.Provider value={contextValue}>
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