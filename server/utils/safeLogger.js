/**
 * Enterprise Safe Logger
 * Handles logger initialization issues with graceful fallback
 */

let logger;
let isInitialized = false;

const initLogger = () => {
  if (isInitialized) return logger;
  
  try {
    logger = require('./logger');
    isInitialized = true;
    return logger;
  } catch (error) {
    console.error('Failed to initialize logger:', error.message);
    return createFallbackLogger();
  }
};

const createFallbackLogger = () => ({
  info: (...args) => console.log('[INFO]', ...args),
  warn: (...args) => console.warn('[WARN]', ...args),
  error: (...args) => console.error('[ERROR]', ...args),
  debug: (...args) => console.debug('[DEBUG]', ...args)
});

const safeLogger = {
  info: (...args) => {
    const log = initLogger();
    return log.info(...args);
  },
  warn: (...args) => {
    const log = initLogger();
    return log.warn(...args);
  },
  error: (...args) => {
    const log = initLogger();
    return log.error(...args);
  },
  debug: (...args) => {
    const log = initLogger();
    return log.debug(...args);
  }
};

module.exports = safeLogger;
