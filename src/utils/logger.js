import { sanitizeForLog } from './validation';

/**
 * Secure logging utility that prevents HTTP 431 errors and log injection
 */
class SecureLogger {
  constructor() {
    this.isDev = process.env.NODE_ENV !== 'production';
    this.maxLogLength = 150; // Conservative limit to prevent header bloat
    this.logLevels = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3
    };
    this.currentLevel = this.isDev ? 'debug' : 'error';
  }

  setLogLevel(level) {
    if (this.logLevels[level] !== undefined) {
      this.currentLevel = level;
    }
  }

  shouldLog(level) {
    return this.logLevels[level] >= this.logLevels[this.currentLevel];
  }

  formatMessage(service, level, message, data = null) {
    const timestamp = new Date().toISOString().slice(11, 19); // HH:MM:SS only
    let logMessage = `[${service}:${level}:${timestamp}] ${message}`;
    
    // Add essential data only, sanitized and truncated
    if (data && typeof data === 'object') {
      const essential = this.extractEssential(data);
      if (essential) {
        logMessage += ` ${essential}`;
      }
    }
    
    // Truncate if too long to prevent HTTP 431 errors
    if (logMessage.length > this.maxLogLength) {
      logMessage = logMessage.slice(0, this.maxLogLength - 3) + '...';
    }
    
    return logMessage;
  }

  extractEssential(data) {
    const essential = {};
    
    // Only extract safe, essential information
    if (data.status) essential.status = data.status;
    if (data.success !== undefined) essential.success = data.success;
    if (data.method) essential.method = sanitizeForLog(data.method);
    if (data.url) essential.url = sanitizeForLog(data.url).slice(0, 30);
    if (data.message) essential.msg = sanitizeForLog(data.message).slice(0, 50);
    if (data.error) essential.error = sanitizeForLog(data.error).slice(0, 30);
    
    return Object.keys(essential).length > 0 ? JSON.stringify(essential) : null;
  }

  log(service, level, message, data = null) {
    if (!this.shouldLog(level)) return;
    
    const logMessage = this.formatMessage(service, level, message, data);
    
    switch (level) {
      case 'debug':
        console.debug(logMessage);
        break;
      case 'info':
        console.info(logMessage);
        break;
      case 'warn':
        console.warn(logMessage);
        break;
      case 'error':
        console.error(logMessage);
        break;
      default:
        console.log(logMessage);
    }
  }

  // Service-specific logging methods
  auth(message, data = null) {
    this.log('Auth', 'info', message, data);
  }

  service(message, data = null) {
    this.log('Service', 'info', message, data);
  }

  api(message, data = null) {
    this.log('API', 'info', message, data);
  }

  // Level-specific methods
  debug(message, data = null) {
    this.log('App', 'debug', message, data);
  }

  info(message, data = null) {
    this.log('App', 'info', message, data);
  }

  warn(message, data = null) {
    this.log('App', 'warn', message, data);
  }

  error(message, data = null) {
    this.log('App', 'error', message, data);
  }

  // Performance monitoring
  time(label) {
    if (this.shouldLog('debug')) {
      console.time(sanitizeForLog(label));
    }
  }

  timeEnd(label) {
    if (this.shouldLog('debug')) {
      console.timeEnd(sanitizeForLog(label));
    }
  }

  // Group logging
  group(label) {
    if (this.shouldLog('debug')) {
      console.group(sanitizeForLog(label));
    }
  }

  groupEnd() {
    if (this.shouldLog('debug')) {
      console.groupEnd();
    }
  }

  // Table logging for development
  table(data, columns) {
    if (this.shouldLog('debug') && Array.isArray(data)) {
      // Sanitize table data
      const sanitizedData = data.map(item => {
        const sanitized = {};
        Object.keys(item).forEach(key => {
          if (typeof item[key] === 'string') {
            sanitized[key] = sanitizeForLog(item[key]).slice(0, 50);
          } else {
            sanitized[key] = item[key];
          }
        });
        return sanitized;
      });
      console.table(sanitizedData, columns);
    }
  }

  // Assertion logging
  assert(condition, message, data = null) {
    if (!condition) {
      this.error(`Assertion failed: ${message}`, data);
    }
  }

  // Performance measurement
  measure(label, callback) {
    if (!this.shouldLog('debug')) {
      return callback();
    }
    
    this.time(label);
    try {
      return callback();
    } finally {
      this.timeEnd(label);
    }
  }

  async measureAsync(label, callback) {
    if (!this.shouldLog('debug')) {
      return await callback();
    }
    
    this.time(label);
    try {
      return await callback();
    } finally {
      this.timeEnd(label);
    }
  }

  // Security event logging
  security(event, data = null) {
    this.log('Security', 'warn', event, data);
  }

  // User action logging (for analytics)
  userAction(action, data = null) {
    if (this.isDev) {
      this.log('UserAction', 'info', action, data);
    }
  }
}

// Create singleton instance
const logger = new SecureLogger();

export default logger;