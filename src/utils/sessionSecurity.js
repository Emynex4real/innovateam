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

// Session fingerprinting for security (uses SHA-256 hash instead of plaintext)
export class SessionFingerprint {
  static async generate() {
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

    const encoded = new TextEncoder().encode(JSON.stringify(fingerprint));
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);
    return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
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

  static async validate(storedFingerprint) {
    const currentFingerprint = await this.generate();
    return storedFingerprint === currentFingerprint;
  }
}

// Secure token storage using AES-GCM encryption via Web Crypto API
export class SecureTokenManager {
  static _keyPromise = null;

  static async _getKey() {
    if (this._keyPromise) return this._keyPromise;

    this._keyPromise = (async () => {
      const storedKey = sessionStorage.getItem('_sk');
      if (storedKey) {
        const rawKey = Uint8Array.from(atob(storedKey), c => c.charCodeAt(0));
        return crypto.subtle.importKey('raw', rawKey, 'AES-GCM', true, ['encrypt', 'decrypt']);
      }
      const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
      const exported = await crypto.subtle.exportKey('raw', key);
      sessionStorage.setItem('_sk', btoa(String.fromCharCode(...new Uint8Array(exported))));
      return key;
    })();

    return this._keyPromise;
  }

  static async setToken(token, fingerprint) {
    const tokenData = {
      token,
      fingerprint,
      timestamp: Date.now(),
      expires: Date.now() + (15 * 60 * 1000)
    };

    const key = await this._getKey();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(JSON.stringify(tokenData));
    const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded);

    const combined = new Uint8Array(iv.length + ciphertext.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(ciphertext), iv.length);
    sessionStorage.setItem('auth_session', btoa(String.fromCharCode(...combined)));
  }

  static async getToken() {
    try {
      const stored = sessionStorage.getItem('auth_session');
      if (!stored) return null;

      const key = await this._getKey();
      const combined = Uint8Array.from(atob(stored), c => c.charCodeAt(0));
      const iv = combined.slice(0, 12);
      const ciphertext = combined.slice(12);

      const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);
      const tokenData = JSON.parse(new TextDecoder().decode(decrypted));

      if (Date.now() > tokenData.expires) {
        this.clearToken();
        return null;
      }

      if (!await SessionFingerprint.validate(tokenData.fingerprint)) {
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
    sessionStorage.removeItem('_sk');
    localStorage.removeItem('auth_session');
    this._keyPromise = null;
  }

  static async refreshToken(newToken) {
    const fingerprint = await SessionFingerprint.generate();
    await this.setToken(newToken, fingerprint);
  }
}

export default SessionSecurity;