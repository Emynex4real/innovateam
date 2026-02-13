// CSRF Protection Utility
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

class CSRFProtection {
  constructor() {
    this.token = null;
    this.tokenExpiry = null;
  }

  // Get CSRF token from server
  async getToken() {
    try {
      const response = await fetch(`${API_URL}/api/csrf-token`, {
        method: 'GET',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to get CSRF token');
      }
      
      const data = await response.json();
      this.token = data.csrfToken;
      this.tokenExpiry = Date.now() + (5 * 60 * 1000); // 5 minutes
      return this.token;
    } catch (error) {
      console.error('CSRF token fetch error:', error);
      return null;
    }
  }

  // Get valid token (always fetch fresh - tokens are one-time use on the server)
  async getValidToken() {
    await this.getToken();
    return this.token;
  }

  // Add CSRF token to request headers
  async addTokenToHeaders(headers = {}) {
    const token = await this.getValidToken();
    if (token) {
      headers['x-csrf-token'] = token;
    }
    return headers;
  }

  // Add CSRF token to form data
  async addTokenToFormData(formData) {
    const token = await this.getValidToken();
    if (token) {
      formData.append('_csrf', token);
    }
    return formData;
  }
}

// Create singleton instance
const csrfProtection = new CSRFProtection();

export default csrfProtection;