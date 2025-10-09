// API Security utilities
import CryptoJS from 'crypto-js';

class APISecurityManager {
  constructor() {
    this.requestQueue = new Map();
    this.rateLimits = new Map();
  }

  // Generate secure request signature
  generateSignature(method, url, body, timestamp) {
    const payload = `${method}${url}${JSON.stringify(body || {})}${timestamp}`;
    return CryptoJS.HmacSHA256(payload, process.env.REACT_APP_API_SECRET || 'fallback-secret').toString();
  }

  // Add security headers to requests
  addSecurityHeaders(headers = {}) {
    const timestamp = Date.now().toString();
    const nonce = CryptoJS.lib.WordArray.random(16).toString();
    
    return {
      ...headers,
      'X-Timestamp': timestamp,
      'X-Nonce': nonce,
      'X-Client-Version': process.env.REACT_APP_VERSION || '1.0.0',
      'Content-Type': 'application/json'
    };
  }

  // Validate response integrity
  validateResponse(response, expectedSignature) {
    if (!response || !expectedSignature) return false;
    
    const computedSignature = CryptoJS.HmacSHA256(
      JSON.stringify(response), 
      process.env.REACT_APP_API_SECRET || 'fallback-secret'
    ).toString();
    
    return computedSignature === expectedSignature;
  }

  // Rate limiting check
  checkRateLimit(endpoint, limit = 10, window = 60000) {
    const now = Date.now();
    const key = `${endpoint}_${Math.floor(now / window)}`;
    
    const current = this.rateLimits.get(key) || 0;
    if (current >= limit) {
      throw new Error('Rate limit exceeded');
    }
    
    this.rateLimits.set(key, current + 1);
    return true;
  }

  // Sanitize request data
  sanitizeRequest(data) {
    if (typeof data !== 'object' || data === null) return data;
    
    const sanitized = {};
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string') {
        sanitized[key] = value.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
      } else if (typeof value === 'object') {
        sanitized[key] = this.sanitizeRequest(value);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }
}

export const apiSecurity = new APISecurityManager();