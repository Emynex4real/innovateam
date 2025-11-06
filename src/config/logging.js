// Logging configuration to prevent HTTP 431 errors
export const LOGGING_CONFIG = {
  // Maximum characters per log message
  MAX_LOG_LENGTH: 100,
  
  // Enable/disable logging in development
  ENABLE_AUTH_LOGS: true,
  ENABLE_API_LOGS: false, // Disable API logs to prevent header issues
  
  // Log levels
  LEVELS: {
    ERROR: 'error',
    WARN: 'warn', 
    INFO: 'info',
    DEBUG: 'debug'
  },
  
  // Prevent logging of sensitive data
  SENSITIVE_KEYS: [
    'token',
    'password', 
    'refreshToken',
    'authorization',
    'cookie'
  ]
};

// Safe logging rules
export const SAFE_LOGGING_RULES = [
  'Never log full tokens or sensitive data',
  'Keep log messages under 100 characters',
  'Avoid logging complex objects in production',
  'Use structured logging with minimal data',
  'Disable verbose API logging to prevent header bloat'
];