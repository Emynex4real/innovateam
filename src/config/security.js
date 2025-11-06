/**
 * Security configuration and utilities
 */

// Content Security Policy configuration
export const CSP_CONFIG = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-inline'", 'https://apis.google.com'],
  'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
  'font-src': ["'self'", 'https://fonts.gstatic.com'],
  'img-src': ["'self'", 'data:', 'https:'],
  'connect-src': ["'self'", 'https://innovateam-api.onrender.com', 'https://innovateam-api.onrender.com/api', 'http://localhost:5000'],
  'frame-ancestors': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"]
};

// Security headers configuration
export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
};

// Rate limiting configuration
export const RATE_LIMITS = {
  LOGIN: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per window
    message: 'Too many login attempts, please try again later'
  },
  REGISTRATION: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 registrations per hour
    message: 'Too many registration attempts, please try again later'
  },
  PASSWORD_RESET: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 password reset attempts per hour
    message: 'Too many password reset attempts, please try again later'
  },
  API: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
    message: 'Too many requests, please try again later'
  }
};

// Input validation patterns
export const VALIDATION_PATTERNS = {
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  PHONE: /^\+?[1-9]\d{1,14}$/,
  NAME: /^[a-zA-Z\s'-]{2,50}$/,
  USERNAME: /^[a-zA-Z0-9_-]{3,20}$/
};

// File upload security configuration
export const FILE_UPLOAD_CONFIG = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: {
    IMAGE: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    DOCUMENT: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ]
  },
  SCAN_FOR_MALWARE: true,
  QUARANTINE_SUSPICIOUS: true
};

// Session configuration
export const SESSION_CONFIG = {
  TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours
  REFRESH_THRESHOLD: 5 * 60 * 1000, // 5 minutes before expiry
  MAX_CONCURRENT_SESSIONS: 3,
  SECURE_COOKIES: process.env.NODE_ENV === 'production',
  SAME_SITE: 'strict'
};

// CSRF configuration
export const CSRF_CONFIG = {
  TOKEN_LENGTH: 64,
  TOKEN_LIFETIME: 30 * 60 * 1000, // 30 minutes
  HEADER_NAME: 'X-CSRF-Token',
  COOKIE_NAME: 'csrf_token'
};

// Encryption configuration
export const ENCRYPTION_CONFIG = {
  ALGORITHM: 'AES-256-GCM',
  KEY_LENGTH: 32,
  IV_LENGTH: 16,
  TAG_LENGTH: 16,
  SALT_LENGTH: 32
};

// Security monitoring configuration
export const MONITORING_CONFIG = {
  LOG_FAILED_ATTEMPTS: true,
  LOG_SUCCESSFUL_LOGINS: true,
  LOG_PRIVILEGE_ESCALATIONS: true,
  LOG_SUSPICIOUS_ACTIVITIES: true,
  ALERT_THRESHOLD: {
    FAILED_LOGINS: 10, // Alert after 10 failed logins
    UNUSUAL_LOCATIONS: 3, // Alert after 3 logins from new locations
    RAPID_REQUESTS: 1000 // Alert after 1000 requests in short time
  }
};

// Trusted domains for CORS
export const TRUSTED_DOMAINS = [
  'localhost:3000',
  'localhost:5000',
  'your-domain.com',
  'your-api-domain.com'
];

// Security utility functions
export const SecurityUtils = {
  // Generate secure random string
  generateSecureRandom: (length = 32) => {
    if (window.crypto && window.crypto.getRandomValues) {
      const array = new Uint8Array(length);
      window.crypto.getRandomValues(array);
      return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }
    // Fallback for older browsers
    return Array.from({ length }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  },

  // Check if origin is trusted
  isTrustedOrigin: (origin) => {
    if (!origin) return false;
    const hostname = new URL(origin).hostname;
    return TRUSTED_DOMAINS.some(domain => 
      hostname === domain || hostname.endsWith(`.${domain}`)
    );
  },

  // Validate file type
  isAllowedFileType: (file, category = 'IMAGE') => {
    const allowedTypes = FILE_UPLOAD_CONFIG.ALLOWED_TYPES[category] || [];
    return allowedTypes.includes(file.type);
  },

  // Check file size
  isValidFileSize: (file, maxSize = FILE_UPLOAD_CONFIG.MAX_SIZE) => {
    return file.size <= maxSize;
  },

  // Generate CSP header value
  generateCSPHeader: () => {
    return Object.entries(CSP_CONFIG)
      .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
      .join('; ');
  },

  // Validate password strength
  validatePasswordStrength: (password) => {
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      special: /[@$!%*?&]/.test(password)
    };

    const score = Object.values(checks).filter(Boolean).length;
    
    return {
      isValid: score >= 4,
      score,
      checks,
      strength: score < 3 ? 'weak' : score < 5 ? 'medium' : 'strong'
    };
  },

  // Check for common passwords
  isCommonPassword: (password) => {
    const commonPasswords = [
      'password', '123456', '123456789', 'qwerty', 'abc123',
      'password123', 'admin', 'letmein', 'welcome', 'monkey'
    ];
    return commonPasswords.includes(password.toLowerCase());
  },

  // Generate secure session ID
  generateSessionId: () => {
    return SecurityUtils.generateSecureRandom(64);
  },

  // Validate session
  isValidSession: (sessionData) => {
    if (!sessionData || !sessionData.createdAt) return false;
    
    const now = Date.now();
    const sessionAge = now - new Date(sessionData.createdAt).getTime();
    
    return sessionAge < SESSION_CONFIG.TIMEOUT;
  }
};

export default {
  CSP_CONFIG,
  SECURITY_HEADERS,
  RATE_LIMITS,
  VALIDATION_PATTERNS,
  FILE_UPLOAD_CONFIG,
  SESSION_CONFIG,
  CSRF_CONFIG,
  ENCRYPTION_CONFIG,
  MONITORING_CONFIG,
  TRUSTED_DOMAINS,
  SecurityUtils
};