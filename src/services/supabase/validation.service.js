// Database input validation and sanitization
export class ValidationService {
  // Sanitize text input for database
  static sanitizeText(input, maxLength = 255) {
    if (!input || typeof input !== 'string') return null;
    
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove potential XSS chars
      .replace(/['"]/g, '') // Remove quotes to prevent SQL issues
      .substring(0, maxLength);
  }

  // Validate and sanitize email
  static validateEmail(email) {
    if (!email || typeof email !== 'string') return null;
    
    const sanitized = email.toLowerCase().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(sanitized) || sanitized.length > 254) {
      throw new Error('Invalid email format');
    }
    
    return sanitized;
  }

  // Validate phone number
  static validatePhone(phone) {
    if (!phone) return null;
    
    const sanitized = phone.replace(/[^\d+]/g, '');
    const phoneRegex = /^\+?[0-9]{10,15}$/;
    
    if (!phoneRegex.test(sanitized)) {
      throw new Error('Invalid phone number format');
    }
    
    return sanitized;
  }

  // Validate monetary amount
  static validateAmount(amount) {
    const num = parseFloat(amount);
    
    if (isNaN(num) || num <= 0) {
      throw new Error('Amount must be a positive number');
    }
    
    if (num > 10000000) { // 10 million max
      throw new Error('Amount exceeds maximum limit');
    }
    
    // Round to 2 decimal places
    return Math.round(num * 100) / 100;
  }

  // Validate UUID
  static validateUUID(uuid) {
    if (!uuid || typeof uuid !== 'string') {
      throw new Error('Invalid UUID format');
    }
    
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    
    if (!uuidRegex.test(uuid)) {
      throw new Error('Invalid UUID format');
    }
    
    return uuid.toLowerCase();
  }

  // Validate transaction reference
  static validateReference(reference) {
    if (!reference || typeof reference !== 'string') {
      throw new Error('Invalid reference format');
    }
    
    const sanitized = reference.toUpperCase().replace(/[^A-Z0-9_]/g, '');
    
    if (sanitized.length < 5 || sanitized.length > 50) {
      throw new Error('Reference must be 5-50 characters');
    }
    
    return sanitized;
  }

  // Validate JSONB metadata
  static validateMetadata(metadata) {
    if (!metadata) return {};
    
    if (typeof metadata !== 'object') {
      throw new Error('Metadata must be an object');
    }
    
    // Remove potentially dangerous keys
    const dangerous = ['__proto__', 'constructor', 'prototype'];
    const cleaned = {};
    
    Object.keys(metadata).forEach(key => {
      if (!dangerous.includes(key.toLowerCase()) && key.length <= 50) {
        const value = metadata[key];
        if (typeof value === 'string' && value.length <= 500) {
          cleaned[key] = this.sanitizeText(value, 500);
        } else if (typeof value === 'number' && !isNaN(value)) {
          cleaned[key] = value;
        } else if (typeof value === 'boolean') {
          cleaned[key] = value;
        }
      }
    });
    
    return cleaned;
  }

  // Validate service type enum
  static validateServiceType(type) {
    const validTypes = ['result_checker', 'jamb_service', 'course_advisor', 'ai_examiner'];
    
    if (!validTypes.includes(type)) {
      throw new Error('Invalid service type');
    }
    
    return type;
  }

  // Validate transaction type enum
  static validateTransactionType(type) {
    const validTypes = ['credit', 'debit'];
    
    if (!validTypes.includes(type)) {
      throw new Error('Invalid transaction type');
    }
    
    return type;
  }

  // Validate user role enum
  static validateUserRole(role) {
    const validRoles = ['student', 'admin'];
    
    if (!validRoles.includes(role)) {
      throw new Error('Invalid user role');
    }
    
    return role;
  }

  // Comprehensive user data validation
  static validateUserData(userData) {
    const validated = {};
    
    if (userData.email) {
      validated.email = this.validateEmail(userData.email);
    }
    
    if (userData.full_name) {
      validated.full_name = this.sanitizeText(userData.full_name, 100);
    }
    
    if (userData.phone) {
      validated.phone = this.validatePhone(userData.phone);
    }
    
    if (userData.state_of_origin) {
      validated.state_of_origin = this.sanitizeText(userData.state_of_origin, 50);
    }
    
    if (userData.role) {
      validated.role = this.validateUserRole(userData.role);
    }
    
    return validated;
  }

  // Comprehensive transaction data validation
  static validateTransactionData(txData) {
    const validated = {};
    
    validated.user_id = this.validateUUID(txData.user_id);
    validated.amount = this.validateAmount(txData.amount);
    validated.type = this.validateTransactionType(txData.type);
    
    if (txData.service_type) {
      validated.service_type = this.validateServiceType(txData.service_type);
    }
    
    if (txData.service_name) {
      validated.service_name = this.sanitizeText(txData.service_name, 100);
    }
    
    if (txData.description) {
      validated.description = this.sanitizeText(txData.description, 255);
    }
    
    if (txData.reference) {
      validated.reference = this.validateReference(txData.reference);
    }
    
    if (txData.metadata) {
      validated.metadata = this.validateMetadata(txData.metadata);
    }
    
    return validated;
  }
}

export default ValidationService;