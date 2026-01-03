/**
 * Comprehensive Input Validator
 * Industry-standard validation for all input types
 */

const { validate: isUUID } = require('uuid');

// SQL Injection Protection
const sanitizeSearchTerm = (search) => {
  if (!search || typeof search !== 'string') return '';
  
  return search
    .replace(/[';\"\\]/g, '')
    .replace(/--/g, '')
    .replace(/\/\*/g, '')
    .replace(/\*\//g, '')
    .replace(/xp_/gi, '')
    .replace(/sp_/gi, '')
    .trim()
    .substring(0, 100);
};

// Prompt Injection Protection
const sanitizeAIInput = (input) => {
  if (!input || typeof input !== 'string') return '';
  
  const dangerous = [
    /ignore\s+(previous|all)\s+instructions?/gi,
    /system\s+prompt/gi,
    /you\s+are\s+now/gi,
    /forget\s+everything/gi,
    /new\s+instructions?/gi,
    /disregard/gi,
    /override/gi
  ];
  
  let safe = input;
  dangerous.forEach(pattern => {
    safe = safe.replace(pattern, '[FILTERED]');
  });
  
  return safe.substring(0, 50000);
};

// Numeric Validation
const validateAmount = (amount, options = {}) => {
  const {
    min = 0,
    max = 1000000,
    allowNegative = false,
    allowDecimals = true,
    fieldName = 'Amount'
  } = options;
  
  if (amount === null || amount === undefined) {
    throw new Error(`${fieldName} is required`);
  }
  
  const num = Number(amount);
  
  if (isNaN(num) || !isFinite(num)) {
    throw new Error(`Invalid ${fieldName}`);
  }
  
  // Check negative BEFORE range
  if (!allowNegative && num < 0) {
    throw new Error(`${fieldName} cannot be negative`);
  }
  
  // Range check
  if (num < min || num > max) {
    throw new Error(`${fieldName} must be between ${min} and ${max}`);
  }
  
  // Decimal check
  if (!allowDecimals && num % 1 !== 0) {
    throw new Error(`${fieldName} must be a whole number`);
  }
  
  return num;
};

// UUID Validation
const validateUUID = (id, fieldName = 'ID') => {
  if (!id || typeof id !== 'string') {
    throw new Error(`${fieldName} is required`);
  }
  
  if (!isUUID(id)) {
    throw new Error(`Invalid ${fieldName} format`);
  }
  
  return id;
};

// Array Validation
const validateArray = (arr, options = {}) => {
  const {
    minLength = 0,
    maxLength = 1000,
    itemValidator = null,
    allowEmpty = false,
    fieldName = 'Array'
  } = options;
  
  if (!Array.isArray(arr)) {
    throw new Error(`${fieldName} must be an array`);
  }
  
  if (!allowEmpty && arr.length === 0) {
    throw new Error(`${fieldName} cannot be empty`);
  }
  
  if (arr.length < minLength || arr.length > maxLength) {
    throw new Error(`${fieldName} length must be between ${minLength} and ${maxLength}`);
  }
  
  if (itemValidator) {
    return arr.map((item, index) => {
      try {
        return itemValidator(item);
      } catch (error) {
        throw new Error(`Invalid item at index ${index}: ${error.message}`);
      }
    });
  }
  
  return arr;
};

// Date Validation
const validateDate = (date, options = {}) => {
  const {
    minDate = null,
    maxDate = null,
    allowFuture = true,
    allowPast = true,
    fieldName = 'Date'
  } = options;
  
  const dateObj = new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    throw new Error(`Invalid ${fieldName} format`);
  }
  
  const now = new Date();
  
  if (!allowFuture && dateObj > now) {
    throw new Error(`Future ${fieldName}s not allowed`);
  }
  
  if (!allowPast && dateObj < now) {
    throw new Error(`Past ${fieldName}s not allowed`);
  }
  
  if (minDate && dateObj < new Date(minDate)) {
    throw new Error(`${fieldName} must be after ${minDate}`);
  }
  
  if (maxDate && dateObj > new Date(maxDate)) {
    throw new Error(`${fieldName} must be before ${maxDate}`);
  }
  
  return dateObj.toISOString();
};

// Pagination Validation
const validatePagination = (page, limit) => {
  const safePage = Math.max(1, Math.min(parseInt(page) || 1, 10000));
  const safeLimit = Math.max(1, Math.min(parseInt(limit) || 10, 100));
  
  return { page: safePage, limit: safeLimit };
};

// JSON Validation (Prototype Pollution Protection)
const validateJSON = (data, schema = {}) => {
  if (data && typeof data === 'object') {
    if ('__proto__' in data || 'constructor' in data || 'prototype' in data) {
      throw new Error('Invalid JSON structure');
    }
  }
  
  if (Object.keys(schema).length > 0) {
    for (const [key, validator] of Object.entries(schema)) {
      if (!(key in data)) {
        throw new Error(`Missing required field: ${key}`);
      }
      if (!validator(data[key])) {
        throw new Error(`Invalid value for field: ${key}`);
      }
    }
  }
  
  return data;
};

// String Length Validation
const validateStringLength = (str, options = {}) => {
  const {
    minLength = 0,
    maxLength = 1000,
    fieldName = 'String'
  } = options;
  
  if (typeof str !== 'string') {
    throw new Error(`${fieldName} must be a string`);
  }
  
  if (str.length < minLength) {
    throw new Error(`${fieldName} must be at least ${minLength} characters`);
  }
  
  if (str.length > maxLength) {
    throw new Error(`${fieldName} exceeds maximum length of ${maxLength} characters`);
  }
  
  return str;
};

// Enum Validation
const validateEnum = (value, allowedValues, fieldName = 'Value') => {
  if (!allowedValues.includes(value)) {
    throw new Error(`${fieldName} must be one of: ${allowedValues.join(', ')}`);
  }
  
  return value;
};

module.exports = {
  sanitizeSearchTerm,
  sanitizeAIInput,
  validateAmount,
  validateUUID,
  validateArray,
  validateDate,
  validatePagination,
  validateJSON,
  validateStringLength,
  validateEnum
};
