// Secure Logging System
import { supabase } from '../lib/supabase';

class SecureLogger {
  constructor() {
    this.logQueue = [];
    this.isProcessing = false;
    this.sensitivePatterns = [
      /password/i,
      /token/i,
      /key/i,
      /secret/i,
      /credit.*card/i,
      /ssn/i,
      /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/ // Credit card pattern
    ];
  }

  // Sanitize log data to remove sensitive information
  sanitizeLogData(data) {
    if (typeof data === 'string') {
      this.sensitivePatterns.forEach(pattern => {
        data = data.replace(pattern, '[REDACTED]');
      });
      return data;
    }

    if (typeof data === 'object' && data !== null) {
      const sanitized = {};
      for (const [key, value] of Object.entries(data)) {
        if (this.sensitivePatterns.some(pattern => pattern.test(key))) {
          sanitized[key] = '[REDACTED]';
        } else {
          sanitized[key] = this.sanitizeLogData(value);
        }
      }
      return sanitized;
    }

    return data;
  }

  // Log security events
  async logSecurityEvent(event, details = {}) {
    const logEntry = {
      level: 'security',
      event,
      details: this.sanitizeLogData(details),
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    await this.writeLog(logEntry);
  }

  // Log errors with context
  async logError(error, context = {}) {
    const logEntry = {
      level: 'error',
      message: error.message,
      stack: error.stack,
      context: this.sanitizeLogData(context),
      timestamp: new Date().toISOString(),
      url: window.location.href
    };

    await this.writeLog(logEntry);
  }

  // Log application events
  async logEvent(event, data = {}) {
    const logEntry = {
      level: 'info',
      event,
      data: this.sanitizeLogData(data),
      timestamp: new Date().toISOString()
    };

    await this.writeLog(logEntry);
  }

  // Write log to database
  async writeLog(logEntry) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      await supabase.from('activity_logs').insert({
        user_id: user?.id || null,
        action: `${logEntry.level}_${logEntry.event || 'log'}`,
        resource: 'application',
        metadata: {
          level: logEntry.level,
          message: logEntry.message,
          details: logEntry.details || logEntry.data,
          context: logEntry.context,
          userAgent: logEntry.userAgent,
          url: logEntry.url,
          stack: logEntry.stack
        }
      });
    } catch (error) {
      // Fallback to console if database logging fails
      console.error('Logging failed:', error);
      console.log('Original log:', logEntry);
    }
  }

  // Global error handler
  setupGlobalErrorHandling() {
    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.logError(new Error(event.reason), { type: 'unhandled_promise' });
    });

    // Global errors
    window.addEventListener('error', (event) => {
      this.logError(event.error || new Error(event.message), {
        type: 'global_error',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    });
  }
}

export const secureLogger = new SecureLogger();