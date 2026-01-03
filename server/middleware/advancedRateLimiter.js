/**
 * Advanced Rate Limiter - Industry Standard
 * Multi-tier rate limiting for different endpoint types
 */

const rateLimit = require('express-rate-limit');
const { logSecurityEvent, SECURITY_EVENTS, SEVERITY } = require('../utils/auditLogger');

// Tier 1: Authentication (Strictest - Brute Force Protection)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: {
    success: false,
    error: 'Too many authentication attempts. Please try again in 15 minutes.',
    retryAfter: 900 // seconds
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful logins
  handler: (req, res) => {
    logSecurityEvent({
      eventType: SECURITY_EVENTS.RATE_LIMIT_EXCEEDED,
      severity: SEVERITY.HIGH,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      details: { endpoint: req.path, type: 'authentication' }
    });
    
    res.status(429).json({
      success: false,
      error: 'Too many authentication attempts. Please try again in 15 minutes.',
      retryAfter: 900
    });
  }
});

// Tier 2: Financial Operations (Very Strict)
const financialLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 transactions per hour
  message: {
    success: false,
    error: 'Transaction limit exceeded. Please try again in 1 hour.',
    retryAfter: 3600
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id || req.ip,
  handler: (req, res) => {
    logSecurityEvent({
      eventType: SECURITY_EVENTS.RATE_LIMIT_EXCEEDED,
      severity: SEVERITY.HIGH,
      userId: req.user?.id,
      ipAddress: req.ip,
      details: { endpoint: req.path, type: 'financial' }
    });
    
    res.status(429).json({
      success: false,
      error: 'Transaction limit exceeded. Please try again in 1 hour.',
      retryAfter: 3600
    });
  }
});

// Tier 3: AI Operations (Cost Control)
const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 generations per hour
  message: {
    success: false,
    error: 'AI generation limit exceeded. Please try again in 1 hour.',
    retryAfter: 3600
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id || req.ip,
  handler: (req, res) => {
    logSecurityEvent({
      eventType: SECURITY_EVENTS.RATE_LIMIT_EXCEEDED,
      severity: SEVERITY.MEDIUM,
      userId: req.user?.id,
      ipAddress: req.ip,
      details: { endpoint: req.path, type: 'ai' }
    });
    
    res.status(429).json({
      success: false,
      error: 'AI generation limit exceeded. Please try again in 1 hour.',
      retryAfter: 3600
    });
  }
});

// Tier 4: Sensitive Operations (Strict)
const sensitiveOpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 operations per window
  message: {
    success: false,
    error: 'Too many requests. Please try again later.',
    retryAfter: 900
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id || req.ip,
  handler: (req, res) => {
    logSecurityEvent({
      eventType: SECURITY_EVENTS.RATE_LIMIT_EXCEEDED,
      severity: SEVERITY.MEDIUM,
      userId: req.user?.id,
      ipAddress: req.ip,
      details: { endpoint: req.path, type: 'sensitive' }
    });
    
    res.status(429).json({
      success: false,
      error: 'Too many requests. Please try again later.',
      retryAfter: 900
    });
  }
});

// Tier 5: Admin Operations (Moderate)
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: {
    success: false,
    error: 'Too many admin requests. Please try again later.',
    retryAfter: 900
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id || req.ip
});

// Tier 6: General API (Lenient)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: {
    success: false,
    error: 'Too many requests. Please try again later.',
    retryAfter: 900
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id || req.ip
});

// IP-based limiter (for unauthenticated requests)
const ipLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  keyGenerator: (req) => req.ip,
  message: {
    success: false,
    error: 'Too many requests from this IP. Please try again later.',
    retryAfter: 900
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Custom user-based limiter factory
const userLimiter = (max, windowMs = 15 * 60 * 1000) => rateLimit({
  windowMs,
  max,
  keyGenerator: (req) => req.user?.id || req.ip,
  message: {
    success: false,
    error: 'Rate limit exceeded. Please try again later.',
    retryAfter: Math.floor(windowMs / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = {
  authLimiter,
  financialLimiter,
  aiLimiter,
  sensitiveOpLimiter,
  adminLimiter,
  apiLimiter,
  ipLimiter,
  userLimiter
};
