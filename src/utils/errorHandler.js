import React from 'react';
import { toast } from 'react-toastify';
import { ERROR_MESSAGES } from '../config/constants';
import { logger } from '../services/logger.service';

class ErrorHandler {
  constructor() {
    this.errorListeners = new Set();
    this.defaultErrorHandler = this.handleError.bind(this);

    // Set up global error handlers
    if (typeof window !== 'undefined') {
      window.onerror = (message, source, lineno, colno, error) => {
        this.handleError(error || message);
        // Return true to prevent the default browser error handler
        return true;
      };

      window.addEventListener('unhandledrejection', (event) => {
        this.handleError(event.reason);
      });
    }
  }

  addErrorListener(listener) {
    this.errorListeners.add(listener);
    return () => this.errorListeners.delete(listener);
  }

  removeErrorListener(listener) {
    this.errorListeners.delete(listener);
  }

  notifyListeners(error, errorInfo = null) {
    this.errorListeners.forEach((listener) => {
      try {
        listener(error, errorInfo);
      } catch (listenerError) {
        logger.error('Error in error listener:', listenerError);
      }
    });
  }

  handleError(error, errorInfo = null) {
    // Log the error with context
    logger.error('Error caught by error handler:', {
      error,
      errorInfo,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
    });

    // Notify any registered error listeners
    this.notifyListeners(error, errorInfo);

    // Determine the error type and show appropriate message
    const errorMessage = this.getErrorMessage(error);
    toast.error(errorMessage);

    // Here you would typically send to your error reporting service
    // Example: Sentry.captureException(error);
  }

  getErrorMessage(error) {
    if (!error) {
      return ERROR_MESSAGES.SERVER_ERROR;
    }

    // Handle axios errors
    if (error.isAxiosError) {
      if (!error.response) {
        return ERROR_MESSAGES.NETWORK_ERROR;
      }

      const status = error.response.status;
      const serverMessage = error.response.data?.message;

      switch (status) {
        case 400:
          return serverMessage || ERROR_MESSAGES.VALIDATION_ERROR;
        case 401:
          return ERROR_MESSAGES.UNAUTHORIZED;
        case 403:
          return ERROR_MESSAGES.FORBIDDEN;
        case 404:
          return ERROR_MESSAGES.NOT_FOUND;
        case 500:
          return ERROR_MESSAGES.SERVER_ERROR;
        default:
          return serverMessage || ERROR_MESSAGES.SERVER_ERROR;
      }
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      return error.message || ERROR_MESSAGES.VALIDATION_ERROR;
    }

    // Handle authentication errors
    if (error.name === 'AuthenticationError') {
      return error.message || ERROR_MESSAGES.UNAUTHORIZED;
    }

    // Handle other types of errors
    return error.message || ERROR_MESSAGES.SERVER_ERROR;
  }

  async wrapAsync(promise) {
    try {
      return await promise;
    } catch (error) {
      this.handleError(error);
      throw error; // Re-throw the error for the caller to handle if needed
    }
  }

  createErrorBoundary(component) {
    const ErrorBoundaryComponent = class ErrorBoundary extends React.Component {
      constructor(props) {
        super(props);
        this.state = { hasError: false };
      }

      static getDerivedStateFromError(error) {
        return { hasError: true };
      }

      componentDidCatch(error, errorInfo) {
        errorHandler.handleError(error, errorInfo);
      }

      render() {
        if (this.state.hasError) {
          return null; // Or render a fallback UI
        }

        return component;
      }
    };

    return ErrorBoundaryComponent;
  }
}

const errorHandler = new ErrorHandler();
export default errorHandler; 