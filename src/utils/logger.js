// Safe logging utility to prevent HTTP 431 errors
class Logger {
  constructor() {
    this.isDev = process.env.NODE_ENV !== 'production';
    this.maxLogLength = 100; // Max characters per log
  }

  log(service, message, data = null) {
    if (!this.isDev) return;
    
    const timestamp = new Date().toISOString().slice(11, 19); // HH:MM:SS only
    let logMessage = `[${service}:${timestamp}] ${message}`;
    
    // Only add essential data, truncated
    if (data && typeof data === 'object') {
      const essential = this.extractEssential(data);
      if (essential) {
        logMessage += ` ${essential}`;
      }
    }
    
    // Truncate if too long
    if (logMessage.length > this.maxLogLength) {
      logMessage = logMessage.slice(0, this.maxLogLength) + '...';
    }
    
    console.log(logMessage);
  }

  extractEssential(data) {
    // Only log essential info to prevent header bloat
    const essential = {};
    
    if (data.status) essential.status = data.status;
    if (data.error && typeof data.error === 'string') {
      essential.error = data.error.slice(0, 20);
    }
    if (data.success !== undefined) essential.success = data.success;
    
    return Object.keys(essential).length > 0 ? JSON.stringify(essential) : null;
  }

  auth(message, data = null) {
    this.log('Auth', message, data);
  }

  service(message, data = null) {
    this.log('Service', message, data);
  }
}

export default new Logger();