/**
 * Security Audit Logger
 * Tracks all security-relevant events
 */

const { logger } = require('./logger');
const supabase = require('../supabaseClient');

// Security event types
const SECURITY_EVENTS = {
  // Authentication
  LOGIN_SUCCESS: 'login_success',
  LOGIN_FAILURE: 'login_failure',
  LOGOUT: 'logout',
  PASSWORD_CHANGE: 'password_change',
  PASSWORD_RESET_REQUEST: 'password_reset_request',
  PASSWORD_RESET_SUCCESS: 'password_reset_success',
  
  // Authorization
  UNAUTHORIZED_ACCESS: 'unauthorized_access',
  PRIVILEGE_ESCALATION_ATTEMPT: 'privilege_escalation_attempt',
  ROLE_CHANGE: 'role_change',
  
  // Security Threats
  SQL_INJECTION_ATTEMPT: 'sql_injection_attempt',
  XSS_ATTEMPT: 'xss_attempt',
  CSRF_VIOLATION: 'csrf_violation',
  RATE_LIMIT_EXCEEDED: 'rate_limit_exceeded',
  SUSPICIOUS_ACTIVITY: 'suspicious_activity',
  
  // Data Access
  SENSITIVE_DATA_ACCESS: 'sensitive_data_access',
  DATA_EXPORT: 'data_export',
  BULK_OPERATION: 'bulk_operation',
  
  // System
  CONFIG_CHANGE: 'config_change',
  SECURITY_SETTING_CHANGE: 'security_setting_change'
};

// Severity levels
const SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

/**
 * Log security event
 */
const logSecurityEvent = async ({
  eventType,
  severity = SEVERITY.MEDIUM,
  userId = null,
  ipAddress = null,
  userAgent = null,
  details = {},
  success = true
}) => {
  try {
    const event = {
      event_type: eventType,
      severity,
      user_id: userId,
      ip_address: ipAddress,
      user_agent: userAgent,
      details: JSON.stringify(details),
      success,
      timestamp: new Date().toISOString()
    };

    // Log to console
    logger.info('Security Event', event);

    // Store in database
    const { error } = await supabase
      .from('security_audit_logs')
      .insert([event]);

    if (error) {
      logger.error('Failed to store security audit log:', error);
    }

    // Alert on critical events
    if (severity === SEVERITY.CRITICAL) {
      await alertSecurityTeam(event);
    }

    return true;
  } catch (error) {
    logger.error('Security audit logging error:', error);
    return false;
  }
};

/**
 * Alert security team for critical events
 */
const alertSecurityTeam = async (event) => {
  try {
    // Implement your alerting mechanism (email, Slack, PagerDuty, etc.)
    logger.warn('CRITICAL SECURITY EVENT', event);
    
    // Example: Send email alert
    // await emailService.sendSecurityAlert(event);
    
    return true;
  } catch (error) {
    logger.error('Failed to alert security team:', error);
    return false;
  }
};

/**
 * Middleware to log security events
 */
const auditMiddleware = (eventType, severity = SEVERITY.MEDIUM) => {
  return async (req, res, next) => {
    const originalSend = res.send;
    
    res.send = function(data) {
      const success = res.statusCode < 400;
      
      logSecurityEvent({
        eventType,
        severity,
        userId: req.user?.id,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        details: {
          method: req.method,
          path: req.path,
          statusCode: res.statusCode,
          body: req.body
        },
        success
      });
      
      originalSend.call(this, data);
    };
    
    next();
  };
};

/**
 * Get security audit logs
 */
const getAuditLogs = async (filters = {}) => {
  try {
    let query = supabase
      .from('security_audit_logs')
      .select('*')
      .order('timestamp', { ascending: false });

    if (filters.userId) {
      query = query.eq('user_id', filters.userId);
    }

    if (filters.eventType) {
      query = query.eq('event_type', filters.eventType);
    }

    if (filters.severity) {
      query = query.eq('severity', filters.severity);
    }

    if (filters.startDate) {
      query = query.gte('timestamp', filters.startDate);
    }

    if (filters.endDate) {
      query = query.lte('timestamp', filters.endDate);
    }

    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) throw error;

    return { success: true, logs: data };
  } catch (error) {
    logger.error('Failed to fetch audit logs:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Detect suspicious patterns
 */
const detectSuspiciousActivity = async (userId, timeWindow = 3600000) => {
  try {
    const startTime = new Date(Date.now() - timeWindow).toISOString();

    const { data, error } = await supabase
      .from('security_audit_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('timestamp', startTime);

    if (error) throw error;

    const suspiciousPatterns = {
      multipleFailedLogins: data.filter(log => 
        log.event_type === SECURITY_EVENTS.LOGIN_FAILURE
      ).length >= 5,
      
      rapidRequests: data.length > 100,
      
      privilegeEscalation: data.some(log => 
        log.event_type === SECURITY_EVENTS.PRIVILEGE_ESCALATION_ATTEMPT
      ),
      
      multipleLocations: new Set(data.map(log => log.ip_address)).size > 3
    };

    const isSuspicious = Object.values(suspiciousPatterns).some(Boolean);

    if (isSuspicious) {
      await logSecurityEvent({
        eventType: SECURITY_EVENTS.SUSPICIOUS_ACTIVITY,
        severity: SEVERITY.HIGH,
        userId,
        details: suspiciousPatterns
      });
    }

    return { isSuspicious, patterns: suspiciousPatterns };
  } catch (error) {
    logger.error('Failed to detect suspicious activity:', error);
    return { isSuspicious: false, patterns: {} };
  }
};

module.exports = {
  SECURITY_EVENTS,
  SEVERITY,
  logSecurityEvent,
  auditMiddleware,
  getAuditLogs,
  detectSuspiciousActivity
};
