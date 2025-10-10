// CSRF Protection Utility
class CSRFProtection {
  constructor() {
    this.tokenKey = 'csrf_token';
    this.headerName = 'X-CSRF-Token';
  }

  // Generate CSRF token
  generateToken() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    const token = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    sessionStorage.setItem(this.tokenKey, token);
    return token;
  }

  // Get current CSRF token
  getToken() {
    let token = sessionStorage.getItem(this.tokenKey);
    if (!token) {
      token = this.generateToken();
    }
    return token;
  }

  // Add CSRF token to request headers
  addTokenToHeaders(headers = {}) {
    return {
      ...headers,
      [this.headerName]: this.getToken()
    };
  }

  // Validate CSRF token
  validateToken(token) {
    const storedToken = sessionStorage.getItem(this.tokenKey);
    return storedToken && storedToken === token;
  }

  // Clear CSRF token
  clearToken() {
    sessionStorage.removeItem(this.tokenKey);
  }
}

export const csrfProtection = new CSRFProtection();
export default csrfProtection;