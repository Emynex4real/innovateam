class LoggerService {
  constructor() {
    this.logLevel = process.env.NODE_ENV === 'production' ? 'error' : 'debug';
    this.logLevels = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3,
    };
  }

  setLogLevel(level) {
    if (this.logLevels[level] !== undefined) {
      this.logLevel = level;
    }
  }

  shouldLog(level) {
    return this.logLevels[level] >= this.logLevels[this.logLevel];
  }

  formatMessage(level, message, ...args) {
    const timestamp = new Date().toISOString();
    const formattedArgs = args.map(arg => {
      if (arg instanceof Error) {
        return {
          message: arg.message,
          stack: arg.stack,
          ...arg,
        };
      }
      return arg;
    });

    return {
      timestamp,
      level,
      message,
      args: formattedArgs,
    };
  }

  debug(message, ...args) {
    if (this.shouldLog('debug')) {
      const logData = this.formatMessage('debug', message, ...args);
      console.debug(JSON.stringify(logData));
      return logData;
    }
  }

  info(message, ...args) {
    if (this.shouldLog('info')) {
      const logData = this.formatMessage('info', message, ...args);
      console.info(JSON.stringify(logData));
      return logData;
    }
  }

  warn(message, ...args) {
    if (this.shouldLog('warn')) {
      const logData = this.formatMessage('warn', message, ...args);
      console.warn(JSON.stringify(logData));
      return logData;
    }
  }

  error(message, ...args) {
    if (this.shouldLog('error')) {
      const logData = this.formatMessage('error', message, ...args);
      console.error(JSON.stringify(logData));

      // Here you would typically send to your error reporting service
      // Example: Sentry.captureException(error);

      return logData;
    }
  }

  group(label) {
    if (this.shouldLog('debug')) {
      console.group(label);
    }
  }

  groupEnd() {
    if (this.shouldLog('debug')) {
      console.groupEnd();
    }
  }

  table(data, columns) {
    if (this.shouldLog('debug')) {
      console.table(data, columns);
    }
  }

  time(label) {
    if (this.shouldLog('debug')) {
      console.time(label);
    }
  }

  timeEnd(label) {
    if (this.shouldLog('debug')) {
      console.timeEnd(label);
    }
  }

  assert(condition, message, ...args) {
    if (!condition) {
      this.error(`Assertion failed: ${message}`, ...args);
    }
  }

  // Performance monitoring
  measure(label, callback) {
    this.time(label);
    try {
      return callback();
    } finally {
      this.timeEnd(label);
    }
  }

  async measureAsync(label, callback) {
    this.time(label);
    try {
      return await callback();
    } finally {
      this.timeEnd(label);
    }
  }
}

const logger = new LoggerService();
export default logger; 