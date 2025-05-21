import React, { createContext, useContext, useEffect } from 'react';
import { create } from 'zustand';

const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  login: () => Promise.reject(new Error('AuthContext not initialized')),
  register: () => Promise.reject(new Error('AuthContext not initialized')),
  logout: () => {},
  forgotPassword: () => Promise.reject(new Error('AuthContext not initialized')),
  resetPassword: () => Promise.reject(new Error('AuthContext not initialized')),
  updateProfile: () => Promise.reject(new Error('AuthContext not initialized')),
  setUser: () => {},
  setIsAuthenticated: () => {},
  setLoading: () => {},
  setError: () => {},
});

// Create a store for auth state
const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  
  setUser: (userData) => set({ user: userData }),
  setIsAuthenticated: (status) => set({ isAuthenticated: status }),
  setLoading: (status) => set({ loading: status }),
  setError: (error) => set({ error: error }),
}));

export const AuthProvider = ({ children }) => {
  const { user, isAuthenticated, loading, error, setUser, setIsAuthenticated, setLoading, setError } = useAuthStore();

  const login = async (credentials, rememberMe = false) => {
    console.log('Login attempt:', { credentials, rememberMe });
    alert('Development mode: Login functionality will be implemented with backend connection');
    return { success: true, user: { email: credentials.email } };
  };

  const register = async (userData) => {
    console.log('Registration attempt:', userData);
    alert('Development mode: Registration functionality will be implemented with backend connection');
    return { success: true, user: { email: userData.email } };
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('email');
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
  };

  const checkAuth = () => {
    try {
      // In development mode, we'll just set loading to false
      setLoading(false);
      setError(null);
    } catch (error) {
      console.error('Auth check error:', error);
      setError('Failed to check authentication status');
    }
  };

  const forgotPassword = async (email) => {
    console.log('Forgot password attempt:', email);
    alert('Development mode: Password reset functionality will be implemented with backend connection');
    return { success: true };
  };

  const resetPassword = async (token, newPassword) => {
    console.log('Reset password attempt:', { token, newPassword });
    alert('Development mode: Password reset functionality will be implemented with backend connection');
    return { success: true };
  };

  const updateProfile = async (userData) => {
    console.log('Update profile attempt:', userData);
    alert('Development mode: Profile update functionality will be implemented with backend connection');
    return { success: true, user: userData };
  };

  useEffect(() => {
    checkAuth();
  }, []); // Check auth state on mount

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      loading,
      error,
      login,
      register,
      logout,
      forgotPassword,
      resetPassword,
      updateProfile,
      setUser,
      setIsAuthenticated,
      setLoading,
      setError,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
