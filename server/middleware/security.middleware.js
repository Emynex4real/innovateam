/**
 * Enterprise Security Middleware
 * Implements OWASP Top 10 protections
 */

const crypto = require('crypto');
const { logger } = require('../utils/logger');

// SQL Injection Protection
const sqlInjectionProtection = (req, res, next) => {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|DECLARE)\b)/gi,
    /(--|\;|\/\*|\*\/|xp_|sp_)/gi,
    /('|(\\')|(;)|(\-\-)|(\/\*))/gi
  ];

  const checkValue = (value) => {
    if (typeof value === 'string') {
      return sqlPatterns.some(pattern => pattern.test(value));
    }
    if (typeof value === 'object' && value !== null) {
      return Object.values(value).some(checkValue);
    }
    return false;
  };

  if (checkValue(req.body) || checkValue(req.query) || checkValue(req.params)) {
    logger.warn('SQL injection attempt detected', { 
      ip: req.ip, 
      path: req.path,
      body: req.body 
    });
    return res.status(400).json({ 
      success: false, 
      error: 'Invalid input detected' 
    });
  }

  next();
};

// NoSQL Injection Protection
const noSqlInjectionProtection = (req, res, next) => {
  const sanitize = (obj) => {
    if (obj && typeof obj === 'object') {
      Object.keys(obj).forEach(key => {
        if (key.startsWith('$') || key.includes('.')) {
          delete obj[key];
        } else if (typeof obj[key] === 'object') {
          sanitize(obj[key]);
        }
      });
    }
  };

  sanitize(req.body);
  sanitize(req.query);
  sanitize(req.params);
  next();
};

// Path Traversal Protection
const pathTraversalProtection = (req, res, next) => {
  const pathPatterns = [
    /\.\./g,
    /\.\\/g,
    /\.\//g,
    /%2e%2e/gi,
    /%252e%252e/gi
  ];

  const checkPath = (value) => {
    if (typeof value === 'string') {
      return pathPatterns.some(pattern => pattern.test(value));
    }
    return false;
  };

  const allValues = [
    ...Object.values(req.body || {}),
    ...Object.values(req.query || {}),
    ...Object.values(req.params || {})
  ];

  if (allValues.some(checkPath)) {
    logger.warn('Path traversal attempt detected', { 
      ip: req.ip, 
      path: req.path 
    });
    return res.status(400).json({ 
      success: false, 
      error: 'Invalid path detected' 
    });
  }

  next();
};

// Command Injection Protection
const commandInjectionProtection = (req, res, next) => {
  const cmdPatterns = [
    /[;&|`$(){}[\]<>]/g,
    /\n|\r/g
  ];

  const checkCommand = (value) => {
    if (typeof value === 'string') {
      return cmdPatterns.some(pattern => pattern.test(value));
    }
    return false;
  };

  const allValues = [
    ...Object.values(req.body || {}),
    ...Object.values(req.query || {}),
    ...Object.values(req.params || {})
  ];

  if (allValues.some(checkCommand)) {
    logger.warn('Command injection attempt detected', { 
      ip: req.ip, 
      path: req.path 
    });
    return res.status(400).json({ 
      success: false, 
      error: 'Invalid input detected' 
    });
  }

  next();
};

// Request Signing & Verification
const requestSignature = (req, res, next) => {
  if (process.env.NODE_ENV === 'development') return next();

  const timestamp = req.headers['x-timestamp'];
  const signature = req.headers['x-signature'];

  if (!timestamp || !signature) {
    return res.status(401).json({ 
      success: false, 
      error: 'Missing security headers' 
    });
  }

  // Check timestamp (prevent replay attacks)
  const now = Date.now();
  const requestTime = parseInt(timestamp);
  if (Math.abs(now - requestTime) > 300000) { // 5 minutes
    return res.status(401).json({ 
      success: false, 
      error: 'Request expired' 
    });
  }

  // Verify signature
  const payload = JSON.stringify(req.body) + timestamp;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.REQUEST_SIGNING_SECRET || 'fallback-secret')
    .update(payload)
    .digest('hex');

  if (signature !== expectedSignature) {
    logger.warn('Invalid request signature', { 
      ip: req.ip, 
      path: req.path 
    });
    return res.status(401).json({ 
      success: false, 
      error: 'Invalid signature' 
    });
  }

  next();
};

// Content Type Validation
const contentTypeValidation = (req, res, next) => {
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const contentType = req.headers['content-type'];
    // Allow multipart/form-data for file uploads
    if (!contentType || 
        (!contentType.includes('application/json') && 
         !contentType.includes('multipart/form-data'))) {
      return res.status(415).json({ 
        success: false, 
        error: 'Unsupported content type' 
      });
    }
  }
  next();
};

// Security Headers
const securityHeaders = (req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.removeHeader('X-Powered-By');
  next();
};

// IP Whitelist/Blacklist
const ipFiltering = (req, res, next) => {
  const blacklist = (process.env.IP_BLACKLIST || '').split(',').filter(Boolean);
  const whitelist = (process.env.IP_WHITELIST || '').split(',').filter(Boolean);

  const clientIp = req.ip || req.connection.remoteAddress;

  if (blacklist.includes(clientIp)) {
    logger.warn('Blocked IP attempt', { ip: clientIp });
    return res.status(403).json({ 
      success: false, 
      error: 'Access denied' 
    });
  }

  if (whitelist.length > 0 && !whitelist.includes(clientIp)) {
    logger.warn('Non-whitelisted IP attempt', { ip: clientIp });
    return res.status(403).json({ 
      success: false, 
      error: 'Access denied' 
    });
  }

  next();
};

module.exports = {
  sqlInjectionProtection,
  noSqlInjectionProtection,
  pathTraversalProtection,
  commandInjectionProtection,
  requestSignature,
  contentTypeValidation,
  securityHeaders,
  ipFiltering
};
