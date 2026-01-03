// Third-Party Integration Security Manager
import { secureLogger } from './secureLogger';
import CryptoJS from 'crypto-js';

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

  // Validate webhook signatures - FIXED VERSION
  validateWebhookSignature(payload, signature, secret) {
    try {
      const expectedSignature = CryptoJS.HmacSHA512(payload, secret).toString();
      return signature === expectedSignature;
    } catch (error) {
      secureLogger.logError(error, {
        type: 'webhook_signature_validation_failed'
      });
      return false;
    }
  }

  // Other methods remain the same...
  validateAPIResponse(response, expectedFields = []) {
    const validation = {
      isValid: true,
      issues: []
    };

    if (!response || typeof response !== 'object') {
      validation.isValid = false;
      validation.issues.push('Invalid response format');
      return validation;
    }

    expectedFields.forEach(field => {
      if (!(field in response)) {
        validation.isValid = false;
        validation.issues.push(`Missing required field: ${field}`);
      }
    });

    return validation;
  }

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
}

export const thirdPartySecurityManager = new ThirdPartySecurityManager();