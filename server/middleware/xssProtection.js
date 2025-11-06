// Server-side XSS Protection Middleware
const xss = require('xss');

// XSS Protection configuration
const xssOptions = {
  whiteList: {
    // Allow only safe tags
    p: [],
    br: [],
    strong: [],
    em: [],
    b: [],
    i: []
  },
  stripIgnoreTag: true,
  stripIgnoreTagBody: ['script', 'style'],
  allowCommentTag: false,
  onIgnoreTagAttr: (tag, name, value) => {
    // Log suspicious attributes
    console.warn(`XSS: Removed attribute ${name}="${value}" from tag ${tag}`);
  }
};

// Sanitize object recursively
function sanitizeObject(obj, depth = 0) {
  if (depth > 10) return obj; // Prevent deep recursion
  
  if (typeof obj === 'string') {
    return xss(obj, xssOptions);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item, depth + 1));
  }
  
  if (obj && typeof obj === 'object') {
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      // Skip sensitive fields that shouldn't be sanitized
      if (['password', 'token', 'secret', 'key'].some(field => 
        key.toLowerCase().includes(field))) {
        sanitized[key] = value;
      } else {
        sanitized[key] = sanitizeObject(value, depth + 1);
      }
    }
    return sanitized;
  }
  
  return obj;
}

// XSS Protection Middleware
const xssProtection = (req, res, next) => {
  try {
    // Sanitize request body
    if (req.body && typeof req.body === 'object') {
      req.body = sanitizeObject(req.body);
    }
    
    // Sanitize query parameters
    if (req.query && typeof req.query === 'object') {
      req.query = sanitizeObject(req.query);
    }
    
    // Sanitize URL parameters
    if (req.params && typeof req.params === 'object') {
      req.params = sanitizeObject(req.params);
    }
    
    // Add XSS protection headers
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    next();
  } catch (error) {
    console.error('XSS Protection Error:', error);
    res.status(400).json({
      success: false,
      error: 'Invalid request data',
      code: 'XSS_PROTECTION_ERROR'
    });
  }
};

// Sanitize response data
const sanitizeResponse = (data) => {
  return sanitizeObject(data);
};

module.exports = {
  xssProtection,
  sanitizeResponse,
  sanitizeObject
};