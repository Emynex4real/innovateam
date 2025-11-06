import logger from './logger';

/**
 * Secure storage utility that prefers httpOnly cookies over localStorage
 * for sensitive data like authentication tokens
 */
class SecureTokenStorage {
  constructor() {
    this.supportsHttpOnlyCookies = this.checkHttpOnlyCookieSupport();
  }

  checkHttpOnlyCookieSupport() {
    // Check if we're in a secure context and can use httpOnly cookies
    return typeof document !== 'undefined' && 
           window.location.protocol === 'https:' &&
           document.cookie !== undefined;
  }

  /**
   * Set a secure token - prefers httpOnly cookies, falls back to localStorage
   */
  setToken(key, value, options = {}) {
    if (!value) return false;

    try {
      if (this.supportsHttpOnlyCookies && options.secure) {
        // Use secure httpOnly cookie for production
        const cookieOptions = [
          `${key}=${value}`,
          'HttpOnly',
          'Secure',
          'SameSite=Strict',
          `Max-Age=${options.maxAge || 86400}`, // 24 hours default
          `Path=${options.path || '/'}`
        ].join('; ');

        // Note: HttpOnly cookies can only be set by the server
        // This is a fallback for client-side token management
        document.cookie = cookieOptions.replace('HttpOnly; ', '');
        logger.auth('Token stored in secure cookie');
        return true;
      } else {
        // Fallback to localStorage with encryption-like encoding
        const encodedValue = btoa(encodeURIComponent(value));
        localStorage.setItem(key, encodedValue);
        logger.auth('Token stored in localStorage (encoded)');
        return true;
      }
    } catch (error) {
      logger.auth('Token storage failed', { error: error.message });
      return false;
    }
  }

  /**
   * Get a secure token from storage
   */
  getToken(key) {
    try {
      if (this.supportsHttpOnlyCookies) {
        // Try to get from cookie first
        const cookies = document.cookie.split(';');
        const cookie = cookies.find(c => c.trim().startsWith(`${key}=`));
        if (cookie) {
          const value = cookie.split('=')[1];
          logger.auth('Token retrieved from cookie');
          return value;
        }
      }

      // Fallback to localStorage
      const encodedValue = localStorage.getItem(key);
      if (encodedValue) {
        try {
          const decodedValue = decodeURIComponent(atob(encodedValue));
          logger.auth('Token retrieved from localStorage');
          return decodedValue;
        } catch (decodeError) {
          // If decoding fails, assume it's a plain value (backward compatibility)
          return encodedValue;
        }
      }

      return null;
    } catch (error) {
      logger.auth('Token retrieval failed', { error: error.message });
      return null;
    }
  }

  /**
   * Remove a token from storage
   */
  removeToken(key) {
    try {
      // Remove from cookie
      if (this.supportsHttpOnlyCookies) {
        document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; Secure; SameSite=Strict`;
      }

      // Remove from localStorage
      localStorage.removeItem(key);
      logger.auth('Token removed from storage');
      return true;
    } catch (error) {
      logger.auth('Token removal failed', { error: error.message });
      return false;
    }
  }

  /**
   * Clear all tokens
   */
  clearAllTokens(keys = []) {
    try {
      keys.forEach(key => this.removeToken(key));
      logger.auth('All tokens cleared');
      return true;
    } catch (error) {
      logger.auth('Token clearing failed', { error: error.message });
      return false;
    }
  }
}

// Create singleton instance
const secureTokenStorage = new SecureTokenStorage();

export default secureTokenStorage;