// Client-Side Security utilities
import CryptoJS from 'crypto-js';

class ClientSecurityManager {
  constructor() {
    this.cspViolations = [];
    this.setupCSP();
  }

  // Content Security Policy setup
  setupCSP() {
    if (typeof window !== 'undefined') {
      // Listen for CSP violations
      document.addEventListener('securitypolicyviolation', (e) => {
        this.cspViolations.push({
          directive: e.violatedDirective,
          blockedURI: e.blockedURI,
          timestamp: new Date().toISOString()
        });
        console.warn('CSP Violation:', e.violatedDirective, e.blockedURI);
      });
    }
  }

  // DOM XSS protection
  sanitizeHTML(html) {
    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
  }

  // Secure local storage with encryption
  setSecureItem(key, value) {
    try {
      const encrypted = CryptoJS.AES.encrypt(
        JSON.stringify(value), 
        this.getStorageKey()
      ).toString();
      sessionStorage.setItem(`sec_${key}`, encrypted);
    } catch (error) {
      console.error('Secure storage failed:', error);
    }
  }

  getSecureItem(key) {
    try {
      const encrypted = sessionStorage.getItem(`sec_${key}`);
      if (!encrypted) return null;
      
      const decrypted = CryptoJS.AES.decrypt(encrypted, this.getStorageKey());
      return JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
    } catch (error) {
      console.error('Secure retrieval failed:', error);
      return null;
    }
  }

  removeSecureItem(key) {
    sessionStorage.removeItem(`sec_${key}`);
  }

  // Generate storage encryption key
  getStorageKey() {
    let key = sessionStorage.getItem('_sk');
    if (!key) {
      key = CryptoJS.lib.WordArray.random(256/8).toString();
      sessionStorage.setItem('_sk', key);
    }
    return key;
  }

  // Clickjacking protection
  preventClickjacking() {
    if (window.top !== window.self) {
      window.top.location = window.self.location;
    }
  }

  // Input validation for forms
  validateInput(input, type) {
    const patterns = {
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      phone: /^\+?[\d\s-()]{10,}$/,
      amount: /^\d+(\.\d{1,2})?$/,
      text: /^[a-zA-Z0-9\s.,!?-]+$/
    };

    if (!patterns[type]) return true;
    return patterns[type].test(input);
  }

  // Clear sensitive data on page unload
  setupDataClearing() {
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        // Clear sensitive session data
        const sensitiveKeys = ['sec_wallet', 'sec_auth', 'sec_payment'];
        sensitiveKeys.forEach(key => {
          sessionStorage.removeItem(key);
        });
      });
    }
  }
}

export const clientSecurity = new ClientSecurityManager();