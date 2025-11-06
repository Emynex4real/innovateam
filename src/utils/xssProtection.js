// XSS Protection Utility
import DOMPurify from 'dompurify';

class XSSProtection {
  constructor() {
    // Configure DOMPurify if available
    if (typeof DOMPurify !== 'undefined') {
      DOMPurify.setConfig({
        ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
        ALLOWED_ATTR: [],
        KEEP_CONTENT: true
      });
    }
  }

  // Sanitize HTML content
  sanitizeHTML(dirty) {
    if (typeof dirty !== 'string') return dirty;
    
    if (typeof DOMPurify !== 'undefined') {
      return DOMPurify.sanitize(dirty);
    }
    
    // Fallback sanitization
    return this.basicSanitize(dirty);
  }

  // Basic sanitization without DOMPurify
  basicSanitize(input) {
    if (typeof input !== 'string') return input;
    
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/&/g, '&amp;')
      .replace(/\//g, '&#x2F;');
  }

  // Sanitize for attribute values
  sanitizeAttribute(value) {
    if (typeof value !== 'string') return value;
    
    return value
      .replace(/[<>"'&]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '')
      .substring(0, 1000); // Limit length
  }

  // Sanitize user input for display
  sanitizeUserInput(input) {
    if (typeof input !== 'string') return input;
    
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
      .replace(/<embed\b[^<]*>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .replace(/data:text\/html/gi, '')
      .substring(0, 5000); // Limit length
  }

  // Validate and sanitize URL
  sanitizeURL(url) {
    if (typeof url !== 'string') return '';
    
    try {
      const urlObj = new URL(url);
      
      // Only allow safe protocols
      if (!['http:', 'https:', 'mailto:'].includes(urlObj.protocol)) {
        return '';
      }
      
      return urlObj.toString();
    } catch {
      return '';
    }
  }

  // Create safe innerHTML setter
  setSafeHTML(element, html) {
    if (!element || typeof html !== 'string') return;
    
    const sanitized = this.sanitizeHTML(html);
    element.innerHTML = sanitized;
  }

  // Escape for JSON context
  escapeForJSON(value) {
    if (typeof value !== 'string') return value;
    
    return value
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/'/g, "\\'")
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t');
  }

  // Validate React props for XSS
  sanitizeProps(props) {
    if (!props || typeof props !== 'object') return props;
    
    const sanitized = {};
    const dangerousProps = ['dangerouslySetInnerHTML', 'innerHTML'];
    
    for (const [key, value] of Object.entries(props)) {
      // Skip dangerous props
      if (dangerousProps.includes(key)) {
        continue;
      }
      
      // Sanitize event handlers
      if (key.startsWith('on') && typeof value === 'string') {
        continue; // Skip string event handlers
      }
      
      // Sanitize string values
      if (typeof value === 'string') {
        if (key === 'href' || key === 'src') {
          sanitized[key] = this.sanitizeURL(value);
        } else if (key.includes('html') || key.includes('Html')) {
          sanitized[key] = this.sanitizeHTML(value);
        } else {
          sanitized[key] = this.sanitizeAttribute(value);
        }
      } else {
        sanitized[key] = value;
      }
    }
    
    return sanitized;
  }
}

// Create singleton instance
const xssProtection = new XSSProtection();

// Export utility functions
export const sanitizeHTML = (html) => xssProtection.sanitizeHTML(html);
export const sanitizeUserInput = (input) => xssProtection.sanitizeUserInput(input);
export const sanitizeAttribute = (attr) => xssProtection.sanitizeAttribute(attr);
export const sanitizeURL = (url) => xssProtection.sanitizeURL(url);
export const sanitizeProps = (props) => xssProtection.sanitizeProps(props);
export const setSafeHTML = (element, html) => xssProtection.setSafeHTML(element, html);

export default xssProtection;