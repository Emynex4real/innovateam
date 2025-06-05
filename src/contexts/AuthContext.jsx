// src/contexts/AuthContext.js
import React, { createContext, useState, useContext } from 'react';
import authService from '../services/auth.service';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '../config/constants';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials);
      if (response.success) {
        setUser(response.user);
        setIsAuthenticated(true);
        return { success: true, message: SUCCESS_MESSAGES.LOGIN_SUCCESS };
      }
      return { success: false, error: response.error || ERROR_MESSAGES.LOGIN_FAILED };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message || ERROR_MESSAGES.LOGIN_FAILED };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      if (response.success) {
        return { success: true, message: SUCCESS_MESSAGES.REGISTER_SUCCESS };
      }
      return { 
        success: false, 
        error: response.error || ERROR_MESSAGES.REGISTER_FAILED 
      };
    } catch (error) {
      console.error('Registration error in AuthContext:', error);
      return { 
        success: false, 
        error: error.message || ERROR_MESSAGES.REGISTER_FAILED 
      };
    }
  };

  const logout = async () => {
    try {
      const response = await authService.logout();
      if (response.success) {
        authService.clearStorage();
        setUser(null);
        setIsAuthenticated(false);
        return { success: true, message: 'Logged out successfully' };
      }
      return { success: false, error: response.error || 'Failed to logout' };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: error.message || 'Failed to logout' };
    }
  };

  const value = {
          user, 
    isAuthenticated,
    login,
    register,
    logout
  };

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