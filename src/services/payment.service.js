import logger from '../utils/logger';
import { thirdPartySecurityManager } from '../utils/thirdPartySecurityManager';
import { secureLogger } from '../utils/secureLogger';

class PaymentService {
  constructor() {
    this.paystackPublicKey = process.env.REACT_APP_PAYSTACK_PUBLIC_KEY;
    this.isConfigured = false;
    
    if (!this.paystackPublicKey) {
      console.warn('Paystack public key not configured - payment features will be disabled');
      return;
    }
    
    // Validate key format
    if (!this.paystackPublicKey.startsWith('pk_')) {
      console.warn('Invalid Paystack public key format - payment features will be disabled');
      return;
    }
    
    this.isConfigured = true;
  }

  // Initialize Paystack payment
  async initializePayment({ amount, email, reference, metadata = {} }) {
    if (!this.isConfigured) {
      throw new Error('Payment service not configured');
    }
    
    try {
      logger.service('Initializing payment', { amount, email, reference });
      
      // Load Paystack script if not already loaded
      if (!window.PaystackPop) {
        await this.loadPaystackScript();
      }

      return new Promise((resolve, reject) => {
        const handler = window.PaystackPop.setup({
          key: this.paystackPublicKey,
          email,
          amount: amount * 100, // Convert to kobo
          currency: 'NGN',
          ref: reference,
          metadata,
          callback: (response) => {
            logger.service('Payment successful', response);
            resolve(response);
          },
          onClose: () => {
            logger.service('Payment cancelled by user');
            reject(new Error('Payment cancelled'));
          }
        });
        
        handler.openIframe();
      });
    } catch (error) {
      logger.error('Payment initialization failed', error);
      throw error;
    }
  }

  // Load Paystack script dynamically
  loadPaystackScript() {
    return new Promise((resolve, reject) => {
      if (window.PaystackPop) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://js.paystack.co/v1/inline.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  // Generate payment reference
  generateReference(prefix = 'JAMB') {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}_${timestamp}_${random}`;
  }

  // Verify payment with backend
  async verifyPayment(reference) {
    try {
      logger.service('Verifying payment', { reference });
      
      // Import CSRF protection
      const { csrfProtection } = await import('../utils/csrfProtection');
      
      // Validate domain trust
      const apiUrl = '/api/payments/verify';
      
      // Call backend verification endpoint with CSRF protection
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: csrfProtection.addTokenToHeaders({
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        }),
        body: JSON.stringify({ reference })
      });
      
      if (!response.ok) {
        throw new Error(`Verification failed: ${response.status}`);
      }
      
      // Safely parse JSON response
      const text = await response.text();
      let result;
      try {
        result = JSON.parse(text);
      } catch (parseError) {
        throw new Error('Invalid JSON response from payment service');
      }
      
      // Validate Paystack response structure
      const validation = thirdPartySecurityManager.validatePaystackResponse(result);
      if (!validation.isValid) {
        await secureLogger.logSecurityEvent('invalid_payment_response', {
          reference,
          issues: validation.issues
        });
        throw new Error('Invalid payment response received');
      }
      
      return result;
    } catch (error) {
      await secureLogger.logError(error, {
        type: 'payment_verification_failed',
        reference
      });
      throw error;
    }
  }
  
  // Get authentication token
  getAuthToken() {
    // Get from secure storage or auth context
    return localStorage.getItem('auth_token') || '';
  }
}

const paymentService = new PaymentService();
export default paymentService;