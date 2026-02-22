import { useEffect, useRef, useState } from 'react';

export const useAntiCheat = (testId, onViolation) => {
  const [violations, setViolations] = useState([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const sessionIdRef = useRef(null);
  const violationsRef = useRef([]);

  const logViolation = (type, metadata = {}) => {
    const violation = {
      type,
      timestamp: new Date().toISOString(),
      metadata
    };
    
    violationsRef.current.push(violation);
    setViolations(prev => [...prev, violation]);
    
    if (onViolation) onViolation(violation);
  };

  useEffect(() => {
    if (!testId) return;

    setIsMonitoring(true);
    let blurTime = null;
    let heartbeatInterval = null;

    // 1. Tab/Window Switch Detection
    const handleVisibilityChange = () => {
      if (document.hidden) {
        blurTime = Date.now();
        logViolation('TAB_SWITCH', { action: 'hidden' });
      } else if (blurTime) {
        const duration = Date.now() - blurTime;
        logViolation('FOCUS_LOSS', { duration });
        blurTime = null;
      }
    };

    const handleBlur = () => {
      if (!blurTime) {
        blurTime = Date.now();
        logViolation('FOCUS_LOSS', { action: 'blur' });
      }
    };

    const handleFocus = () => {
      if (blurTime) {
        const duration = Date.now() - blurTime;
        logViolation('FOCUS_LOSS', { duration, action: 'focus_return' });
        blurTime = null;
      }
    };

    // 2. Copy/Paste/Cut Detection
    const handleCopy = (e) => {
      e.preventDefault();
      logViolation('COPY_ATTEMPT');
    };

    const handlePaste = (e) => {
      e.preventDefault();
      logViolation('PASTE_ATTEMPT');
    };

    const handleCut = (e) => {
      e.preventDefault();
      logViolation('CUT_ATTEMPT');
    };

    // 3. Right-Click Detection
    const handleContextMenu = (e) => {
      e.preventDefault();
      logViolation('RIGHT_CLICK');
    };

    // 4. Keyboard Shortcuts Detection
    const handleKeyDown = (e) => {
      // F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
        (e.ctrlKey && e.key === 'U')
      ) {
        e.preventDefault();
        logViolation('DEVTOOLS_ATTEMPT', { key: e.key });
      }

      // Ctrl+C, Ctrl+V, Ctrl+X
      if (e.ctrlKey && ['c', 'v', 'x'].includes(e.key.toLowerCase())) {
        e.preventDefault();
        logViolation('KEYBOARD_SHORTCUT', { key: e.key });
      }

      // Print Screen
      if (e.key === 'PrintScreen') {
        logViolation('SCREENSHOT_ATTEMPT');
      }
    };

    // 5. Fullscreen Exit Detection
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        logViolation('FULLSCREEN_EXIT');
      }
    };

    // 6. Mouse Leave Detection
    const handleMouseLeave = () => {
      logViolation('MOUSE_LEAVE');
    };

    // 7. Heartbeat (detect disconnection)
    heartbeatInterval = setInterval(() => {
      if (document.hidden) {
        logViolation('HEARTBEAT_HIDDEN');
      }
    }, 30000); // Every 30 seconds

    // Attach listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('paste', handlePaste);
    document.addEventListener('cut', handleCut);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('mouseleave', handleMouseLeave);

    // Disable text selection
    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';

    // Request fullscreen
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {
        logViolation('FULLSCREEN_DENIED');
      });
    }

    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('paste', handlePaste);
      document.removeEventListener('cut', handleCut);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('mouseleave', handleMouseLeave);
      
      if (heartbeatInterval) clearInterval(heartbeatInterval);
      
      document.body.style.userSelect = '';
      document.body.style.webkitUserSelect = '';
      
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
      
      setIsMonitoring(false);
    };
  }, [testId]);

  const getFingerprint = () => {
    return {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      timestamp: new Date().toISOString()
    };
  };

  const getViolations = () => violationsRef.current;

  const reset = () => {
    violationsRef.current = [];
    setViolations([]);
  };

  return {
    violations,
    isMonitoring,
    getViolations,
    getFingerprint,
    reset,
    sessionId: sessionIdRef.current
  };
};
