// Secure Error Handling
import { secureLogger } from './secureLogger';

class ErrorHandler {
  constructor() {
    this.errorCounts = new Map();
    this.setupErrorBoundary();
  }

  // Handle and log errors securely
  async handleError(error, context = {}) {
    // Increment error count for monitoring
    const errorKey = `${error.name}_${error.message}`;
    this.errorCounts.set(errorKey, (this.errorCounts.get(errorKey) || 0) + 1);

    // Log error securely
    await secureLogger.logError(error, {
      ...context,
      errorCount: this.errorCounts.get(errorKey)
    });

    // Return user-friendly error message
    return this.getUserFriendlyMessage(error);
  }

  // Convert technical errors to user-friendly messages
  getUserFriendlyMessage(error) {
    const errorMappings = {
      'Network Error': 'Connection problem. Please check your internet and try again.',
      'Request timeout': 'The request took too long. Please try again.',
      'Rate limit exceeded': 'Too many requests. Please wait a moment and try again.',
      'Validation failed': 'Please check your input and try again.',
      'Authentication failed': 'Please log in again to continue.',
      'Permission denied': 'You don\'t have permission to perform this action.',
      'Payment failed': 'Payment could not be processed. Please try again.',
      'File too large': 'File is too large. Please choose a smaller file.',
      'Invalid file type': 'File type not supported. Please choose a different file.'
    };

    // Check for specific error patterns
    for (const [pattern, message] of Object.entries(errorMappings)) {
      if (error.message.includes(pattern) || error.name.includes(pattern)) {
        return message;
      }
    }

    // Default fallback message
    return 'Something went wrong. Please try again or contact support if the problem persists.';
  }

  // Setup React Error Boundary equivalent
  setupErrorBoundary() {
    window.addEventListener('error', async (event) => {
      await this.handleError(event.error || new Error(event.message), {
        type: 'boundary_error',
        filename: event.filename,
        lineno: event.lineno
      });
    });
  }

  // Async operation wrapper with error handling
  async withErrorHandling(operation, context = {}) {
    try {
      return await operation();
    } catch (error) {
      const userMessage = await this.handleError(error, context);
      throw new Error(userMessage);
    }
  }

  // Validation error handler
  handleValidationError(field, value, rule) {
    const error = new Error(`Validation failed for ${field}`);
    error.name = 'ValidationError';
    
    this.handleError(error, {
      field,
      value: typeof value === 'string' ? value.substring(0, 50) : value,
      rule,
      type: 'validation'
    });

    return `Invalid ${field}. ${this.getValidationMessage(rule)}`;
  }

  getValidationMessage(rule) {
    const messages = {
      required: 'This field is required.',
      email: 'Please enter a valid email address.',
      phone: 'Please enter a valid phone number.',
      amount: 'Please enter a valid amount.',
      minLength: 'Input is too short.',
      maxLength: 'Input is too long.',
      pattern: 'Input format is invalid.'
    };

    return messages[rule] || 'Please check your input.';
  }

  // Get error statistics for monitoring
  getErrorStats() {
    return {
      totalErrors: Array.from(this.errorCounts.values()).reduce((sum, count) => sum + count, 0),
      uniqueErrors: this.errorCounts.size,
      topErrors: Array.from(this.errorCounts.entries())
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
    };
  }
}

const errorHandler = new ErrorHandler();
export { errorHandler };
export default errorHandler;