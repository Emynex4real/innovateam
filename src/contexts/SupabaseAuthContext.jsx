import React, { createContext, useContext, useEffect, useState } from 'react'
import { AuthService } from '../services/supabase'
import supabase from '../config/supabase'
import SessionSecurity, { SecureTokenManager } from '../utils/sessionSecurity'
import logger from '../utils/logger'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState(null)
  const [sessionSecurity] = useState(() => new SessionSecurity())

  useEffect(() => {
    // Initialize session security
    sessionSecurity.init(
      () => handleSessionTimeout(),
      () => handleSessionWarning()
    );

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        // If session is expired or invalid, try to refresh
        if (error || !session) {
          const { data: { session: refreshedSession } } = await supabase.auth.refreshSession()
          
          if (!refreshedSession) {
            // Can't refresh - clear everything
            await supabase.auth.signOut();
            SecureTokenManager.clearToken();
            setSession(null);
            setUser(null);
            setLoading(false);
            return;
          }
          
          setSession(refreshedSession)
          setUser(refreshedSession.user)
          if (refreshedSession.user) {
            loadUserProfile(refreshedSession.user.id)
          }
          setLoading(false)
          return;
        }
        
        // Validate session security
        if (session && !SecureTokenManager.getToken()) {
          // Session exists but no secure token - force logout
          await supabase.auth.signOut();
          setSession(null);
          setUser(null);
          setLoading(false);
          return;
        }
        
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          loadUserProfile(session.user.id)
        }
        
        setLoading(false)
      } catch (err) {
        console.error('Session initialization error:', err)
        await supabase.auth.signOut();
        setSession(null);
        setUser(null);
        setLoading(false);
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Handle token expiration
        if (event === 'TOKEN_REFRESHED') {
          logger.info('Token refreshed successfully');
        }
        
        if (event === 'SIGNED_OUT' || !session) {
          SecureTokenManager.clearToken();
          setSession(null);
          setUser(null);
          setProfile(null);
          setLoading(false);
          return;
        }
        
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          loadUserProfile(session.user.id) // Don't await - load in background
        } else {
          setProfile(null)
        }
        
        setLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
      sessionSecurity.forceLogout()
    }
  }, [])

  // Handle session timeout
  const handleSessionTimeout = async () => {
    logger.security('Session timeout - forcing logout');
    await signOut();
    window.location.href = '/login?reason=timeout';
  };

  // Handle session warning
  const handleSessionWarning = () => {
    // Show warning to user (implement UI notification)
    console.warn('Session will expire in 2 minutes');
  };

  // Extend session
  const extendSession = () => {
    sessionSecurity.extendSession();
  };

  const loadUserProfile = async (userId) => {
    try {
      const result = await AuthService.getUserProfile(userId)
      if (result.success) {
        setProfile(result.data)
      }
    } catch (error) {
      console.error('Error loading user profile:', error)
      // Don't fail if profile loading fails - user can still access dashboard
      setProfile(null)
    }
  }

  const signUp = async (email, password, userData) => {
    setLoading(true)
    try {
      const result = await AuthService.signUp(email, password, userData)
      return result
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email, password) => {
    setLoading(true)
    try {
      const result = await AuthService.signIn(email, password)
      return result
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setLoading(true)
    try {
      const result = await AuthService.signOut()
      if (result.success) {
        setUser(null)
        setProfile(null)
        setSession(null)
        sessionSecurity.forceLogout()
      }
      return result
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (updates) => {
    if (!user) return { success: false, error: 'No user logged in' }
    
    try {
      const result = await AuthService.updateProfile(user.id, updates)
      if (result.success) {
        setProfile(result.data)
      }
      return result
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const resetPassword = async (email) => {
    return await AuthService.resetPassword(email)
  }

  const value = {
    user,
    profile,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    resetPassword,
    extendSession,
    isAuthenticated: !!user,
    isAdmin: profile?.role === 'admin',
    sessionValid: sessionSecurity.isSessionValid()
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider