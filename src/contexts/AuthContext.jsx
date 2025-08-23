import React, { createContext, useState, useContext, useEffect } from 'react';
import { LOCAL_STORAGE_KEYS } from '../config/constants';
import authService from '../services/auth.service';
import Loading from '../components/Loading';
import logger from '../utils/logger';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      if (!isMounted) return;
      try {
        const token = localStorage.getItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN);
        const userStr = localStorage.getItem(LOCAL_STORAGE_KEYS.USER);
        const refreshToken = localStorage.getItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN);
        const storedUser = userStr ? JSON.parse(userStr) : null;

        if (token && storedUser && refreshToken) {
          const isValid = await authService.validateToken();
          if (isValid && isMounted) {
            // Get the updated user data from the service after validation
            const updatedUser = authService.getUser();
            setUser(updatedUser || storedUser);
            setIsAuthenticated(true);
            setIsLoading(false);
            return;
          }
        }

        if (refreshToken) {
          const { success, user } = await authService.refreshToken();
          if (success && isMounted) {
            setUser(user);
            setIsAuthenticated(true);
            setIsLoading(false);
            return;
          }
        }

        setUser(null);
        setIsAuthenticated(false);
        setIsLoading(false);
      } catch (error) {
        logger.auth('Auth check error', { error: error.message });
        setUser(null);
        setIsAuthenticated(false);
        setIsLoading(false);
      }
    };

    checkAuth();

    const handleStorageChange = (e) => {
      if (e.storageArea !== localStorage) return;
      if ([
        LOCAL_STORAGE_KEYS.AUTH_TOKEN,
        LOCAL_STORAGE_KEYS.USER,
        LOCAL_STORAGE_KEYS.REFRESH_TOKEN
      ].includes(e.key)) {
        checkAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      isMounted = false;
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const login = async (credentials, rememberMe = false) => {
    try {
      const { success, user, error } = await authService.login(credentials);
      if (success) {
        setUser(user);
        setIsAuthenticated(true);
        if (rememberMe) authService.setRememberMe(true);
        return { success: true };
      }
      return { success: false, error };
    } catch (error) {
      logger.auth('Login error', { error: error.message });
      return { success: false, error: error.message || 'Login error' };
    }
  };

  const register = async (userData) => {
    try {
      const { success, user, info, error } = await authService.register(userData);
      if (success) {
        if (user) {
          setUser(user);
          setIsAuthenticated(true);
        }
        return { success: true, info };
      }
      return { success: false, error };
    } catch (error) {
      logger.auth('Registration error', { error: error.message });
      return { success: false, error: error.message || 'Registration error' };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
      return { success: true };
    } catch (error) {
      logger.auth('Logout error', { error: error.message });
      return { success: false, error: error.message || 'Logout error' };
    }
  };

  const forgotPassword = async (email) => {
    try {
      const { success, error } = await authService.forgotPassword(email);
      return { success, error };
    } catch (error) {
      logger.auth('Forgot password error', { error: error.message });
      return { success: false, error: error.message || 'Failed to send reset email' };
    }
  };

  const resetPassword = async (token, newPassword) => {
    try {
      const { success, error } = await authService.resetPassword(token, newPassword);
      return { success, error };
    } catch (error) {
      logger.auth('Reset password error', { error: error.message });
      return { success: false, error: error.message || 'Failed to reset password' };
    }
  };

  const updateProfile = async (userData) => {
    try {
      const { success, user, error } = await authService.updateProfile(userData);
      if (success) {
        setUser(user);
        return { success: true };
      }
      return { success: false, error };
    } catch (error) {
      logger.auth('Update profile error', { error: error.message });
      return { success: false, error: error.message || 'Failed to update profile' };
    }
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    isAuthResolved: !isLoading && user !== null && isAuthenticated !== undefined,
    login,
    logout,
    register,
    forgotPassword,
    resetPassword,
    updateProfile,
  };

  if (isLoading) return <Loading />;
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;