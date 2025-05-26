// src/contexts/AuthContext.js
import { createContext, useContext, useEffect } from "react";
import { create } from "zustand";
import { toast } from 'react-hot-toast';
import authService from '../services/auth.service';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '../config/constants';

const AuthContext = createContext(null);

const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null,

  login: async (credentials) => {
    try {
      set({ loading: true, error: null });
      const result = await authService.login(credentials);
      
      if (result.success) {
        set({ 
          user: result.user, 
          isAuthenticated: true, 
          loading: false 
        });
        toast.success(SUCCESS_MESSAGES.LOGIN_SUCCESS);
        return { success: true, user: result.user };
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      set({ 
        error: error.message, 
        loading: false 
      });
      toast.error(error.message || ERROR_MESSAGES.INVALID_CREDENTIALS);
      return { success: false, error };
    }
  },

  register: async (userData) => {
    try {
      set({ loading: true, error: null });
      const result = await authService.register(userData);
      
      if (result.success) {
        set({ 
          user: result.user, 
          isAuthenticated: true, 
          loading: false 
        });
        toast.success(SUCCESS_MESSAGES.REGISTER_SUCCESS);
        return { success: true, user: result.user };
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      set({ 
        error: error.message, 
        loading: false 
      });
      toast.error(error.message || ERROR_MESSAGES.GENERIC);
      return { success: false, error };
    }
  },

  logout: async () => {
    try {
      set({ loading: true });
      const result = await authService.logout();
      
      if (result.success) {
        set({ 
          user: null, 
          isAuthenticated: false, 
          error: null, 
          loading: false 
        });
        toast.success(SUCCESS_MESSAGES.LOGOUT_SUCCESS);
        return { success: true };
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      set({ loading: false });
      toast.error(error.message || ERROR_MESSAGES.GENERIC);
      return { success: false, error };
    }
  },

  forgotPassword: async (email) => {
    try {
      set({ loading: true, error: null });
      const result = await authService.forgotPassword(email);
      
      if (result.success) {
        set({ loading: false });
        toast.success('Password reset instructions sent to your email');
        return { success: true };
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      set({ 
        error: error.message, 
        loading: false 
      });
      toast.error(error.message || ERROR_MESSAGES.GENERIC);
      return { success: false, error };
    }
  },

  resetPassword: async (token, newPassword) => {
    try {
      set({ loading: true, error: null });
      const result = await authService.resetPassword(token, newPassword);
      
      if (result.success) {
        set({ loading: false });
        toast.success(SUCCESS_MESSAGES.PASSWORD_RESET);
        return { success: true };
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      set({ 
        error: error.message, 
        loading: false 
      });
      toast.error(error.message || ERROR_MESSAGES.GENERIC);
      return { success: false, error };
    }
  },

  checkAuth: async () => {
    try {
      set({ loading: true, error: null });
      const isAuthenticated = authService.isAuthenticated();
      const user = authService.getCurrentUser();
      
      if (isAuthenticated && user) {
        set({ 
          user, 
          isAuthenticated: true, 
          loading: false 
        });
      } else {
        set({ 
          user: null, 
          isAuthenticated: false, 
          loading: false 
        });
      }
    } catch (error) {
      set({ 
        user: null, 
        isAuthenticated: false, 
        loading: false, 
        error: error.message 
      });
    }
  },
}));

export function AuthProvider({ children }) {
  useEffect(() => {
    useAuthStore.getState().checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={useAuthStore()}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}