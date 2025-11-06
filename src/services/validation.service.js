import { VALIDATION_RULES } from '../config/constants';

class ValidationService {
  validateEmail(email) {
    return {
      isValid: VALIDATION_RULES.EMAIL_PATTERN.test(email),
      message: 'Please enter a valid email address',
    };
  }

  validatePassword(password) {
    const checks = [
      {
        isValid: password.length >= VALIDATION_RULES.PASSWORD_MIN_LENGTH,
        message: `Password must be at least ${VALIDATION_RULES.PASSWORD_MIN_LENGTH} characters`,
      },
      {
        isValid: /[a-z]/.test(password),
        message: 'Password must contain at least one lowercase letter',
      },
      {
        isValid: /[A-Z]/.test(password),
        message: 'Password must contain at least one uppercase letter',
      },
      {
        isValid: /\d/.test(password),
        message: 'Password must contain at least one number',
      },
      {
        isValid: /[@$!%*?&]/.test(password),
        message: 'Password must contain at least one special character (@$!%*?&)',
      },
    ];

    const failedChecks = checks.filter(check => !check.isValid);
    
    return {
      isValid: failedChecks.length === 0,
      messages: failedChecks.map(check => check.message),
    };
  }

  validatePhone(phone) {
    return {
      isValid: VALIDATION_RULES.PHONE_PATTERN.test(phone),
      message: 'Please enter a valid phone number',
    };
  }

  validateRequired(value, fieldName) {
    const trimmedValue = typeof value === 'string' ? value.trim() : value;
    return {
      isValid: trimmedValue !== undefined && trimmedValue !== null && trimmedValue !== '',
      message: `${fieldName} is required`,
    };
  }

  validateLength(value, min, max, fieldName) {
    const length = value?.length || 0;
    const messages = [];

    if (min !== undefined && length < min) {
      messages.push(`${fieldName} must be at least ${min} characters`);
    }

    if (max !== undefined && length > max) {
      messages.push(`${fieldName} must be no more than ${max} characters`);
    }

    return {
      isValid: messages.length === 0,
      messages,
    };
  }

  validateMatch(value1, value2, fieldName) {
    return {
      isValid: value1 === value2,
      message: `${fieldName} fields must match`,
    };
  }

  validateFile(file, config) {
    const messages = [];

    if (!file) {
      return {
        isValid: false,
        message: 'No file selected',
      };
    }

    if (config.maxSize && file.size > config.maxSize) {
      messages.push(`File size must be less than ${config.maxSize / (1024 * 1024)}MB`);
    }

    if (config.allowedTypes && !config.allowedTypes.includes(file.type)) {
      messages.push(`File type must be one of: ${config.allowedTypes.join(', ')}`);
    }

    return {
      isValid: messages.length === 0,
      messages,
    };
  }

  validateForm(values, rules) {
    const errors = {};
    let isValid = true;

    Object.entries(rules).forEach(([field, fieldRules]) => {
      const fieldErrors = [];
      const value = values[field];

      fieldRules.forEach(rule => {
        switch (rule.type) {
          case 'required':
            const requiredCheck = this.validateRequired(value, rule.name || field);
            if (!requiredCheck.isValid) {
              fieldErrors.push(requiredCheck.message);
            }
            break;

          case 'email':
            const emailCheck = this.validateEmail(value);
            if (!emailCheck.isValid) {
              fieldErrors.push(emailCheck.message);
            }
            break;

          case 'password':
            const passwordCheck = this.validatePassword(value);
            if (!passwordCheck.isValid) {
              fieldErrors.push(...passwordCheck.messages);
            }
            break;

          case 'phone':
            const phoneCheck = this.validatePhone(value);
            if (!phoneCheck.isValid) {
              fieldErrors.push(phoneCheck.message);
            }
            break;

          case 'length':
            const lengthCheck = this.validateLength(
              value,
              rule.min,
              rule.max,
              rule.name || field
            );
            if (!lengthCheck.isValid) {
              fieldErrors.push(...lengthCheck.messages);
            }
            break;

          case 'match':
            const matchCheck = this.validateMatch(
              value,
              values[rule.field],
              rule.name || field
            );
            if (!matchCheck.isValid) {
              fieldErrors.push(matchCheck.message);
            }
            break;

          case 'file':
            const fileCheck = this.validateFile(value, rule.config);
            if (!fileCheck.isValid) {
              fieldErrors.push(...(Array.isArray(fileCheck.messages) ? fileCheck.messages : [fileCheck.message]));
            }
            break;

          default:
            if (rule.validator) {
              const customCheck = rule.validator(value, values);
              if (!customCheck.isValid) {
                fieldErrors.push(customCheck.message);
              }
            }
        }
      });

      if (fieldErrors.length > 0) {
        errors[field] = fieldErrors;
        isValid = false;
      }
    });

    return { isValid, errors };
  }
}

const validationService = new ValidationService();
export default validationService; 