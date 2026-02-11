import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { LOCAL_STORAGE_KEYS } from '../config/constants';
import supabaseAuthService from '../services/supabaseAuth.service';
import Loading from '../components/Loading';
import logger from '../utils/logger';
import { errorHandler } from '../utils/errorHandler';

const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Secure user state update
  const updateUserState = useCallback((userData, authenticated = true) => {
    if (userData) {
      // Ensure user data is properly structured
      const sanitizedUser = {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        // ✅ FIX: Ensure centerId is preserved from input data
        centerId: userData.centerId || userData.center_id || null, 
        role: userData.role || 'user',
        isAdmin: userData.isAdmin || userData.role === 'admin',
        emailVerified: userData.emailVerified || false,
        avatarUrl: userData.avatarUrl || userData.avatar_url || null,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt
      };
      
      setUser(sanitizedUser);
      setIsAuthenticated(authenticated);
      setAuthError(null);
    } else {
      setUser(null);
      setIsAuthenticated(false);
    }
  }, []);

  // Clear auth state
  const clearAuthState = useCallback(() => {
    setUser(null);
    setIsAuthenticated(false);
    setAuthError(null);
  }, []);

  // Check authentication status
  const checkAuth = useCallback(async () => {
    try {
      const token = supabaseAuthService.getToken();
      const storedUser = supabaseAuthService.getUser();

      if (!token || !storedUser) {
        clearAuthState();
        setIsLoading(false);
        return;
      }

      // Validate token with Supabase before trusting stored data
      const isValid = await supabaseAuthService.validateToken();
      if (!isValid) {
        logger.auth('Stored token is invalid, clearing auth state');
        supabaseAuthService.clearStorage();
        clearAuthState();
        return;
      }

      updateUserState(storedUser);
      logger.auth('Authentication restored and validated');
    } catch (error) {
      const errorResponse = errorHandler.createSafeErrorResponse(error, 'Authentication check failed');
      logger.auth('Auth check error', { message: errorResponse.error });
      setAuthError(errorResponse.error);
      clearAuthState();
    } finally {
      setIsLoading(false);
    }
  }, [updateUserState, clearAuthState]);

  // Initialize authentication
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      if (!isMounted) return;
      await checkAuth();
    };

    initAuth();

    // Listen for storage changes (multi-tab support)
    const handleStorageChange = (e) => {
      if (e.storageArea !== localStorage) return;
      
      const authKeys = [
        LOCAL_STORAGE_KEYS.AUTH_TOKEN,
        LOCAL_STORAGE_KEYS.USER,
        LOCAL_STORAGE_KEYS.REFRESH_TOKEN
      ];
      
      if (authKeys.includes(e.key)) {
        logger.auth('Storage change detected, rechecking auth');
        checkAuth();
      }
    };

    // Listen for auth logout events
    const handleAuthLogout = () => {
      logger.auth('Logout event received');
      clearAuthState();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('auth:logout', handleAuthLogout);

    return () => {
      isMounted = false;
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth:logout', handleAuthLogout);
    };
  }, [checkAuth, clearAuthState]);

  // Login function with enhanced error handling
  const login = async (credentials, rememberMe = false) => {
    try {
      setAuthError(null);
      logger.auth('Login attempt started');
      
      const result = await supabaseAuthService.login(credentials);
      
      if (result.success && result.user) {
        updateUserState(result.user);
        
        // Remember me handled by Supabase session
        
        logger.auth('Login successful');
        return { success: true };
      } else {
        setAuthError(result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorResponse = errorHandler.createSafeErrorResponse(error, 'Login failed');
      setAuthError(errorResponse.error);
      logger.auth('Login error', { message: errorResponse.error });
      return { success: false, error: errorResponse.error };
    }
  };

  // Register function with enhanced error handling
  const register = async (userData) => {
    try {
      setAuthError(null);
      logger.auth('Registration attempt started');
      
      const result = await supabaseAuthService.register(userData);
      
      if (result.success) {
        if (result.user) {
          updateUserState(result.user);
          logger.auth('Registration successful with immediate login');
        } else {
          logger.auth('Registration successful, confirmation required');
        }
        
        return { 
          success: true, 
          info: result.info,
          requiresConfirmation: result.requiresConfirmation 
        };
      } else {
        setAuthError(result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorResponse = errorHandler.createSafeErrorResponse(error, 'Registration failed');
      setAuthError(errorResponse.error);
      logger.auth('Registration error', { message: errorResponse.error });
      return { success: false, error: errorResponse.error };
    }
  };

  // Logout function with cleanup
  const logout = async () => {
    try {
      logger.auth('Logout initiated');
      await supabaseAuthService.logout();
      clearAuthState();
      logger.auth('Logout successful');
      return { success: true };
    } catch (error) {
      // Even if logout fails on server, clear local state
      clearAuthState();
      const errorResponse = errorHandler.createSafeErrorResponse(error, 'Logout completed with errors');
      logger.auth('Logout error', { message: errorResponse.error });
      return { success: true }; // Return success since local cleanup succeeded
    }
  };

  // Forgot password function
  const forgotPassword = async (email) => {
    try {
      setAuthError(null);
      logger.auth('Forgot password request started');
      
      const result = await supabaseAuthService.forgotPassword(email);
      
      if (result.success) {
        logger.auth('Forgot password request successful');
      } else {
        setAuthError(result.error);
      }
      
      return result;
    } catch (error) {
      const errorResponse = errorHandler.createSafeErrorResponse(error, 'Failed to send reset email');
      setAuthError(errorResponse.error);
      logger.auth('Forgot password error', { message: errorResponse.error });
      return { success: false, error: errorResponse.error };
    }
  };

  // Reset password function
  const resetPassword = async (token, newPassword) => {
    try {
      setAuthError(null);
      logger.auth('Password reset attempt started');
      
      const result = await supabaseAuthService.resetPassword(token, newPassword);
      
      if (result.success) {
        logger.auth('Password reset successful');
      } else {
        setAuthError(result.error);
      }
      
      return result;
    } catch (error) {
      const errorResponse = errorHandler.createSafeErrorResponse(error, 'Failed to reset password');
      setAuthError(errorResponse.error);
      logger.auth('Password reset error', { message: errorResponse.error });
      return { success: false, error: errorResponse.error };
    }
  };

  // Update profile function
  const updateProfile = async (userData) => {
    try {
      setAuthError(null);
      logger.auth('Profile update attempt started');
      
      const result = await supabaseAuthService.updateProfile(userData);
      
      if (result.success && result.user) {
        updateUserState(result.user);
        logger.auth('Profile update successful');
        return { success: true };
      } else {
        setAuthError(result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorResponse = errorHandler.createSafeErrorResponse(error, 'Failed to update profile');
      setAuthError(errorResponse.error);
      logger.auth('Profile update error', { message: errorResponse.error });
      return { success: false, error: errorResponse.error };
    }
  };

  // Refresh authentication
  const refreshAuth = useCallback(async () => {
    setIsLoading(true);
    await checkAuth();
  }, [checkAuth]);

  // Clear auth error
  const clearError = useCallback(() => {
    setAuthError(null);
  }, []);

  const value = {
    // State
    user,
    isAuthenticated,
    isLoading,
    authError,
    isAuthResolved: !isLoading,
    
    // Actions
    login,
    logout,
    register,
    forgotPassword,
    resetPassword,
    updateProfile,
    refreshAuth,
    clearError,
    
    // Utilities
    isAdmin: user?.isAdmin || false,
    hasRole: (role) => user?.role === role,
    canAccess: (requiredRole) => {
      if (!user) return false;
      if (requiredRole === 'admin') return user.isAdmin;
      return true;
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { AuthProvider, useAuth };
export default AuthContext;