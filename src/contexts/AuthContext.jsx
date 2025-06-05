// src/contexts/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/auth.service';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '../config/constants';
import Loading from '../components/Loading';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication status on mount and token change
  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      try {
        const storedUser = authService.getUser();
        const token = authService.getToken();
        
        if (storedUser && token) {
          // Validate token with backend
          const isValid = await authService.validateToken();
          if (isValid && isMounted) {
            setUser(storedUser);
            setIsAuthenticated(true);
          } else {
            // If token is invalid, try to refresh it
            const refreshResult = await authService.refreshToken();
            if (refreshResult.success && isMounted) {
              setUser(refreshResult.user);
              setIsAuthenticated(true);
            } else if (isMounted) {
              // If refresh fails, clear storage
              authService.clearStorage();
              setUser(null);
              setIsAuthenticated(false);
            }
          }
        } else if (isMounted) {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        if (isMounted) {
          authService.clearStorage();
          setUser(null);
          setIsAuthenticated(false);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (credentials, rememberMe = false) => {
    try {
      const response = await authService.login(credentials);
      if (response.success) {
        setUser(response.user);
        setIsAuthenticated(true);
        if (rememberMe) {
          authService.setRememberMe(true);
        }
        return { success: true };
      }
      return { success: false, error: response.error };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      authService.clearStorage();
      setUser(null);
      setIsAuthenticated(false);
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      if (response.success) {
        return { success: true };
      }
      return { success: false, error: response.error };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error };
    }
  };

  const forgotPassword = async (email) => {
    try {
      const response = await authService.forgotPassword(email);
      return { success: true };
    } catch (error) {
      console.error('Forgot password error:', error);
      return { success: false, error };
    }
  };

  const resetPassword = async (token, newPassword) => {
    try {
      const response = await authService.resetPassword(token, newPassword);
      return { success: true };
    } catch (error) {
      console.error('Reset password error:', error);
      return { success: false, error };
    }
  };

  const updateProfile = async (userData) => {
    try {
      const response = await authService.updateProfile(userData);
      if (response.success) {
        setUser(response.user);
        return { success: true };
      }
      return { success: false, error: response.error };
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, error };
    }
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    register,
    forgotPassword,
    resetPassword,
    updateProfile
  };

  if (isLoading) {
    return <Loading />;
  }

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