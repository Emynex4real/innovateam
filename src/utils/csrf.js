import logger from './logger';

/**
 * CSRF Protection Utility
 * Generates and manages CSRF tokens for state-changing requests
 */
class CSRFProtection {
  constructor() {
    this.token = null;
    this.tokenExpiry = null;
    this.TOKEN_LIFETIME = 30 * 60 * 1000; // 30 minutes
  }

  /**
   * Generate a cryptographically secure CSRF token
   */
  generateToken() {
    try {
      // Use crypto.getRandomValues if available (modern browsers)
      if (window.crypto && window.crypto.getRandomValues) {
        const array = new Uint8Array(32);
        window.crypto.getRandomValues(array);
        const token = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
        
        this.token = token;
        this.tokenExpiry = Date.now() + this.TOKEN_LIFETIME;
        
        logger.auth('CSRF token generated');
        return token;
      } else {
        // Fallback for older browsers
        const token = this.generateFallbackToken();
        this.token = token;
        this.tokenExpiry = Date.now() + this.TOKEN_LIFETIME;
        
        logger.auth('CSRF token generated (fallback)');
        return token;
      }
    } catch (error) {
      logger.auth('CSRF token generation failed', { error: error.message });
      return this.generateFallbackToken();
    }
  }

  /**
   * Fallback token generation for older browsers
   */
  generateFallbackToken() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    
    for (let i = 0; i < 64; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    // Add timestamp to make it unique
    token += Date.now().toString(36);
    
    return token;
  }

  /**
   * Get current CSRF token, generate new one if expired
   */
  getToken() {
    if (!this.token || !this.tokenExpiry || Date.now() > this.tokenExpiry) {
      return this.generateToken();
    }
    
    return this.token;
  }

  /**
   * Validate CSRF token
   */
  validateToken(token) {
    if (!token || !this.token) {
      return false;
    }
    
    // Check if token has expired
    if (Date.now() > this.tokenExpiry) {
      logger.auth('CSRF token expired');
      return false;
    }
    
    // Constant-time comparison to prevent timing attacks
    return this.constantTimeCompare(token, this.token);
  }

  /**
   * Constant-time string comparison to prevent timing attacks
   */
  constantTimeCompare(a, b) {
    if (a.length !== b.length) {
      return false;
    }
    
    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    
    return result === 0;
  }

  /**
   * Clear current token
   */
  clearToken() {
    this.token = null;
    this.tokenExpiry = null;
    logger.auth('CSRF token cleared');
  }

  /**
   * Get token for inclusion in forms
   */
  getTokenForForm() {
    return {
      name: 'csrf_token',
      value: this.getToken()
    };
  }

  /**
   * Get token for inclusion in headers
   */
  getTokenForHeader() {
    return {
      'X-CSRF-Token': this.getToken()
    };
  }

  /**
   * Check if request needs CSRF protection
   */
  needsProtection(method) {
    const protectedMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
    return protectedMethods.includes(method?.toUpperCase());
  }
}

// Create singleton instance
const csrfProtection = new CSRFProtection();

export default csrfProtection;