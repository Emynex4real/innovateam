// src/contexts/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { 
  LOCAL_STORAGE_KEYS,
  SUCCESS_MESSAGES, 
  ERROR_MESSAGES 
} from '../config/constants';
import authService from '../services/auth.service';
import Loading from '../components/Loading';
import logger from '../utils/logger';

import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.REACT_APP_SUPABASE_URL, process.env.REACT_APP_SUPABASE_KEY);

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
      logger.auth('Starting auth check');
      try {
        // Always get latest from localStorage
        const token = localStorage.getItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN);
        const userStr = localStorage.getItem(LOCAL_STORAGE_KEYS.USER);
        const refreshToken = localStorage.getItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN);
        const storedUser = userStr ? JSON.parse(userStr) : null;
        logger.auth('Current auth state');

        // If all are present, validate token
        if (token && storedUser && refreshToken) {
          logger.auth('Validating token');
          try {
            const isValid = await authService.validateToken();
            logger.auth('Token validation result');
            if (isValid && isMounted) {
              // Ensure user object has role and isAdmin
              let validatedUser = authService.getUser();
              if (validatedUser && (!validatedUser.role || typeof validatedUser.isAdmin === 'undefined')) {
                validatedUser.role = validatedUser.role || 'user';
                validatedUser.isAdmin = validatedUser.role === 'admin';
                authService.setUser(validatedUser);
              }
              setUser(validatedUser);
              setIsAuthenticated(true);
              setIsLoading(false);
              logger.auth('Auth state after validation');
              return;
            } else {
              logger.auth('Token invalid, trying refresh');
            }
          } catch (validationError) {
            logger.auth('Token validation error');
            // Try refresh if not already retried
            if (refreshToken && retryCount < MAX_RETRIES) {
              retryCount++;
              logger.auth('Attempting token refresh');
              const refreshResult = await authService.refreshToken();
              logger.auth('Refresh result');
              if (refreshResult?.success && isMounted) {
                // Ensure user object has role and isAdmin
                let refreshedUser = refreshResult.user;
                if (refreshedUser && (!refreshedUser.role || typeof refreshedUser.isAdmin === 'undefined')) {
                  refreshedUser.role = refreshedUser.role || 'user';
                  refreshedUser.isAdmin = refreshedUser.role === 'admin';
                  authService.setUser(refreshedUser);
                }
                setUser(refreshedUser);
                setIsAuthenticated(true);
                setIsLoading(false);
                authService.logAuthStorageState('after AuthContext refresh');
                logger.auth('Auth state after refresh');
                return;
              } else {
                logger.auth('Refresh failed');
              }
            }
          }
        }

        // If we have a refresh token but no auth token, try to refresh
        if ((!token || !storedUser) && refreshToken) {
          logger.auth('Missing token/user, attempting refresh');
          const refreshResult = await authService.refreshToken();
          logger.auth('Refresh result (no token/user)');
          if (refreshResult?.success && isMounted) {
            let refreshedUser = refreshResult.user;
            if (refreshedUser && (!refreshedUser.role || typeof refreshedUser.isAdmin === 'undefined')) {
              refreshedUser.role = refreshedUser.role || 'user';
              refreshedUser.isAdmin = refreshedUser.role === 'admin';
              authService.setUser(refreshedUser);
            }
            setUser(refreshedUser);
            setIsAuthenticated(true);
            setIsLoading(false);
            logger.auth('Auth state after refresh');
            return;
          } else {
            logger.auth('Refresh failed (no token/user)');
          }
        }

        // If we get here, clear everything
        logger.auth('Auth state invalid, clearing');
        authService.clearStorage();
        setUser(null);
        setIsAuthenticated(false);
        setIsLoading(false);
      } catch (error) {
        logger.auth('Fatal error during auth check');
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
      logger.auth('Storage change detected');
      
      // Get current state directly from localStorage
      const currentToken = localStorage.getItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN);
      const currentUser = localStorage.getItem(LOCAL_STORAGE_KEYS.USER);
      const currentRefreshToken = localStorage.getItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN);
      
      // Log current auth state
      logger.auth('Current auth state');
      
      // If we have a refresh token but no auth token, try to refresh
      if (!currentToken && currentRefreshToken && currentUser) {
        logger.auth('Auth token missing, attempting refresh');
        checkAuth();
        return;
      }
      
      // Only proceed with logout if all auth data is missing
      const allAuthDataMissing = !currentToken && !currentUser && !currentRefreshToken;
      
      if (allAuthDataMissing) {
        logger.auth('All auth data missing, logging out');
        authService.clearStorage();
        setUser(null);
        setIsAuthenticated(false);
        setIsLoading(false);
      } else {
        // If we still have some auth data, revalidate the session
        logger.auth('Partial auth data exists, revalidating');
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
  logger.auth('Login attempt started');
  try {
    // Step 1: Supabase Auth login (directly get session/token)
    const { email, password } = credentials;
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) {
      logger.auth('Supabase Auth login failed', error);
      return { success: false, error: error?.message || 'Invalid credentials' };
    }
    const accessToken = data.session?.access_token;
    if (!accessToken) {
      logger.auth('No access token after Supabase login');
      return { success: false, error: 'No access token after login' };
    }
    // Step 2: Check if user profile exists
    let profileRes = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/profile/me`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    if (profileRes.status === 404) {
      // Step 3: If not, create it
      logger.auth('Profile not found, creating profile');
      profileRes = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ name: data.user.user_metadata?.name || '', phone_number: data.user.user_metadata?.phone_number || '' })
      });
      const profileData = await profileRes.json();
      if (!profileData.success) {
        logger.auth('Failed to create profile', profileData.error);
        return { success: false, error: profileData.message || 'Failed to create user profile' };
      }
      logger.auth('Profile created successfully');
    }
    // Step 4: Call backend login endpoint to get app tokens and user info
    const backendLoginRes = await authService.login({ email, password });
    logger.auth('Backend login response', backendLoginRes);
    if (backendLoginRes.success) {
      let loginUser = backendLoginRes.user;
      if (loginUser && (!loginUser.role || typeof loginUser.isAdmin === 'undefined')) {
        loginUser.role = loginUser.role || 'user';
        loginUser.isAdmin = loginUser.role === 'admin';
        authService.setUser(loginUser);
      }
      setUser(loginUser);
      setIsAuthenticated(true);
      if (rememberMe) {
        logger.auth('Setting remember me');
        authService.setRememberMe(true);
      }
      logger.auth('Login successful, updating auth state');
      return { success: true };
    } else {
      logger.auth('Backend login failed', backendLoginRes.error);
      return { success: false, error: backendLoginRes.error };
    }
  } catch (error) {
    console.error('Login error:', error);
    logger.auth('Auth state invalid, clearing');
    authService.clearStorage();
    setUser(null);
    setIsAuthenticated(false);
    logger.auth('Auth state reset');
    return { success: false, error: error?.message || 'Login error' };
  }
};

  const register = async (userData) => {
  try {
    // Step 1: Register with Supabase Auth
    const { email, password, name, phoneNumber } = userData;
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      return { success: false, error: error.message };
    }
    // If email confirmation is required, data.session may be null
    const accessToken = data.session?.access_token;
    if (!accessToken) {
      // Email confirmation required, cannot create profile yet
      return { success: true, info: 'Please check your email to confirm your account. After confirming, please log in.' };
    }
    // Step 2: Call backend to store extra user info
    const profileRes = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({ name, phone_number: phoneNumber })
    });
    const profileData = await profileRes.json();
    if (!profileData.success) {
      return { success: false, error: profileData.message || 'Failed to create user profile' };
    }
    return { success: true };
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, error: error.message };
  }
};

// --- Helper: Check if user profile exists ---
const checkOrCreateUserProfile = async (user, accessToken, { name, phoneNumber }) => {
  try {
    // 1. Check if profile exists in users table
    const res = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/profile/me`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    const data = await res.json();
    if (data.success && data.profile) {
      return { success: true, user: data.profile };
    }
    // 2. If not, create it
    const profileRes = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({ name: name || user?.user_metadata?.name, phone_number: phoneNumber || user?.user_metadata?.phone_number })
    });
    const profileData = await profileRes.json();
    if (!profileData.success) {
      return { success: false, error: profileData.message || 'Failed to create user profile' };
    }
    return { success: true, user: profileData.profile };
  } catch (error) {
    return { success: false, error: error.message };
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

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setIsAuthenticated(false);
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error };
    }
  };

  const forgotPassword = async (email) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (error) {
      console.error('Forgot password error:', error);
      return { success: false, error };
    }
  };

  const resetPassword = async (accessToken, newPassword) => {
    try {
      const { data, error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (error) {
      console.error('Reset password error:', error);
      return { success: false, error };
    }
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    isAuthResolved,
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