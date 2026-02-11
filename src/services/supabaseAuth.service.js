import supabase from '../config/supabase';
import { LOCAL_STORAGE_KEYS } from '../config/constants';
import logger from '../utils/logger';
import { storeUserData } from '../utils/authStorage';

// Admin users are now managed through Supabase auth + user_profiles.role
// No hardcoded passwords for security

class SupabaseAuthService {
  async register(userData) {
    try {
      logger.auth('Registration attempt started');
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            full_name: userData.fullName || userData.name,
            role: userData.role || 'student'
          }
        }
      });

      if (authError) throw authError;

      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          id: authData.user.id,
          email: userData.email,
          full_name: userData.fullName || userData.name,
          wallet_balance: 0,
          role: userData.role || 'student',
          status: 'active'
        }, { onConflict: 'id' });

      if (profileError) {
        console.warn('Profile creation failed:', profileError);
      }

      logger.auth('Registration successful');
      return { 
        success: true, 
        user: {
          id: authData.user.id,
          email: authData.user.email,
          name: userData.fullName || userData.name,
          role: userData.role || 'student',
          isAdmin: false
        }
      };
    } catch (error) {
      logger.auth('Registration failed', error);
      return { success: false, error: error.message };
    }
  }

  async login(credentials) {
    try {
      logger.auth('Login attempt started');
      
      if (!credentials.email || !credentials.password) {
        throw new Error('Email and password are required');
      }

      const email = credentials.email.toLowerCase().trim();
      const password = credentials.password.trim();

      if (password.length === 0) {
        throw new Error('Password cannot be empty');
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Invalid email or password');
        }
        if (error.message.includes('Email not confirmed')) {
          throw new Error('Please verify your email address');
        }
        throw new Error('Login failed: ' + error.message);
      }

      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        console.warn('Profile fetch failed:', profileError);
      }

      const walletBalance = profile?.wallet_balance || 0;
      
      const user = {
        id: data.user.id,
        email: data.user.email,
        name: profile?.full_name || data.user.user_metadata?.full_name || 'User',
        role: profile?.role || 'student',
        isAdmin: profile?.role === 'admin',
        walletBalance: walletBalance
      };

      this.setUser(user);
      this.setToken(data.session.access_token);
      
      localStorage.setItem('wallet_balance', String(walletBalance));
      localStorage.setItem('confirmedUser', JSON.stringify(user));
      
      logger.auth('Supabase login successful');
      return { success: true, user };
    } catch (error) {
      logger.auth('Login failed', error);
      return { success: false, error: error.message || 'Invalid email or password' };
    }
  }

  async logout() {
    try {
      await supabase.auth.signOut();
      this.clearStorage();
      logger.auth('Logout successful');
      return { success: true };
    } catch (error) {
      this.clearStorage();
      logger.auth('Logout error', error);
      return { success: true };
    }
  }

  setUser(user) {
    return storeUserData(user);
  }

  setToken(token) {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN, token);
      return true;
    } catch (error) {
      logger.auth('Failed to store token', error);
      return false;
    }
  }

  getUser() {
    try {
      const userString = localStorage.getItem(LOCAL_STORAGE_KEYS.USER);
      return userString ? JSON.parse(userString) : null;
    } catch (error) {
      return null;
    }
  }

  getToken() {
    try {
      return localStorage.getItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN);
    } catch (error) {
      return null;
    }
  }

  clearStorage() {
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.USER);
      localStorage.removeItem('confirmedUser');
      localStorage.removeItem('wallet_balance');
    } catch (error) {
      logger.auth('Failed to clear storage', error);
    }
  }

  async validateToken() {
    try {
      const token = this.getToken();
      if (!token) return false;

      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/auth/validate`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include'
      });

      if (!response.ok) return false;
      const data = await response.json();
      return data.success && data.valid;
    } catch {
      return false;
    }
  }

  isAuthenticated() {
    return !!this.getToken();
  }
}

const supabaseAuthService = new SupabaseAuthService();
export default supabaseAuthService;