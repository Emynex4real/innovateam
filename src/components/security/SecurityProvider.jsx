import React, { createContext, useContext, useEffect, useState } from 'react';
import { SecurityUtils, MONITORING_CONFIG } from '../../config/security';
import logger from '../../utils/logger';

const SecurityContext = createContext(null);

export const SecurityProvider = ({ children }) => {
  const [securityState, setSecurityState] = useState({
    sessionId: null,
    lastActivity: Date.now(),
    failedAttempts: 0,
    isSecureContext: false,
    cspViolations: []
  });

  useEffect(() => {
    // Initialize security context
    const initSecurity = () => {
      const sessionId = SecurityUtils.generateSessionId();
      const isSecureContext = window.location.protocol === 'https:' || 
                             window.location.hostname === 'localhost';

      setSecurityState(prev => ({
        ...prev,
        sessionId,
        isSecureContext
      }));

      logger.security('Security context initialized', {
        sessionId: sessionId.slice(0, 8) + '...',
        isSecure: isSecureContext
      });
    };

    initSecurity();

    // Set up CSP violation reporting
    const handleCSPViolation = (event) => {
      const violation = {
        blockedURI: event.blockedURI,
        violatedDirective: event.violatedDirective,
        originalPolicy: event.originalPolicy,
        timestamp: Date.now()
      };

      setSecurityState(prev => ({
        ...prev,
        cspViolations: [...prev.cspViolations.slice(-9), violation] // Keep last 10
      }));

      logger.security('CSP violation detected', violation);
    };

    // Listen for CSP violations
    document.addEventListener('securitypolicyviolation', handleCSPViolation);

    // Activity tracking
    const trackActivity = () => {
      setSecurityState(prev => ({
        ...prev,
        lastActivity: Date.now()
      }));
    };

    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    activityEvents.forEach(event => {
      document.addEventListener(event, trackActivity, { passive: true });
    });

    // Cleanup
    return () => {
      document.removeEventListener('securitypolicyviolation', handleCSPViolation);
      activityEvents.forEach(event => {
        document.removeEventListener(event, trackActivity);
      });
    };
  }, []);

  // Security monitoring functions
  const reportSecurityEvent = (eventType, details = {}) => {
    const event = {
      type: eventType,
      timestamp: Date.now(),
      sessionId: securityState.sessionId,
      userAgent: navigator.userAgent,
      url: window.location.href,
      ...details
    };

    logger.security(`Security event: ${eventType}`, event);

    // Update security state based on event type
    if (eventType === 'failed_login') {
      setSecurityState(prev => ({
        ...prev,
        failedAttempts: prev.failedAttempts + 1
      }));
    } else if (eventType === 'successful_login') {
      setSecurityState(prev => ({
        ...prev,
        failedAttempts: 0
      }));
    }
  };

  const checkSecurityThresholds = () => {
    const { failedAttempts } = securityState;
    
    if (failedAttempts >= MONITORING_CONFIG.ALERT_THRESHOLD.FAILED_LOGINS) {
      reportSecurityEvent('security_alert', {
        reason: 'excessive_failed_logins',
        count: failedAttempts
      });
      return false;
    }

    return true;
  };

  const validateSecureContext = () => {
    if (!securityState.isSecureContext) {
      logger.security('Insecure context detected');
      return false;
    }
    return true;
  };

  const isSessionActive = () => {
    const inactiveTime = Date.now() - securityState.lastActivity;
    const maxInactiveTime = 30 * 60 * 1000; // 30 minutes
    
    return inactiveTime < maxInactiveTime;
  };

  const generateNonce = () => {
    return SecurityUtils.generateSecureRandom(16);
  };

  const value = {
    // State
    securityState,
    
    // Security checks
    validateSecureContext,
    checkSecurityThresholds,
    isSessionActive,
    
    // Reporting
    reportSecurityEvent,
    
    // Utilities
    generateNonce,
    
    // Security status
    isSecure: securityState.isSecureContext && isSessionActive(),
    hasViolations: securityState.cspViolations.length > 0,
    failedAttempts: securityState.failedAttempts
  };

  return (
    <SecurityContext.Provider value={value}>
      {children}
    </SecurityContext.Provider>
  );
};

export const useSecurity = () => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
};

// HOC for components that need security validation
export const withSecurity = (WrappedComponent, options = {}) => {
  const { requireSecureContext = true, requireActiveSession = true } = options;

  return function SecurityWrappedComponent(props) {
    const security = useSecurity();
    const [isSecurityValid, setIsSecurityValid] = useState(false);

    useEffect(() => {
      const validateSecurity = () => {
        let isValid = true;

        if (requireSecureContext && !security.validateSecureContext()) {
          isValid = false;
        }

        if (requireActiveSession && !security.isSessionActive()) {
          isValid = false;
        }

        if (!security.checkSecurityThresholds()) {
          isValid = false;
        }

        setIsSecurityValid(isValid);

        if (!isValid) {
          security.reportSecurityEvent('security_validation_failed', {
            component: WrappedComponent.name,
            requireSecureContext,
            requireActiveSession
          });
        }
      };

      validateSecurity();
      const interval = setInterval(validateSecurity, 60000); // Check every minute

      return () => clearInterval(interval);
    }, [security]);

    if (!isSecurityValid) {
      return (
        <div className="security-warning">
          <h3>Security Validation Failed</h3>
          <p>This component requires a secure context to function properly.</p>
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };
};

export default SecurityContext;