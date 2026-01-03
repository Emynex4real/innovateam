/**
 * Enterprise Input Validation & Sanitization
 * Implements OWASP validation best practices
 */

const validator = require('validator');
const { logger } = require('./logger');

/**
 * Sanitize string input
 */
const sanitizeString = (input, options = {}) => {
  if (typeof input !== 'string') return input;

  let sanitized = input;

  // Trim whitespace
  if (options.trim !== false) {
    sanitized = sanitized.trim();
  }

  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '');

  // Escape HTML if needed
  if (options.escapeHtml) {
    sanitized = validator.escape(sanitized);
  }

  // Remove control characters
  if (options.removeControlChars !== false) {
    sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '');
  }

  // Normalize unicode
  if (options.normalizeUnicode) {
    sanitized = sanitized.normalize('NFC');
  }

  return sanitized;
};

/**
 * Validate and sanitize email
 */
const validateEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return { isValid: false, error: 'Email is required' };
  }

  const sanitized = sanitizeString(email.toLowerCase());

  if (!validator.isEmail(sanitized)) {
    return { isValid: false, error: 'Invalid email format' };
  }

  // Additional checks
  const [localPart, domain] = sanitized.split('@');

  if (localPart.length > 64) {
    return { isValid: false, error: 'Email local part too long' };
  }

  if (domain.length > 255) {
    return { isValid: false, error: 'Email domain too long' };
  }

  // Block disposable email domains
  const disposableDomains = [
    'tempmail.com', 'throwaway.email', '10minutemail.com',
    'guerrillamail.com', 'mailinator.com', 'trashmail.com'
  ];

  if (disposableDomains.some(d => domain.includes(d))) {
    return { isValid: false, error: 'Disposable email addresses are not allowed' };
  }

  return { isValid: true, value: sanitized };
};

/**
 * Validate phone number
 */
const validatePhone = (phone) => {
  if (!phone || typeof phone !== 'string') {
    return { isValid: false, error: 'Phone number is required' };
  }

  const sanitized = phone.replace(/[\s\-\(\)]/g, '');

  if (!validator.isMobilePhone(sanitized, 'any', { strictMode: false })) {
    return { isValid: false, error: 'Invalid phone number format' };
  }

  return { isValid: true, value: sanitized };
};

/**
 * Validate name
 */
const validateName = (name, fieldName = 'Name') => {
  if (!name || typeof name !== 'string') {
    return { isValid: false, error: `${fieldName} is required` };
  }

  const sanitized = sanitizeString(name);

  if (sanitized.length < 2) {
    return { isValid: false, error: `${fieldName} must be at least 2 characters` };
  }

  if (sanitized.length > 100) {
    return { isValid: false, error: `${fieldName} must not exceed 100 characters` };
  }

  // Only allow letters, spaces, hyphens, and apostrophes
  if (!/^[a-zA-Z\s\-']+$/.test(sanitized)) {
    return { isValid: false, error: `${fieldName} contains invalid characters` };
  }

  return { isValid: true, value: sanitized };
};

/**
 * Validate URL
 */
const validateUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return { isValid: false, error: 'URL is required' };
  }

  const sanitized = sanitizeString(url);

  if (!validator.isURL(sanitized, {
    protocols: ['http', 'https'],
    require_protocol: true,
    require_valid_protocol: true
  })) {
    return { isValid: false, error: 'Invalid URL format' };
  }

  // Block localhost and private IPs
  const blockedPatterns = [
    /localhost/i,
    /127\.0\.0\.1/,
    /0\.0\.0\.0/,
    /192\.168\./,
    /10\./,
    /172\.(1[6-9]|2[0-9]|3[0-1])\./
  ];

  if (blockedPatterns.some(pattern => pattern.test(sanitized))) {
    return { isValid: false, error: 'Private URLs are not allowed' };
  }

  return { isValid: true, value: sanitized };
};

/**
 * Validate UUID
 */
