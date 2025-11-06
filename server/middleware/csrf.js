const crypto = require('crypto');

// Simple CSRF token store (in production, use Redis or database)
const csrfTokens = new Map();

// Generate CSRF token
const generateCSRFToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// CSRF middleware
const csrfProtection = (req, res, next) => {
  // Skip CSRF for GET requests and API validation endpoints
  if (req.method === 'GET' || req.path === '/api/auth/validate') {
    return next();
  }

  // Generate and send token for token requests
  if (req.path === '/api/csrf-token') {
    const token = generateCSRFToken();
    const sessionId = req.sessionID || req.ip + req.get('user-agent');
    csrfTokens.set(sessionId, token);
    
    // Clean up old tokens (simple cleanup)
    if (csrfTokens.size > 1000) {
      const keys = Array.from(csrfTokens.keys());
      keys.slice(0, 500).forEach(key => csrfTokens.delete(key));
    }
    
    return res.json({ csrfToken: token });
  }

  // Verify CSRF token for state-changing requests
  const token = req.headers['x-csrf-token'] || req.body._csrf;
  const sessionId = req.sessionID || req.ip + req.get('user-agent');
  
  if (!token) {
    return res.status(403).json({ 
      success: false, 
      error: 'CSRF token missing',
      code: 'CSRF_TOKEN_MISSING'
    });
  }

  const storedToken = csrfTokens.get(sessionId);
  if (!storedToken || storedToken !== token) {
    return res.status(403).json({ 
      success: false, 
      error: 'Invalid CSRF token',
      code: 'CSRF_TOKEN_INVALID'
    });
  }

  // Token is valid, remove it (one-time use)
  csrfTokens.delete(sessionId);
  next();
};

// Route to get CSRF token
const csrfTokenRoute = (req, res) => {
  const token = generateCSRFToken();
  const sessionId = req.sessionID || req.ip + req.get('user-agent');
  csrfTokens.set(sessionId, token);
  res.json({ csrfToken: token });
};

module.exports = {
  csrfProtection,
  csrfTokenRoute,
  generateCSRFToken
};