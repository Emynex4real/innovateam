// Third-Party Integration Security Manager
import { secureLogger } from './secureLogger';

class ThirdPartySecurityManager {
  constructor() {
    this.trustedDomains = [
      'api.paystack.co',
      'js.paystack.co',
      'supabase.co',
      'deepseek.com'
    ];
    this.apiKeyRotationSchedule = new Map();
  }

  // Validate third-party API responses
  validateAPIResponse(response, expectedFields = []) {
    const validation = {
      isValid: true,
      issues: []
    };

    // Check response structure
    if (!response || typeof response !== 'object') {
      validation.isValid = false;
      validation.issues.push('Invalid response format');
      return validation;
    }

    // Validate expected fields
    expectedFields.forEach(field => {
      if (!(field in response)) {
        validation.isValid = false;
        validation.issues.push(`Missing required field: ${field}`);
      }
    });

    // Check for suspicious response patterns
    const responseStr = JSON.stringify(response);
    const suspiciousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+=/i,
      /eval\(/i
    ];

    suspiciousPatterns.forEach(pattern => {
      if (pattern.test(responseStr)) {
        validation.isValid = false;
        validation.issues.push('Suspicious content detected in response');
      }
    });

    return validation;
  }

  // Secure Paystack integration
  validatePaystackResponse(response) {
    const expectedFields = ['status', 'message', 'data'];
    const validation = this.validateAPIResponse(response, expectedFields);

    // Additional Paystack-specific validations
    if (response.status && !['success', 'failed'].includes(response.status)) {
      validation.isValid = false;
      validation.issues.push('Invalid Paystack status');
    }

    // Validate transaction reference format
    if (response.data?.reference) {
      const refPattern = /^[a-zA-Z0-9_-]+$/;
      if (!refPattern.test(response.data.reference)) {
        validation.isValid = false;
        validation.issues.push('Invalid transaction reference format');
      }
    }

    return validation;
  }

  // Secure DeepSeek API integration
  validateDeepSeekResponse(response) {
    const expectedFields = ['choices'];
    const validation = this.validateAPIResponse(response, expectedFields);

    // Check for content safety
    if (response.choices && Array.isArray(response.choices)) {
      response.choices.forEach((choice, index) => {
        if (choice.message?.content) {
          const content = choice.message.content;
          
          // Check for potentially harmful content
          const harmfulPatterns = [
            /password/i,
            /credit.*card/i,
            /social.*security/i,
            /<script/i
          ];

          harmfulPatterns.forEach(pattern => {
            if (pattern.test(content)) {
              validation.isValid = false;
              validation.issues.push(`Potentially harmful content in choice ${index}`);
            }
          });
        }
      });
    }

    return validation;
  }

  // Validate domain whitelist
  isDomainTrusted(url) {
    try {
      const domain = new URL(url).hostname;
      return this.trustedDomains.some(trusted => 
        domain === trusted || domain.endsWith('.' + trusted)
      );
    } catch (error) {
      return false;
    }
  }

  // Secure API key management
  rotateAPIKey(service, newKey) {
    // Log key rotation for audit
    secureLogger.logSecurityEvent('api_key_rotation', {
      service,
      timestamp: new Date().toISOString()
    });

    // Schedule next rotation (90 days)
    const nextRotation = new Date();
    nextRotation.setDate(nextRotation.getDate() + 90);
    this.apiKeyRotationSchedule.set(service, nextRotation);

    return {
      success: true,
      nextRotation: nextRotation.toISOString()
    };
  }

  // Monitor third-party service health
  async monitorServiceHealth(service, endpoint) {
    // Validate endpoint URL to prevent SSRF
    if (!this.isDomainTrusted(endpoint)) {
      throw new Error('Untrusted domain for health check');
    }
    
    // Additional SSRF protection - validate URL structure
    try {
      const url = new URL(endpoint);
      if (!['https:', 'http:'].includes(url.protocol)) {
        throw new Error('Invalid protocol for health check');
      }
      
      // Block private IP ranges
      const hostname = url.hostname;
      if (/^(10\.|172\.(1[6-9]|2[0-9]|3[01])\.|192\.168\.|127\.)/.test(hostname)) {
        if (!['localhost', '127.0.0.1'].includes(hostname)) {
          throw new Error('Private IP addresses not allowed');
        }
      }
    } catch (urlError) {
      throw new Error('Invalid URL for health check: ' + urlError.message);
    }
    
    const startTime = Date.now();
    
    try {
      const response = await fetch(endpoint, {
        method: 'HEAD',
        timeout: 5000,
        redirect: 'manual' // Prevent following redirects
      });

      const responseTime = Date.now() - startTime;
      const isHealthy = response.ok && responseTime < 3000;

      await secureLogger.logEvent('service_health_check', {
        service,
        endpoint,
        status: response.status,
        responseTime,
        isHealthy
      });

      return {
        service,
        isHealthy,
        responseTime,
        status: response.status
      };
    } catch (error) {
      await secureLogger.logError(error, {
        service,
        endpoint,
        type: 'health_check_failed'
      });

      return {
        service,
        isHealthy: false,
        error: error.message
      };
    }
  }

  // Validate webhook signatures
  validateWebhookSignature(payload, signature, secret) {
    try {
      const crypto = require('crypto');
      const expectedSignature = crypto
        .createHmac('sha512', secret)
        .update(payload)
        .digest('hex');

      return signature === expectedSignature;
    } catch (error) {
      secureLogger.logError(error, {
        type: 'webhook_signature_validation_failed'
      });
      return false;
    }
  }

  // Rate limiting for third-party APIs
  checkThirdPartyRateLimit(service, limit = 100, window = 3600000) {
    const now = Date.now();
    const key = `${service}_${Math.floor(now / window)}`;
    
    // This would integrate with a proper rate limiting store
    // For now, return mock implementation
    return {
      allowed: true,
      remaining: limit - 1,
      resetTime: now + window
    };
  }

  // Sanitize data before sending to third-party APIs
  sanitizeForThirdParty(data, service) {
    if (typeof data !== 'object' || data === null) return data;

    const sanitized = {};
    const sensitiveFields = ['password', 'token', 'key', 'secret'];

    for (const [key, value] of Object.entries(data)) {
      // Remove sensitive fields
      if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
        continue;
      }

      // Sanitize string values
      if (typeof value === 'string') {
        sanitized[key] = value
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .substring(0, 1000); // Limit length
      } else if (typeof value === 'object') {
        sanitized[key] = this.sanitizeForThirdParty(value, service);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }
}

export const thirdPartySecurityManager = new ThirdPartySecurityManager();