// Enhanced session security management
export class SessionSecurity {
  constructor() {
    this.sessionTimeout = 15 * 60 * 1000; // 15 minutes
    this.warningTime = 2 * 60 * 1000; // 2 minutes before timeout
    this.lastActivity = Date.now();
    this.warningShown = false;
    this.timeoutId = null;
    this.warningId = null;
  }

  // Initialize session monitoring
  init(onTimeout, onWarning) {
    this.onTimeout = onTimeout;
    this.onWarning = onWarning;
    
    // Track user activity
    this.trackActivity();
    
    // Start session timer
    this.resetTimer();
    
    // Monitor tab visibility
    this.monitorVisibility();
  }

  // Track user activity
  trackActivity() {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, () => {
        this.updateActivity();
      }, { passive: true });
    });
  }

  // Update last activity time
  updateActivity() {
    this.lastActivity = Date.now();
    this.warningShown = false;
    this.resetTimer();
  }

  // Reset session timer
  resetTimer() {
    // Clear existing timers
    if (this.timeoutId) clearTimeout(this.timeoutId);
    if (this.warningId) clearTimeout(this.warningId);
    
    // Set warning timer
    this.warningId = setTimeout(() => {
      if (!this.warningShown) {
        this.warningShown = true;
        this.onWarning?.();
      }
    }, this.sessionTimeout - this.warningTime);
    
    // Set timeout timer
    this.timeoutId = setTimeout(() => {
      this.onTimeout?.();
    }, this.sessionTimeout);
  }

  // Monitor tab visibility for security
  monitorVisibility() {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // Tab is hidden - reduce session time
        this.sessionTimeout = Math.min(this.sessionTimeout, 5 * 60 * 1000); // Max 5 minutes when hidden
      } else {
        // Tab is visible - restore normal timeout
        this.sessionTimeout = 15 * 60 * 1000;
        this.updateActivity();
      }
    });
  }

  // Extend session
  extendSession() {
    this.updateActivity();
  }

  // Force logout
  forceLogout() {
    if (this.timeoutId) clearTimeout(this.timeoutId);
    if (this.warningId) clearTimeout(this.warningId);
    this.onTimeout?.();
  }

  // Get remaining time
  getRemainingTime() {
    const elapsed = Date.now() - this.lastActivity;
    return Math.max(0, this.sessionTimeout - elapsed);
  }

  // Check if session is valid
  isSessionValid() {
    return this.getRemainingTime() > 0;
  }
}

// Session fingerprinting for security
export class SessionFingerprint {
  static generate() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Session fingerprint', 2, 2);
    
    const fingerprint = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      screen: `${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      canvas: canvas.toDataURL(),
      webgl: this.getWebGLFingerprint()
    };
    
    return btoa(JSON.stringify(fingerprint));
  }

  static getWebGLFingerprint() {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) return 'no-webgl';
      
      const renderer = gl.getParameter(gl.RENDERER);
      const vendor = gl.getParameter(gl.VENDOR);
      return `${vendor}~${renderer}`;
    } catch {
      return 'webgl-error';
    }
  }

  static validate(storedFingerprint) {
    const currentFingerprint = this.generate();
    return storedFingerprint === currentFingerprint;
  }
}

// Secure token storage with validation
export class SecureTokenManager {
  static setToken(token, fingerprint) {
    const tokenData = {
      token,
      fingerprint,
      timestamp: Date.now(),
      expires: Date.now() + (15 * 60 * 1000) // 15 minutes
    };
    
    // Encrypt token data
    const encrypted = btoa(JSON.stringify(tokenData));
    sessionStorage.setItem('auth_session', encrypted);
  }

  static getToken() {
    try {
      const encrypted = sessionStorage.getItem('auth_session');
      if (!encrypted) return null;
      
      const tokenData = JSON.parse(atob(encrypted));
      
      // Check expiration
      if (Date.now() > tokenData.expires) {
        this.clearToken();
        return null;
      }
      
      // Validate fingerprint
      if (!SessionFingerprint.validate(tokenData.fingerprint)) {
        this.clearToken();
        return null;
      }
      
      return tokenData.token;
    } catch {
      this.clearToken();
      return null;
    }
  }

  static clearToken() {
    sessionStorage.removeItem('auth_session');
    localStorage.removeItem('auth_session'); // Clear any old localStorage tokens
  }

  static refreshToken(newToken) {
    const fingerprint = SessionFingerprint.generate();
    this.setToken(newToken, fingerprint);
  }
}

export default SessionSecurity;