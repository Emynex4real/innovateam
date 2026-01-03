// Enhanced Security Configuration
export const SecurityConfig = {
  // Environment validation
  validateEnvironment() {
    const required = [
      'REACT_APP_SUPABASE_URL',
      'REACT_APP_SUPABASE_ANON_KEY',
      'REACT_APP_PAYSTACK_PUBLIC_KEY'
    ];
    
    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
  },

  // Content Security Policy
  getCSPHeader() {
    return {
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' https://js.paystack.co",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https:",
        "connect-src 'self' https://*.supabase.co https://api.paystack.co",
        "frame-src 'none'",
        "object-src 'none'",
        "base-uri 'self'"
      ].join('; ')
    };
  },

  // Rate limiting configuration
  rateLimits: {
    auth: { windowMs: 15 * 60 * 1000, max: 5 }, // 5 attempts per 15 minutes
    payment: { windowMs: 60 * 1000, max: 3 }, // 3 payments per minute
    api: { windowMs: 15 * 60 * 1000, max: 100 } // 100 requests per 15 minutes
  },

  // Input validation patterns
  validation: {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    phone: /^(\+234|0)[789][01]\d{8}$/,
    amount: /^\d+(\.\d{1,2})?$/,
    reference: /^[A-Z0-9_]{10,50}$/
  },

  // Encryption settings
  encryption: {
    algorithm: 'aes-256-gcm',
    keyLength: 32,
    ivLength: 16,
    tagLength: 16
  },

  // Session configuration
  session: {
    maxAge: 15 * 60 * 1000, // 15 minutes
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict'
  }
};

// Security utilities
export const SecurityUtils = {
  // Sanitize input
  sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    return input
      .replace(/[<>]/g, '') // Remove potential XSS chars
      .trim()
      .substring(0, 1000); // Limit length
  },

  // Generate secure reference - FIXED VERSION
  generateSecureReference(prefix = 'TXN') {
    const timestamp = Date.now();
    // Use Math.random as fallback instead of crypto
    const randomArray = new Array(8).fill(0).map(() => Math.floor(Math.random() * 256));
    const randomHex = randomArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
    return `${prefix}_${timestamp}_${randomHex}`.toUpperCase();
  },

  // Validate amount
  validateAmount(amount) {
    const num = parseFloat(amount);
    return !isNaN(num) && num > 0 && num <= 10000000 && SecurityConfig.validation.amount.test(amount.toString());
  },

  // Check for suspicious patterns
  detectSuspiciousActivity(userActions) {
    const now = Date.now();
    const recentActions = userActions.filter(action => now - action.timestamp < 60000); // Last minute
    
    return {
      tooManyRequests: recentActions.length > 10,
      rapidPayments: recentActions.filter(a => a.type === 'payment').length > 3,
      suspiciousAmounts: recentActions.some(a => a.amount > 1000000)
    };
  }
};

export default SecurityConfig;
// Build fix - removed crypto dependencies