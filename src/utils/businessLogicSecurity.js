// Business Logic Security
import { secureLogger } from './secureLogger';

class BusinessLogicSecurity {
  constructor() {
    this.transactionLimits = {
      daily: 500000, // 500k daily limit
      single: 100000, // 100k single transaction
      hourly: 50000   // 50k hourly limit
    };
    this.suspiciousThresholds = {
      rapidTransactions: 5, // 5 transactions in 10 minutes
      largeAmount: 50000,   // Amounts over 50k
      failedAttempts: 3     // 3 failed attempts
    };
  }

  // Validate transaction amounts and limits
  async validateTransaction(userId, amount, type) {
    const validationResult = {
      isValid: true,
      errors: [],
      warnings: []
    };

    // Basic amount validation
    if (amount <= 0) {
      validationResult.isValid = false;
      validationResult.errors.push('Amount must be greater than zero');
    }

    if (amount > this.transactionLimits.single) {
      validationResult.isValid = false;
      validationResult.errors.push(`Amount exceeds single transaction limit of ₦${this.transactionLimits.single.toLocaleString()}`);
    }

    // Check daily limits (would need database integration)
    const dailyTotal = await this.getDailyTransactionTotal(userId);
    if (dailyTotal + amount > this.transactionLimits.daily) {
      validationResult.isValid = false;
      validationResult.errors.push('Daily transaction limit exceeded');
    }

    // Suspicious activity detection
    if (amount > this.suspiciousThresholds.largeAmount) {
      validationResult.warnings.push('Large transaction detected');
      await secureLogger.logSecurityEvent('large_transaction', {
        userId,
        amount,
        type
      });
    }

    return validationResult;
  }

  // Check for rapid transaction patterns
  async checkRapidTransactions(userId) {
    // This would integrate with database to check recent transactions
    // For now, return mock implementation
    return {
      isRapid: false,
      count: 0,
      timeWindow: '10 minutes'
    };
  }

  // Validate course recommendation logic
  validateCourseRecommendation(grades, jambScore, interests) {
    const validation = {
      isValid: true,
      errors: []
    };

    // JAMB score validation
    if (!jambScore || jambScore < 0 || jambScore > 400) {
      validation.isValid = false;
      validation.errors.push('Invalid JAMB score. Must be between 0 and 400');
    }

    // Grades validation
    const validGrades = ['A1', 'B2', 'B3', 'C4', 'C5', 'C6', 'D7', 'E8', 'F9'];
    for (const [subject, grade] of Object.entries(grades)) {
      if (!validGrades.includes(grade)) {
        validation.isValid = false;
        validation.errors.push(`Invalid grade for ${subject}: ${grade}`);
      }
    }

    // Required subjects check
    const requiredSubjects = ['english', 'mathematics'];
    for (const subject of requiredSubjects) {
      if (!grades[subject]) {
        validation.isValid = false;
        validation.errors.push(`Missing required subject: ${subject}`);
      }
    }

    // Interests validation
    if (!interests || interests.trim().length < 10) {
      validation.isValid = false;
      validation.errors.push('Please provide more detailed interests (minimum 10 characters)');
    }

    return validation;
  }

  // Validate question generation input
  validateQuestionGeneration(file) {
    const validation = {
      isValid: true,
      errors: []
    };

    // File size validation (5MB limit)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      validation.isValid = false;
      validation.errors.push('File size exceeds 5MB limit');
    }

    // File type validation
    const allowedTypes = ['text/plain', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      validation.isValid = false;
      validation.errors.push('Only TXT and PDF files are allowed');
    }

    // File name validation (prevent path traversal)
    const fileName = file.name;
    if (fileName.includes('..') || fileName.includes('/') || fileName.includes('\\')) {
      validation.isValid = false;
      validation.errors.push('Invalid file name');
    }

    return validation;
  }

  // Business rule enforcement for wallet operations
  async enforceWalletRules(operation, userId, amount, currentBalance) {
    const rules = {
      isAllowed: true,
      violations: []
    };

    switch (operation) {
      case 'withdraw':
        if (amount > currentBalance) {
          rules.isAllowed = false;
          rules.violations.push('Insufficient balance');
        }
        if (amount < 100) {
          rules.isAllowed = false;
          rules.violations.push('Minimum withdrawal amount is ₦100');
        }
        break;

      case 'deposit':
        if (amount < 50) {
          rules.isAllowed = false;
          rules.violations.push('Minimum deposit amount is ₦50');
        }
        break;

      case 'transfer':
        if (amount > currentBalance) {
          rules.isAllowed = false;
          rules.violations.push('Insufficient balance for transfer');
        }
        if (amount < 10) {
          rules.isAllowed = false;
          rules.violations.push('Minimum transfer amount is ₦10');
        }
        break;
    }

    // Log business rule violations
    if (!rules.isAllowed) {
      await secureLogger.logSecurityEvent('business_rule_violation', {
        userId,
        operation,
        amount,
        violations: rules.violations
      });
    }

    return rules;
  }

  // Mock function for daily transaction total (would integrate with database)
  async getDailyTransactionTotal(userId) {
    // This would query the database for today's transactions
    return 0;
  }

  // Detect and prevent privilege escalation
  validateUserPermissions(userId, action, resource) {
    const permissions = {
      hasPermission: true,
      reason: null
    };

    // Define role-based permissions (would come from database)
    const userRoles = {
      // Mock user roles - would be fetched from database
      [userId]: 'user' // Default role
    };

    const rolePermissions = {
      user: ['read_own', 'update_own', 'create_transaction'],
      admin: ['read_all', 'update_all', 'delete_any', 'manage_users']
    };

    const userRole = userRoles[userId] || 'user';
    const allowedActions = rolePermissions[userRole] || [];

    if (!allowedActions.includes(action)) {
      permissions.hasPermission = false;
      permissions.reason = `Action '${action}' not allowed for role '${userRole}'`;
      
      secureLogger.logSecurityEvent('privilege_escalation_attempt', {
        userId,
        action,
        resource,
        userRole,
        reason: permissions.reason
      });
    }

    return permissions;
  }
}

export const businessLogicSecurity = new BusinessLogicSecurity();