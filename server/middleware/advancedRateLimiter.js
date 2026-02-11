/**
 * Advanced Rate Limiter - Industry Standard
 * Multi-tier rate limiting with Redis-backed stores (in-memory fallback).
 */

const rateLimit = require('express-rate-limit');
const { logSecurityEvent, SECURITY_EVENTS, SEVERITY } = require('../utils/auditLogger');
const { createStore } = require('../stores/rateLimitStore');

// Tier 1: Authentication (Strictest - Brute Force Protection)
const authWindowMs = 15 * 60 * 1000;
const authLimiter = rateLimit({
  windowMs: authWindowMs,
  max: 5,
  message: {
    success: false,
    error: 'Too many authentication attempts. Please try again in 15 minutes.',
    retryAfter: 900
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  store: createStore(authWindowMs),
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
const financialWindowMs = 60 * 60 * 1000;
const financialLimiter = rateLimit({
  windowMs: financialWindowMs,
  max: 20,
  message: {
    success: false,
    error: 'Transaction limit exceeded. Please try again in 1 hour.',
    retryAfter: 3600
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id || req.ip,
  store: createStore(financialWindowMs),
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
const aiWindowMs = 60 * 60 * 1000;
const aiLimiter = rateLimit({
  windowMs: aiWindowMs,
  max: 10,
  message: {
    success: false,
    error: 'AI generation limit exceeded. Please try again in 1 hour.',
    retryAfter: 3600
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id || req.ip,
  store: createStore(aiWindowMs),
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
const sensitiveWindowMs = 15 * 60 * 1000;
const sensitiveOpLimiter = rateLimit({
  windowMs: sensitiveWindowMs,
  max: 10,
  message: {
    success: false,
    error: 'Too many requests. Please try again later.',
    retryAfter: 900
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id || req.ip,
  store: createStore(sensitiveWindowMs)
});

// Tier 5: Admin Operations (Moderate)
const adminWindowMs = 15 * 60 * 1000;
const adminLimiter = rateLimit({
  windowMs: adminWindowMs,
  max: 100,
  message: {
    success: false,
    error: 'Too many admin requests. Please try again later.',
    retryAfter: 900
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id || req.ip,
  store: createStore(adminWindowMs)
});

// Tier 6: General API (Lenient)
const apiWindowMs = 15 * 60 * 1000;
const apiLimiter = rateLimit({
  windowMs: apiWindowMs,
  max: 100,
  message: {
    success: false,
    error: 'Too many requests. Please try again later.',
    retryAfter: 900
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id || req.ip,
  store: createStore(apiWindowMs)
});

// IP-based limiter (for unauthenticated requests)
const ipWindowMs = 15 * 60 * 1000;
const ipLimiter = rateLimit({
  windowMs: ipWindowMs,
  max: 50,
  keyGenerator: (req) => req.ip,
  message: {
    success: false,
    error: 'Too many requests from this IP. Please try again later.',
    retryAfter: 900
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: createStore(ipWindowMs)
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
  legacyHeaders: false,
  store: createStore(windowMs)
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
