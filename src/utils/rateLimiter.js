// Client-side rate limiting for auth attempts
class RateLimiter {
  constructor() {
    this.attempts = new Map();
    this.blockedIPs = new Map();
  }

  // Check if action is allowed
  isAllowed(key, maxAttempts = 5, windowMs = 15 * 60 * 1000) {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];
    
    // Remove old attempts outside the window
    const validAttempts = attempts.filter(time => now - time < windowMs);
    
    // Check if blocked
    const blockInfo = this.blockedIPs.get(key);
    if (blockInfo && now < blockInfo.until) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: blockInfo.until,
        blocked: true
      };
    }
    
    // Check rate limit
    if (validAttempts.length >= maxAttempts) {
      // Block for increasing duration based on violations
      const blockDuration = this.calculateBlockDuration(key);
      this.blockedIPs.set(key, {
        until: now + blockDuration,
        attempts: (blockInfo?.attempts || 0) + 1
      });
      
      return {
        allowed: false,
        remaining: 0,
        resetTime: now + blockDuration,
        blocked: true
      };
    }
    
    return {
      allowed: true,
      remaining: maxAttempts - validAttempts.length,
      resetTime: now + windowMs
    };
  }

  // Record an attempt
  recordAttempt(key) {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];
    attempts.push(now);
    this.attempts.set(key, attempts);
  }

  // Calculate progressive block duration
  calculateBlockDuration(key) {
    const blockInfo = this.blockedIPs.get(key);
    const baseBlock = 15 * 60 * 1000; // 15 minutes
    const attempts = blockInfo?.attempts || 0;
    
    // Progressive blocking: 15min, 1hr, 4hr, 24hr
    const multipliers = [1, 4, 16, 96];
    const multiplier = multipliers[Math.min(attempts, multipliers.length - 1)];
    
    return baseBlock * multiplier;
  }

  // Clear attempts for a key
  clearAttempts(key) {
    this.attempts.delete(key);
    this.blockedIPs.delete(key);
  }

  // Get client identifier
  getClientKey() {
    // Use multiple factors for identification
    const factors = [
      navigator.userAgent,
      window.screen.width + 'x' + window.screen.height,
      new Date().getTimezoneOffset(),
      navigator.language
    ];
    
    // Simple hash function
    let hash = 0;
    const str = factors.join('|');
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return 'client_' + Math.abs(hash).toString(36);
  }
}

// Create singleton instance
const rateLimiter = new RateLimiter();

// Auth-specific rate limiting
export const AuthRateLimiter = {
  // Login attempts
  checkLogin() {
    const key = rateLimiter.getClientKey() + '_login';
    return rateLimiter.isAllowed(key, 5, 15 * 60 * 1000); // 5 attempts per 15 minutes
  },

  recordLogin() {
    const key = rateLimiter.getClientKey() + '_login';
    rateLimiter.recordAttempt(key);
  },

  clearLogin() {
    const key = rateLimiter.getClientKey() + '_login';
    rateLimiter.clearAttempts(key);
  },

  // Registration attempts
  checkRegistration() {
    const key = rateLimiter.getClientKey() + '_register';
    return rateLimiter.isAllowed(key, 3, 60 * 60 * 1000); // 3 attempts per hour
  },

  recordRegistration() {
    const key = rateLimiter.getClientKey() + '_register';
    rateLimiter.recordAttempt(key);
  },

  // Password reset attempts
  checkPasswordReset() {
    const key = rateLimiter.getClientKey() + '_reset';
    return rateLimiter.isAllowed(key, 3, 60 * 60 * 1000); // 3 attempts per hour
  },

  recordPasswordReset() {
    const key = rateLimiter.getClientKey() + '_reset';
    rateLimiter.recordAttempt(key);
  }
};

export default AuthRateLimiter;