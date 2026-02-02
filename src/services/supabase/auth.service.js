import supabase from '../../config/supabase'
import PasswordValidator from '../../utils/passwordValidation'
import { AuthRateLimiter } from '../../utils/rateLimiter'
import { SessionFingerprint, SecureTokenManager } from '../../utils/sessionSecurity'
import logger from '../../utils/logger'

export class AuthService {
  // Sign up new user with security validation
  static async signUp(email, password, userData = {}) {
    try {
      // Rate limiting check
      const rateCheck = AuthRateLimiter.checkRegistration();
      if (!rateCheck.allowed) {
        const waitTime = Math.ceil((rateCheck.resetTime - Date.now()) / 60000);
        throw new Error(`Too many registration attempts. Please wait ${waitTime} minutes.`);
      }

      // Password validation
      const passwordCheck = PasswordValidator.validate(password);
      if (!passwordCheck.isValid) {
        throw new Error(passwordCheck.errors[0]);
      }

      // Email validation
      if (!this.validateEmail(email)) {
        throw new Error('Invalid email format');
      }

      // Record attempt
      AuthRateLimiter.recordRegistration();

      const { data, error } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password,
        options: {
          data: {
            full_name: this.sanitizeInput(userData.fullName),
            phone: this.sanitizeInput(userData.phone),
            state_of_origin: this.sanitizeInput(userData.stateOfOrigin)
          }
        }
      })

      if (error) throw error
      
      logger.security('User registration attempt', { email: email.toLowerCase() });
      return { success: true, data }
    } catch (error) {
      logger.security('Registration failed', { error: error.message });
      return { success: false, error: error.message }
    }
  }

  // Sign in user with security checks
  static async signIn(email, password) {
    try {
      // Rate limiting check
      const rateCheck = AuthRateLimiter.checkLogin();
      if (!rateCheck.allowed) {
        const waitTime = Math.ceil((rateCheck.resetTime - Date.now()) / 60000);
        throw new Error(`Too many login attempts. Please wait ${waitTime} minutes.`);
      }

      // Input validation
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      if (!this.validateEmail(email)) {
        throw new Error('Invalid email format');
      }

      // Record attempt
      AuthRateLimiter.recordLogin();

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password
      })

      if (error) {
        logger.security('Login failed', { email: email.toLowerCase(), error: error.message });
        throw error;
      }

      // Clear rate limiting on successful login
      AuthRateLimiter.clearLogin();
      
      // Set secure session
      if (data.session?.access_token) {
        const fingerprint = SessionFingerprint.generate();
        SecureTokenManager.setToken(data.session.access_token, fingerprint);
      }

      logger.security('User login successful', { email: email.toLowerCase() });
      return { success: true, data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // Sign out user
  static async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // Get current user
  static async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) throw error
      return { success: true, user }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // Get user profile
  static async getUserProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // Update user profile
  static async updateProfile(userId, updates) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single()

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // Reset password with rate limiting
  static async resetPassword(email) {
    try {
      // Rate limiting check
      const rateCheck = AuthRateLimiter.checkPasswordReset();
      if (!rateCheck.allowed) {
        const waitTime = Math.ceil((rateCheck.resetTime - Date.now()) / 60000);
        throw new Error(`Too many reset attempts. Please wait ${waitTime} minutes.`);
      }

      if (!this.validateEmail(email)) {
        throw new Error('Invalid email format');
      }

      // Record attempt
      AuthRateLimiter.recordPasswordReset();

      const { error } = await supabase.auth.resetPasswordForEmail(email.toLowerCase().trim())
      if (error) throw error
      
      logger.security('Password reset requested', { email: email.toLowerCase() });
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // Email validation
  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  }

  // Input sanitization
  static sanitizeInput(input) {
    if (!input || typeof input !== 'string') return input;
    return input.trim().substring(0, 100); // Limit length
  }

  // Sign out with cleanup
  static async signOut() {
    try {
      // Clear secure session
      SecureTokenManager.clearToken();
      
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      logger.security('User logout');
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }
}

export default AuthService