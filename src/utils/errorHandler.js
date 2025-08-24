import logger from './logger';
import { sanitizeForLog } from './validation';

/**
 * Comprehensive error handling utility
 */
class ErrorHandler {
  constructor() {
    this.errorCodes = {
      NETWORK_ERROR: 'NETWORK_ERROR',
      VALIDATION_ERROR: 'VALIDATION_ERROR',
      AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
      AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
      SERVER_ERROR: 'SERVER_ERROR',
      UNKNOWN_ERROR: 'UNKNOWN_ERROR'
    };
  }

  /**
   * Handle API errors with proper logging and user-friendly messages
   */
  handleApiError(error, context = '') {
    const errorInfo = this.extractErrorInfo(error);
    
    // Log error with sanitized information
    logger.auth(`API error in ${context}`, {
      status: errorInfo.status,
      code: errorInfo.code,
      message: sanitizeForLog(errorInfo.message),
      url: errorInfo.url
    });

    return {
      success: false,
      error: errorInfo.userMessage,
      code: errorInfo.code,
      status: errorInfo.status
    };
  }

  /**
   * Extract error information from various error types
   */
  extractErrorInfo(error) {
    // Network errors
    if (!error.response) {
      return {
        status: 0,
        code: this.errorCodes.NETWORK_ERROR,
        message: 'Network error',
        userMessage: 'Network error. Please check your internet connection.',
        url: error.config?.url || 'unknown'
      };
    }

    const status = error.response.status;
    const data = error.response.data;
    const url = error.config?.url || 'unknown';

    // Extract error message from various response formats
    let message = 'Unknown error';
    if (typeof data === 'string') {
      message = data;
    } else if (data?.error) {
      message = data.error;
    } else if (data?.message) {
      message = data.message;
    } else if (error.message) {
      message = error.message;
    }

    // Determine error code and user message based on status
    let code = this.errorCodes.UNKNOWN_ERROR;
    let userMessage = message;

    switch (status) {
      case 400:
        code = this.errorCodes.VALIDATION_ERROR;
        userMessage = data?.error || 'Invalid request. Please check your input.';
        break;
      case 401:
        code = this.errorCodes.AUTHENTICATION_ERROR;
        userMessage = 'Authentication failed. Please log in again.';
        break;
      case 403:
        code = this.errorCodes.AUTHORIZATION_ERROR;
        userMessage = 'You do not have permission to perform this action.';
        break;
      case 404:
        code = this.errorCodes.UNKNOWN_ERROR;
        userMessage = 'Resource not found.';
        break;
      case 422:
        code = this.errorCodes.VALIDATION_ERROR;
        userMessage = data?.error || 'Validation failed. Please check your input.';
        break;
      case 429:
        code = this.errorCodes.UNKNOWN_ERROR;
        userMessage = 'Too many requests. Please try again later.';
        break;
      case 500:
      case 502:
      case 503:
      case 504:
        code = this.errorCodes.SERVER_ERROR;
        userMessage = 'Server error. Please try again later.';
        break;
      default:
        userMessage = message || 'An unexpected error occurred.';
    }

    return {
      status,
      code,
      message,
      userMessage,
      url
    };
  }

  /**
   * Handle validation errors
   */
  handleValidationError(errors, context = '') {
    logger.auth(`Validation error in ${context}`, { errors });
    
    const firstError = Object.values(errors)[0];
    return {
      success: false,
      error: firstError || 'Validation failed',
      code: this.errorCodes.VALIDATION_ERROR,
      validationErrors: errors
    };
  }

  /**
   * Handle storage errors
   */
  handleStorageError(error, operation = 'storage operation') {
    logger.auth(`Storage error during ${operation}`, { 
      error: sanitizeForLog(error.message) 
    });
    
    return {
      success: false,
      error: 'Storage operation failed. Please try again.',
      code: this.errorCodes.UNKNOWN_ERROR
    };
  }

  /**
   * Handle authentication errors
   */
  handleAuthError(error, operation = 'authentication') {
    const errorInfo = this.extractErrorInfo(error);
    
    logger.auth(`Authentication error during ${operation}`, {
      status: errorInfo.status,
      message: sanitizeForLog(errorInfo.message)
    });

    // Special handling for authentication errors
    if (errorInfo.status === 401) {
      return {
        success: false,
        error: 'Your session has expired. Please log in again.',
        code: this.errorCodes.AUTHENTICATION_ERROR,
        requiresLogin: true
      };
    }

    return {
      success: false,
      error: errorInfo.userMessage,
      code: errorInfo.code
    };
  }

  /**
   * Create a safe error response for logging
   */
  createSafeErrorResponse(error, defaultMessage = 'An error occurred') {
    try {
      const message = error?.message || error?.error || defaultMessage;
      return {
        success: false,
        error: sanitizeForLog(message)
      };
    } catch (e) {
      return {
        success: false,
        error: defaultMessage
      };
    }
  }

  /**
   * Check if error is retryable
   */
  isRetryableError(error) {
    if (!error.response) return true; // Network errors are retryable
    
    const status = error.response.status;
    return [408, 429, 500, 502, 503, 504].includes(status);
  }

  /**
   * Get retry delay based on error type
   */
  getRetryDelay(attempt = 1) {
    // Exponential backoff with jitter
    const baseDelay = 1000; // 1 second
    const maxDelay = 30000; // 30 seconds
    
    const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay);
    const jitter = Math.random() * 0.1 * delay; // 10% jitter
    
    return delay + jitter;
  }
}

// Create singleton instance
const errorHandler = new ErrorHandler();

export default errorHandler;