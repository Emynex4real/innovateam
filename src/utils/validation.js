import { VALIDATION_RULES } from '../config/constants';

/**
 * Input validation and sanitization utilities
 */

/**
 * Sanitize string input to prevent XSS and log injection
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  // Enhanced XSS protection
  return input
    .trim()
    .replace(/[<>"'&]/g, (match) => {
      const entities = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '&': '&amp;'
      };
      return entities[match];
    })
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/data:text\/html/gi, '') // Remove data URLs
    .replace(/vbscript:/gi, '') // Remove vbscript
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '') // Remove iframes
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '') // Remove objects
    .replace(/<embed\b[^<]*>/gi, '') // Remove embeds
    .replace(/[\r\n\t]/g, ' ') // Replace line breaks with spaces
    .substring(0, 1000); // Limit length to prevent DoS
};

/**
 * Sanitize for logging - prevents log injection
 */
export const sanitizeForLog = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/[\r\n\t]/g, '_') // Replace line breaks/tabs with underscores
    .replace(/[<>\"'&]/g, '') // Remove potentially dangerous characters
    .substring(0, 200); // Limit length for logs
};

/**
 * Validate email format
 */
export const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  return VALIDATION_RULES.EMAIL_PATTERN.test(email.trim());
};

/**
 * Validate password strength
 */
export const isValidPassword = (password) => {
  if (!password || typeof password !== 'string') return false;
  return password.length >= VALIDATION_RULES.PASSWORD_MIN_LENGTH;
};

/**
 * Validate password with strength requirements
 */
export const isStrongPassword = (password) => {
  if (!password || typeof password !== 'string') return false;
  return VALIDATION_RULES.PASSWORD_PATTERN.test(password);
};

/**
 * Validate phone number
 */
export const isValidPhone = (phone) => {
  if (!phone || typeof phone !== 'string') return false;
  return VALIDATION_RULES.PHONE_PATTERN.test(phone.trim());
};

/**
 * Validate required fields
 */
export const validateRequired = (fields, data) => {
  const errors = {};
  
  fields.forEach(field => {
    if (!data[field] || (typeof data[field] === 'string' && !data[field].trim())) {
      errors[field] = `${field} is required`;
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate user registration data
 */
export const validateRegistrationData = (userData) => {
  const errors = {};
  
  // Required fields
  if (!userData.email || !userData.email.trim()) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(userData.email)) {
    errors.email = 'Invalid email format';
  }
  
  if (!userData.password) {
    errors.password = 'Password is required';
  } else if (!isValidPassword(userData.password)) {
    errors.password = `Password must be at least ${VALIDATION_RULES.PASSWORD_MIN_LENGTH} characters`;
  }
  
  if (!userData.name || !userData.name.trim()) {
    errors.name = 'Name is required';
  } else if (userData.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters';
  }
  
  // Optional phone validation
  if (userData.phone && !isValidPhone(userData.phone)) {
    errors.phone = 'Invalid phone number format';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate login data
 */
export const validateLoginData = (credentials) => {
  const errors = {};
  
  if (!credentials.email || !credentials.email.trim()) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(credentials.email)) {
    errors.email = 'Invalid email format';
  }
  
  if (!credentials.password) {
    errors.password = 'Password is required';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Sanitize user data for API requests
 */
export const sanitizeUserData = (userData) => {
  const sanitized = {};
  
  Object.keys(userData).forEach(key => {
    const value = userData[key];
    
    if (typeof value === 'string') {
      // Don't sanitize password fields
      if (key.toLowerCase().includes('password')) {
        sanitized[key] = value;
      } else {
        sanitized[key] = sanitizeInput(value);
      }
    } else {
      sanitized[key] = value;
    }
  });
  
  return sanitized;
};