const validateUuid = (uuid) => {
  if (!uuid || typeof uuid !== 'string') {
    return { isValid: false, error: 'UUID is required' };
  }

  if (!validator.isUUID(uuid)) {
    return { isValid: false, error: 'Invalid UUID format' };
  }

  return { isValid: true, value: uuid };
};

/**
 * Validate integer
 */
const validateInteger = (value, options = {}) => {
  const num = parseInt(value);

  if (isNaN(num)) {
    return { isValid: false, error: 'Must be a valid integer' };
  }

  if (options.min !== undefined && num < options.min) {
    return { isValid: false, error: `Must be at least ${options.min}` };
  }

  if (options.max !== undefined && num > options.max) {
    return { isValid: false, error: `Must not exceed ${options.max}` };
  }

  return { isValid: true, value: num };
};

/**
 * Validate date
 */
const validateDate = (date, options = {}) => {
  if (!date) {
    return { isValid: false, error: 'Date is required' };
  }

  const dateObj = new Date(date);

  if (isNaN(dateObj.getTime())) {
    return { isValid: false, error: 'Invalid date format' };
  }

  if (options.minDate && dateObj < new Date(options.minDate)) {
    return { isValid: false, error: `Date must be after ${options.minDate}` };
  }

  if (options.maxDate && dateObj > new Date(options.maxDate)) {
    return { isValid: false, error: `Date must be before ${options.maxDate}` };
  }

  return { isValid: true, value: dateObj.toISOString() };
};

/**
 * Validate JSON
 */
const validateJson = (json) => {
  if (typeof json === 'object') {
    return { isValid: true, value: json };
  }

  try {
    const parsed = JSON.parse(json);
    return { isValid: true, value: parsed };
  } catch (error) {
    return { isValid: false, error: 'Invalid JSON format' };
  }
};

/**
 * Sanitize object recursively
 */
const sanitizeObject = (obj, options = {}) => {
  if (obj === null || obj === undefined) return obj;

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item, options));
  }

  if (typeof obj === 'object') {
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      // Remove dangerous keys
      if (key.startsWith('$') || key.includes('.') || key.includes('__proto__')) {
        logger.warn('Dangerous key detected and removed', { key });
        continue;
      }
      sanitized[key] = sanitizeObject(value, options);
    }
    return sanitized;
  }

  if (typeof obj === 'string') {
    return sanitizeString(obj, options);
  }

  return obj;
};

/**
 * Validate request body against schema
 */
const validateSchema = (data, schema) => {
  const errors = {};

  for (const [field, rules] of Object.entries(schema)) {
    const value = data[field];

    // Required check
    if (rules.required && (value === undefined || value === null || value === '')) {
      errors[field] = `${field} is required`;
      continue;
    }

    // Skip validation if not required and empty
    if (!rules.required && (value === undefined || value === null || value === '')) {
      continue;
    }

    // Type validation
    if (rules.type) {
      let validation;
      switch (rules.type) {
        case 'email':
          validation = validateEmail(value);
          break;
        case 'phone':
          validation = validatePhone(value);
          break;
        case 'url':
          validation = validateUrl(value);
          break;
        case 'uuid':
          validation = validateUuid(value);
          break;
        case 'integer':
          validation = validateInteger(value, rules);
          break;
        case 'date':
          validation = validateDate(value, rules);
          break;
        case 'json':
          validation = validateJson(value);
          break;
        default:
          validation = { isValid: true, value };
      }

      if (!validation.isValid) {
        errors[field] = validation.error;
      } else {
        data[field] = validation.value;
      }
    }

    // Custom validator
    if (rules.validator && typeof rules.validator === 'function') {
      const result = rules.validator(value);
      if (!result.isValid) {
        errors[field] = result.error;
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    data
  };
};

module.exports = {
  sanitizeString,
  sanitizeObject,
  validateEmail,
  validatePhone,
  validateName,
  validateUrl,
  validateUuid,
  validateInteger,
  validateDate,
  validateJson,
  validateSchema
};
