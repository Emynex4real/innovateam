import supabase from '../config/supabase';
import { LOCAL_STORAGE_KEYS } from '../config/constants';
import logger from '../utils/logger';
import { storeUserData } from '../utils/authStorage';

// Existing admin users for backward compatibility
const adminUsers = [
  {
    id: 'ea0cd6e4-336a-4d05-be79-39887185fe4b',
    email: 'innovateamnigeria@gmail.com',
    password: 'innovateam2024!',
    name: 'Innovateam Nigeria',
    role: 'admin'
  },
  {
    id: 'e98d12a8-0047-41ee-9d84-ab872959efe4',
    email: 'adeejidi@gmail.com',
    password: 'mafon123!',
    name: 'Hei Mafon',
    role: 'admin'
  }
];

class SupabaseAuthService {
  async register(userData) {
    try {
      logger.auth('Registration attempt started');
      
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            full_name: userData.name
          }
        }
      });

      if (authError) throw authError;

      // Create user profile with email
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: authData.user.id,
          email: userData.email,
          full_name: userData.name,
          wallet_balance: 0,
          role: 'user',
          status: 'active'
        });

      if (profileError) {
        console.warn('Profile creation failed:', profileError);
      }

      // Email is now stored in user_profiles table

      logger.auth('Registration successful');
      return { 
        success: true, 
        user: {
          id: authData.user.id,
          email: authData.user.email,
          name: userData.name,
          role: 'user',
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
      
      // Validate input
      if (!credentials.email || !credentials.password) {
        throw new Error('Email and password are required');
      }

      const email = credentials.email.toLowerCase().trim();
      const password = credentials.password.trim();

      if (password.length === 0) {
        throw new Error('Password cannot be empty');
      }

      // First try admin users (backward compatibility)
      const adminUser = adminUsers.find(u => 
        u.email === email && u.password === password
      );
      
      if (adminUser) {
        // Get profile from Supabase
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', adminUser.id)
          .single();

        const user = {
          id: adminUser.id,
          email: adminUser.email,
          name: profile?.full_name || adminUser.name,
          role: 'admin',
          isAdmin: true,
          walletBalance: profile?.wallet_balance || 0
        };

        this.setUser(user);
        this.setToken('admin-token-' + adminUser.id);
        
        logger.auth('Admin login successful');
        return { success: true, user };
      }
      
      // Try Supabase auth for new users
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      });

      if (error) {
        // Provide specific error messages
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Invalid email or password');
        }
        if (error.message.includes('Email not confirmed')) {
          throw new Error('Please verify your email address');
        }
        throw new Error('Login failed: ' + error.message);
      }

      // Get user profile
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      const user = {
        id: data.user.id,
        email: data.user.email,
        name: profile?.full_name || data.user.user_metadata?.full_name || 'User',
        role: profile?.role || 'user',
        isAdmin: profile?.role === 'admin',
        walletBalance: profile?.wallet_balance || 0
      };

      this.setUser(user);
      this.setToken(data.session.access_token);
      
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

  isAuthenticated() {
    return !!this.getToken();
  }
}

const supabaseAuthService = new SupabaseAuthService();
export default supabaseAuthService;