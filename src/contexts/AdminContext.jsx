import React, { createContext, useContext, useState } from 'react';
import { useAuth } from './AuthContext';

const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
  const { user } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activePage, setActivePage] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(prev => !prev);
  };

  const isAdmin = user?.role === 'admin';

  const value = {
    isSidebarCollapsed,
    toggleSidebar,
    activePage,
    setActivePage,
    isLoading,
    setIsLoading,
    error,
    setError,
    isAdmin
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