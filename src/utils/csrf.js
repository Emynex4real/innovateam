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
   * Fetch CSRF token from server
   */
  async fetchTokenFromServer() {
    try {
      const response = await fetch('/api/csrf-token', {
        method: 'GET',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch CSRF token');
      }
      
      const data = await response.json();
      this.token = data.csrfToken;
      this.tokenExpiry = Date.now() + this.TOKEN_LIFETIME;
      
      logger.auth('CSRF token fetched from server');
      return this.token;
    } catch (error) {
      logger.auth('CSRF token fetch failed', { error: error.message });
      return null;
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
   * Get current CSRF token, fetch new one if expired
   */
  async getToken() {
    if (!this.token || !this.tokenExpiry || Date.now() > this.tokenExpiry) {
      return await this.fetchTokenFromServer();
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
  async getTokenForHeader() {
    const token = await this.getToken();
    return token ? { 'x-csrf-token': token } : {};
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