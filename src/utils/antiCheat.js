// Anti-Cheat Tracking Utilities
// Frontend integration for behavioral biometrics

export class AntiCheatTracker {
  constructor() {
    this.events = [];
    this.startTime = null;
    this.deviceFingerprint = null;
  }

  // Initialize tracking
  init() {
    this.startTime = Date.now();
    this.deviceFingerprint = this.generateFingerprint();
    this.setupListeners();
  }

  // Generate device fingerprint
  generateFingerprint() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('fingerprint', 2, 2);
    
    return {
      canvas: canvas.toDataURL().slice(-50),
      screen: `${window.screen.width}x${window.screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      platform: navigator.platform,
      userAgent: navigator.userAgent.slice(0, 100)
    };
  }

  // Setup event listeners
  setupListeners() {
    // Tab switching detection
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.logEvent('tab_switch', { timestamp: Date.now() - this.startTime });
      }
    });

    // Copy-paste detection
    document.addEventListener('paste', (e) => {
      const content = e.clipboardData.getData('text');
      if (content.length > 10) {
        this.logEvent('copy_paste', { 
          content_length: content.length,
          timestamp: Date.now() - this.startTime 
        });
      }
    });

    // Right-click detection
    document.addEventListener('contextmenu', (e) => {
      this.logEvent('right_click', { timestamp: Date.now() - this.startTime });
    });
  }

  // Log suspicious event
  logEvent(type, data) {
    this.events.push({
      type,
      time: new Date().toISOString(),
      ...data
    });
  }

  // Track answer timing
  trackAnswer(questionId, timeTaken) {
    // Flag if answered too quickly (< 3 seconds)
    if (timeTaken < 3000) {
      this.logEvent('rapid_answer', {
        question_id: questionId,
        duration_ms: timeTaken,
        timestamp: Date.now() - this.startTime
      });
    }
  }

  // Get all events for submission
  getEvents() {
    return this.events;
  }

  // Get device fingerprint
  getFingerprint() {
    return JSON.stringify(this.deviceFingerprint);
  }

  // Reset tracker
  reset() {
    this.events = [];
    this.startTime = null;
  }
}
