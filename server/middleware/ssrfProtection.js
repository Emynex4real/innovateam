const url = require('url');
const net = require('net');

// SSRF Protection Middleware
class SSRFProtection {
  constructor() {
    // Allowed domains for external requests
    this.allowedDomains = [
      'api.deepseek.com',
      'supabase.co',
      process.env.ALLOWED_EXTERNAL_DOMAIN
    ].filter(Boolean);

    // Blocked IP ranges (private networks)
    this.blockedRanges = [
      '127.0.0.0/8',     // Loopback
      '10.0.0.0/8',      // Private Class A
      '172.16.0.0/12',   // Private Class B
      '192.168.0.0/16',  // Private Class C
      '169.254.0.0/16',  // Link-local
      '224.0.0.0/4',     // Multicast
      '::1/128',         // IPv6 loopback
      'fc00::/7',        // IPv6 private
      'fe80::/10'        // IPv6 link-local
    ];
  }

  // Check if IP is in blocked range
  isIPBlocked(ip) {
    // Block localhost variations
    if (['127.0.0.1', '::1', 'localhost'].includes(ip)) {
      return true;
    }

    // Check private IP ranges
    return this.blockedRanges.some(range => {
      try {
        return this.ipInRange(ip, range);
      } catch {
        return false;
      }
    });
  }

  // Simple IP range check
  ipInRange(ip, range) {
    const [rangeIP, mask] = range.split('/');
    const maskBits = parseInt(mask);
    
    if (net.isIPv4(ip) && net.isIPv4(rangeIP)) {
      const ipInt = this.ipToInt(ip);
      const rangeInt = this.ipToInt(rangeIP);
      const maskInt = (0xFFFFFFFF << (32 - maskBits)) >>> 0;
      
      return (ipInt & maskInt) === (rangeInt & maskInt);
    }
    
    return false;
  }

  // Convert IPv4 to integer
  ipToInt(ip) {
    return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0) >>> 0;
  }

  // Validate URL for SSRF
  validateURL(targetUrl) {
    try {
      const parsed = url.parse(targetUrl);
      
      // Must have protocol
      if (!parsed.protocol || !['http:', 'https:'].includes(parsed.protocol)) {
        return { valid: false, reason: 'Invalid protocol' };
      }

      // Must have hostname
      if (!parsed.hostname) {
        return { valid: false, reason: 'No hostname' };
      }

      // Check if domain is allowed
      const isAllowedDomain = this.allowedDomains.some(domain => 
        parsed.hostname === domain || parsed.hostname.endsWith('.' + domain)
      );

      if (!isAllowedDomain) {
        return { valid: false, reason: 'Domain not allowed' };
      }

      // Check for IP addresses
      if (net.isIP(parsed.hostname)) {
        if (this.isIPBlocked(parsed.hostname)) {
          return { valid: false, reason: 'IP address blocked' };
        }
      }

      return { valid: true };
    } catch (error) {
      return { valid: false, reason: 'Invalid URL format' };
    }
  }

  // Middleware function
  middleware() {
    return (req, res, next) => {
      // Check for URL parameters in request body
      if (req.body && typeof req.body === 'object') {
        const urlFields = ['url', 'callback_url', 'webhook_url', 'redirect_url'];
        
        for (const field of urlFields) {
          if (req.body[field]) {
            const validation = this.validateURL(req.body[field]);
            if (!validation.valid) {
              return res.status(400).json({
                success: false,
                error: `Invalid ${field}: ${validation.reason}`,
                code: 'SSRF_BLOCKED'
              });
            }
          }
        }
      }

      // Check URL parameters
      const urlParams = ['url', 'callback', 'webhook', 'redirect'];
      for (const param of urlParams) {
        if (req.query[param]) {
          const validation = this.validateURL(req.query[param]);
          if (!validation.valid) {
            return res.status(400).json({
              success: false,
              error: `Invalid ${param} parameter: ${validation.reason}`,
              code: 'SSRF_BLOCKED'
            });
          }
        }
      }

      next();
    };
  }
}

const ssrfProtection = new SSRFProtection();

module.exports = {
  ssrfProtection,
  validateURL: (url) => ssrfProtection.validateURL(url),
  middleware: () => ssrfProtection.middleware()
};