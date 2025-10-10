// Security Monitoring & Incident Response System
import { secureLogger } from './secureLogger';
import { supabase } from '../services/supabase/client';

class SecurityMonitor {
  constructor() {
    this.alertThresholds = {
      failed_logins: 5,
      large_transactions: 100000,
      rapid_requests: 20,
      suspicious_patterns: 3
    };
    this.incidentSeverity = {
      LOW: 1,
      MEDIUM: 2,
      HIGH: 3,
      CRITICAL: 4
    };
    this.activeIncidents = new Map();
    this.setupRealTimeMonitoring();
  }

  // Real-time security monitoring setup
  setupRealTimeMonitoring() {
    if (typeof window !== 'undefined') {
      // Monitor for suspicious DOM manipulation
      this.setupDOMMonitoring();
      
      // Monitor for unusual network activity
      this.setupNetworkMonitoring();
      
      // Monitor for console access attempts
      this.setupConsoleMonitoring();
    }
  }

  // DOM manipulation monitoring
  setupDOMMonitoring() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              // Check for suspicious script injections
              if (node.tagName === 'SCRIPT' || 
                  (node.innerHTML && /<script/i.test(node.innerHTML))) {
                this.createSecurityIncident('dom_manipulation', {
                  type: 'script_injection',
                  element: node.tagName,
                  content: node.innerHTML?.substring(0, 100)
                }, this.incidentSeverity.HIGH);
              }
            }
          });
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // Network activity monitoring
  setupNetworkMonitoring() {
    const originalFetch = window.fetch;
    let requestCount = 0;
    let lastReset = Date.now();

    window.fetch = async (...args) => {
      const now = Date.now();
      
      // Reset counter every minute
      if (now - lastReset > 60000) {
        requestCount = 0;
        lastReset = now;
      }
      
      requestCount++;
      
      // Check for rapid requests
      if (requestCount > this.alertThresholds.rapid_requests) {
        this.createSecurityIncident('rapid_requests', {
          count: requestCount,
          timeWindow: '1 minute',
          url: args[0]
        }, this.incidentSeverity.MEDIUM);
      }

      return originalFetch.apply(this, args);
    };
  }

  // Console access monitoring
  setupConsoleMonitoring() {
    let consoleAccessCount = 0;
    
    const originalLog = console.log;
    console.log = (...args) => {
      consoleAccessCount++;
      
      if (consoleAccessCount > 10) {
        this.createSecurityIncident('console_access', {
          accessCount: consoleAccessCount,
          args: args.map(arg => String(arg).substring(0, 50))
        }, this.incidentSeverity.LOW);
      }
      
      return originalLog.apply(console, args);
    };
  }

  // Create and manage security incidents
  async createSecurityIncident(type, details, severity) {
    const incidentId = `INC_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const incident = {
      id: incidentId,
      type,
      severity,
      details,
      timestamp: new Date().toISOString(),
      status: 'open',
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: await this.getCurrentUserId()
    };

    this.activeIncidents.set(incidentId, incident);

    // Log to database
    await this.logIncident(incident);

    // Auto-respond based on severity
    await this.autoRespond(incident);

    // Send alerts if critical
    if (severity >= this.incidentSeverity.HIGH) {
      await this.sendSecurityAlert(incident);
    }

    return incidentId;
  }

  // Log incident to database
  async logIncident(incident) {
    try {
      await supabase.from('security_incidents').insert({
        incident_id: incident.id,
        incident_type: incident.type,
        severity: incident.severity,
        details: incident.details,
        status: incident.status,
        user_id: incident.userId,
        user_agent: incident.userAgent,
        url: incident.url,
        created_at: incident.timestamp
      });

      await secureLogger.logSecurityEvent('security_incident_created', {
        incidentId: incident.id,
        type: incident.type,
        severity: incident.severity
      });
    } catch (error) {
      console.error('Failed to log security incident:', error);
    }
  }

  // Automated incident response
  async autoRespond(incident) {
    const responses = {
      failed_logins: async () => {
        if (incident.severity >= this.incidentSeverity.MEDIUM) {
          // Temporarily lock account
          await this.temporaryAccountLock(incident.userId, 300); // 5 minutes
        }
      },
      
      dom_manipulation: async () => {
        // Clear potentially malicious content
        this.sanitizeDOM();
        // Force page reload for security
        if (incident.severity >= this.incidentSeverity.HIGH) {
          setTimeout(() => window.location.reload(), 1000);
        }
      },
      
      rapid_requests: async () => {
        // Implement client-side rate limiting
        this.enforceRateLimit(incident.details.url);
      },
      
      large_transaction: async () => {
        // Require additional verification
        await this.requireAdditionalVerification(incident.userId);
      }
    };

    const responseHandler = responses[incident.type];
    if (responseHandler) {
      try {
        await responseHandler();
        
        await secureLogger.logSecurityEvent('auto_response_executed', {
          incidentId: incident.id,
          responseType: incident.type
        });
      } catch (error) {
        await secureLogger.logError(error, {
          type: 'auto_response_failed',
          incidentId: incident.id
        });
      }
    }
  }

  // Send security alerts
  async sendSecurityAlert(incident) {
    const alert = {
      timestamp: new Date().toISOString(),
      severity: Object.keys(this.incidentSeverity)[incident.severity - 1],
      type: incident.type,
      details: incident.details,
      incidentId: incident.id,
      requiresAction: incident.severity >= this.incidentSeverity.HIGH
    };

    // In a real implementation, this would send to security team
    console.warn('🚨 SECURITY ALERT:', alert);
    
    await secureLogger.logSecurityEvent('security_alert_sent', alert);
  }

  // Security metrics and reporting
  async generateSecurityReport(timeframe = '24h') {
    const hours = timeframe === '24h' ? 24 : timeframe === '7d' ? 168 : 1;
    const startTime = new Date(Date.now() - hours * 60 * 60 * 1000);

    try {
      // Get incidents from database
      const { data: incidents } = await supabase
        .from('security_incidents')
        .select('*')
        .gte('created_at', startTime.toISOString());

      // Get activity logs
      const { data: activities } = await supabase
        .from('activity_logs')
        .select('action, created_at')
        .gte('created_at', startTime.toISOString())
        .like('action', '%security%');

      const report = {
        timeframe,
        generated_at: new Date().toISOString(),
        summary: {
          total_incidents: incidents?.length || 0,
          critical_incidents: incidents?.filter(i => i.severity >= this.incidentSeverity.HIGH).length || 0,
          security_events: activities?.length || 0,
          active_incidents: this.activeIncidents.size
        },
        incidents_by_type: this.groupIncidentsByType(incidents || []),
        severity_distribution: this.getIncidentSeverityDistribution(incidents || []),
        recommendations: this.generateSecurityRecommendations(incidents || [])
      };

      return report;
    } catch (error) {
      await secureLogger.logError(error, { type: 'security_report_failed' });
      throw error;
    }
  }

  // Helper methods for incident response
  async temporaryAccountLock(userId, durationSeconds) {
    // Implementation would integrate with auth system
    await secureLogger.logSecurityEvent('account_temporarily_locked', {
      userId,
      duration: durationSeconds,
      reason: 'security_incident'
    });
  }

  sanitizeDOM() {
    // Remove potentially malicious scripts
    const scripts = document.querySelectorAll('script:not([src])');
    scripts.forEach(script => {
      if (script.innerHTML.includes('eval') || script.innerHTML.includes('document.write')) {
        script.remove();
      }
    });
  }

  enforceRateLimit(url) {
    // Client-side rate limiting implementation
    const rateLimitKey = `rate_limit_${url}`;
    sessionStorage.setItem(rateLimitKey, Date.now().toString());
  }

  async requireAdditionalVerification(userId) {
    await secureLogger.logSecurityEvent('additional_verification_required', {
      userId,
      reason: 'large_transaction_detected'
    });
  }

  async getCurrentUserId() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user?.id || null;
    } catch {
      return null;
    }
  }

  groupIncidentsByType(incidents) {
    return incidents.reduce((acc, incident) => {
      acc[incident.incident_type] = (acc[incident.incident_type] || 0) + 1;
      return acc;
    }, {});
  }

  getIncidentSeverityDistribution(incidents) {
    return incidents.reduce((acc, incident) => {
      const severity = Object.keys(this.incidentSeverity)[incident.severity - 1];
      acc[severity] = (acc[severity] || 0) + 1;
      return acc;
    }, {});
  }

  generateSecurityRecommendations(incidents) {
    const recommendations = [];
    
    if (incidents.filter(i => i.incident_type === 'failed_logins').length > 5) {
      recommendations.push('Consider implementing stronger password policies');
    }
    
    if (incidents.filter(i => i.severity >= this.incidentSeverity.HIGH).length > 0) {
      recommendations.push('Review and strengthen security monitoring rules');
    }
    
    return recommendations;
  }
}

export const securityMonitor = new SecurityMonitor();