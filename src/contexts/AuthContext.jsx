// src/contexts/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { 
  LOCAL_STORAGE_KEYS,
  SUCCESS_MESSAGES, 
  ERROR_MESSAGES 
} from '../config/constants';
import authService from '../services/auth.service';
import Loading from '../components/Loading';

// Debug function to log authentication state changes
const debugAuth = (message, data = {}) => {
  console.log(`[Auth Debug] ${message}`, {
    timestamp: new Date().toISOString(),
    ...data,
    hasToken: !!authService.getToken(),
    hasUser: !!authService.getUser(),
    hasRefreshToken: !!authService.getRefreshToken()
  });
};

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication status on mount and token change
  useEffect(() => {
    let isMounted = true;
    let retryCount = 0;
    const MAX_RETRIES = 2;

    // --- Robust Auth Rehydration ---
    const checkAuth = async (isRetry = false) => {
      if (!isMounted) return;
      debugAuth('Starting auth check', { isRetry, retryCount, timestamp: new Date().toISOString() });
      try {
        // Always get latest from localStorage
        const token = localStorage.getItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN);
        const userStr = localStorage.getItem(LOCAL_STORAGE_KEYS.USER);
        const refreshToken = localStorage.getItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN);
        const storedUser = userStr ? JSON.parse(userStr) : null;
        debugAuth('Current auth state', { hasToken: !!token, hasUser: !!storedUser, hasRefreshToken: !!refreshToken, userId: storedUser?.id, timestamp: new Date().toISOString() });

        // If all are present, validate token
        if (token && storedUser && refreshToken) {
          debugAuth('All auth data present, validating token...');
          try {
            const isValid = await authService.validateToken();
            debugAuth('Token validation result', { isValid });
            if (isValid && isMounted) {
              setUser(authService.getUser());
              setIsAuthenticated(true);
              setIsLoading(false);
              return;
            }
          } catch (validationError) {
            debugAuth('Token validation failed', { error: validationError.message });
            // Try refresh if not already retried
            if (refreshToken && retryCount < MAX_RETRIES) {
              retryCount++;
              debugAuth('Attempting token refresh after failed validation...');
              const refreshResult = await authService.refreshToken();
              if (refreshResult?.success && isMounted) {
                setUser(refreshResult.user);
                setIsAuthenticated(true);
                setIsLoading(false);
                return;
              }
            }
          }
        }

        // If we have a refresh token but no auth token, try to refresh
        if ((!token || !storedUser) && refreshToken) {
          debugAuth('Missing token or user, attempting refresh...');
          const refreshResult = await authService.refreshToken();
          if (refreshResult?.success && isMounted) {
            setUser(refreshResult.user);
            setIsAuthenticated(true);
            setIsLoading(false);
            return;
          }
        }

        // If we get here, clear everything
        debugAuth('Auth state invalid or expired, clearing...');
        authService.clearStorage();
        setUser(null);
        setIsAuthenticated(false);
        setIsLoading(false);
      } catch (error) {
        debugAuth('Fatal error during auth check', { error: error.message, stack: error.stack });
        authService.clearStorage();
        setUser(null);
        setIsAuthenticated(false);
        setIsLoading(false);
      }
    };

    checkAuth();

    // Add event listener for storage changes
    const handleStorageChange = (e) => {
      // Skip if this is not a localStorage event or not an auth-related key
      if (e.storageArea !== localStorage) return;
      
      const isAuthKey = [
        LOCAL_STORAGE_KEYS.AUTH_TOKEN,
        LOCAL_STORAGE_KEYS.USER,
        LOCAL_STORAGE_KEYS.REFRESH_TOKEN
      ].includes(e.key);
      
      if (!isAuthKey) return;
      
      // Log the storage change for debugging
      debugAuth('Storage change detected', { 
        key: e.key, 
        newValue: e.newValue ? '***' : null,
        oldValue: e.oldValue ? '***' : null,
        timestamp: new Date().toISOString()
      });
      
      // Get current state directly from localStorage
      const currentToken = localStorage.getItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN);
      const currentUser = localStorage.getItem(LOCAL_STORAGE_KEYS.USER);
      const currentRefreshToken = localStorage.getItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN);
      
      // Log current auth state
      debugAuth('Current auth state', {
        hasToken: !!currentToken,
        hasUser: !!currentUser,
        hasRefreshToken: !!currentRefreshToken,
        timestamp: new Date().toISOString()
      });
      
      // If we have a refresh token but no auth token, try to refresh
      if (!currentToken && currentRefreshToken && currentUser) {
        debugAuth('Auth token missing but refresh token exists, attempting refresh...');
        checkAuth();
        return;
      }
      
      // Only proceed with logout if all auth data is missing
      const allAuthDataMissing = !currentToken && !currentUser && !currentRefreshToken;
      
      if (allAuthDataMissing) {
        debugAuth('All auth data missing, logging out');
        authService.clearStorage();
        setUser(null);
        setIsAuthenticated(false);
        setIsLoading(false);
      } else {
        // If we still have some auth data, revalidate the session
        debugAuth('Partial auth data exists, revalidating...');
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
    debugAuth('Login attempt started', { email: credentials.email });
    try {
      const response = await authService.login(credentials);
      debugAuth('Login API response', { success: response.success, user: response.user });
      
      if (response.success) {
        // Ensure we're setting the complete user object including isAdmin
        debugAuth('Login successful, updating auth state', { userId: response.user?.id });
        setUser(response.user);
        setIsAuthenticated(true);
        
        if (rememberMe) {
          debugAuth('Setting remember me');
          authService.setRememberMe(true);
        }
        
        // Verify the token was actually set
        const tokenAfterLogin = authService.getToken();
        debugAuth('After login state', { tokenSet: !!tokenAfterLogin });
        
        return { success: true };
      }
      
      debugAuth('Login failed', { error: response.error });
      return { success: false, error: response.error };
    } catch (error) {
      console.error('Login error:', error);
      debugAuth('Login error', { error: error.message });
      return { success: false, error };
    }
  };

  const logout = async () => {
    debugAuth('Logout started');
    try {
      await authService.logout();
      debugAuth('Logout API call successful');
      authService.clearStorage();
      debugAuth('Storage cleared');
      setUser(null);
      setIsAuthenticated(false);
      debugAuth('Auth state reset');
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      debugAuth('Logout error', { error: error.message });
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
        // Ensure we're updating the complete user object including isAdmin
        setUser(response.user);
        return { success: true };
      }
      return { success: false, error: response.error };
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, error };
    }
  };

  // Derived state: true only when auth is fully resolved
  const isAuthResolved = !isLoading && user !== null && isAuthenticated !== undefined;

  const value = {
    user,
    isAuthenticated,
    isLoading,
    isAuthResolved, // <-- add this
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