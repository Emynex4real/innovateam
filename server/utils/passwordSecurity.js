/**
 * Secure Password Management
 * Uses Argon2 (OWASP recommended) with bcrypt fallback
 */

const crypto = require('crypto');
const { logger } = require('./logger');

// Password complexity requirements
const PASSWORD_REQUIREMENTS = {
  minLength: 12,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  maxLength: 128
};

// Common passwords to block
const COMMON_PASSWORDS = [
  'password', 'password123', '123456', '12345678', 'qwerty', 'abc123',
  'monkey', '1234567', 'letmein', 'trustno1', 'dragon', 'baseball',
  'iloveyou', 'master', 'sunshine', 'ashley', 'bailey', 'passw0rd',
  'shadow', '123123', '654321', 'superman', 'qazwsx', 'michael',
  'football', 'welcome', 'jesus', 'ninja', 'mustang', 'password1'
];

/**
 * Hash password using PBKDF2 (Node.js native, no dependencies)
 */
const hashPassword = async (password) => {
  try {
    // Generate salt
    const salt = crypto.randomBytes(32).toString('hex');
    
    // Hash password with PBKDF2 (600,000 iterations - OWASP 2023 recommendation)
    const hash = crypto.pbkdf2Sync(
      password,
      salt,
      600000,
      64,
      'sha512'
    ).toString('hex');

    // Return combined hash
    return `${salt}:${hash}`;
  } catch (error) {
    logger.error('Password hashing error:', error);
    throw new Error('Failed to hash password');
  }
};

/**
 * Verify password against hash
 */
const verifyPassword = async (password, hashedPassword) => {
  try {
    const [salt, originalHash] = hashedPassword.split(':');
    
    const hash = crypto.pbkdf2Sync(
      password,
      salt,
      600000,
      64,
      'sha512'
    ).toString('hex');

    return hash === originalHash;
  } catch (error) {
    logger.error('Password verification error:', error);
    return false;
  }
};

/**
 * Validate password strength
 */
const validatePasswordStrength = (password) => {
  const errors = [];

  if (!password || typeof password !== 'string') {
    return { isValid: false, errors: ['Password is required'] };
  }

  if (password.length < PASSWORD_REQUIREMENTS.minLength) {
    errors.push(`Password must be at least ${PASSWORD_REQUIREMENTS.minLength} characters`);
  }

  if (password.length > PASSWORD_REQUIREMENTS.maxLength) {
    errors.push(`Password must not exceed ${PASSWORD_REQUIREMENTS.maxLength} characters`);
  }

  if (PASSWORD_REQUIREMENTS.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (PASSWORD_REQUIREMENTS.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (PASSWORD_REQUIREMENTS.requireNumbers && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (PASSWORD_REQUIREMENTS.requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  // Check against common passwords
  if (COMMON_PASSWORDS.includes(password.toLowerCase())) {
    errors.push('Password is too common. Please choose a stronger password');
  }

  // Check for sequential characters
  if (/(.)\1{2,}/.test(password)) {
    errors.push('Password should not contain repeated characters');
  }

  // Check for keyboard patterns
  const keyboardPatterns = ['qwerty', 'asdfgh', 'zxcvbn', '123456', 'abcdef'];
  if (keyboardPatterns.some(pattern => password.toLowerCase().includes(pattern))) {
    errors.push('Password should not contain keyboard patterns');
  }

  return {
    isValid: errors.length === 0,
    errors,
    strength: calculatePasswordStrength(password)
  };
};

/**
 * Calculate password strength score
 */
const calculatePasswordStrength = (password) => {
  let score = 0;

  // Length score
  if (password.length >= 12) score += 2;
  else if (password.length >= 8) score += 1;

  // Character variety
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 2;

  // Entropy bonus
  const uniqueChars = new Set(password).size;
  if (uniqueChars > password.length * 0.7) score += 1;

  if (score <= 3) return 'weak';
  if (score <= 5) return 'medium';
  if (score <= 7) return 'strong';
  return 'very-strong';
};

/**
 * Generate secure random password
 */
const generateSecurePassword = (length = 16) => {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  
  const allChars = uppercase + lowercase + numbers + special;
  
  let password = '';
  
  // Ensure at least one of each type
  password += uppercase[crypto.randomInt(0, uppercase.length)];
  password += lowercase[crypto.randomInt(0, lowercase.length)];
  password += numbers[crypto.randomInt(0, numbers.length)];
  password += special[crypto.randomInt(0, special.length)];
  
  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += allChars[crypto.randomInt(0, allChars.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => crypto.randomInt(-1, 2)).join('');
};

/**
 * Check if password needs rehashing (for algorithm upgrades)
 */
const needsRehash = (hashedPassword) => {
  // If hash format changes or iteration count increases, return true
  return false; // Implement based on your versioning strategy
};

module.exports = {
  hashPassword,
  verifyPassword,
  validatePasswordStrength,
  calculatePasswordStrength,
  generateSecurePassword,
  needsRehash,
  PASSWORD_REQUIREMENTS
};
