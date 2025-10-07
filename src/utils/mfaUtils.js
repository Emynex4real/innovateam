// Multi-Factor Authentication utilities
export class MFAUtils {
  // Generate TOTP secret
  static generateSecret() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let secret = '';
    for (let i = 0; i < 32; i++) {
      secret += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return secret;
  }

  // Generate backup codes
  static generateBackupCodes(count = 10) {
    const codes = [];
    for (let i = 0; i < count; i++) {
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      codes.push(code);
    }
    return codes;
  }

  // Validate TOTP code (simplified - use proper TOTP library in production)
  static validateTOTP(secret, token, window = 1) {
    // This is a simplified implementation
    // In production, use a proper TOTP library like 'otplib'
    const timeStep = Math.floor(Date.now() / 30000);
    
    for (let i = -window; i <= window; i++) {
      const expectedToken = this.generateTOTP(secret, timeStep + i);
      if (expectedToken === token) {
        return true;
      }
    }
    return false;
  }

  // Generate TOTP (simplified)
  static generateTOTP(secret, timeStep) {
    // Simplified TOTP generation - use proper crypto library in production
    const hash = this.simpleHash(secret + timeStep);
    return (hash % 1000000).toString().padStart(6, '0');
  }

  // Simple hash function (replace with proper HMAC-SHA1 in production)
  static simpleHash(input) {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  // Check if MFA is required for user
  static isMFARequired(user, profile) {
    // Require MFA for admins
    if (profile?.role === 'admin') return true;
    
    // Require MFA for high-value accounts
    if (profile?.wallet_balance > 100000) return true;
    
    // Require MFA if user has enabled it
    if (profile?.mfa_enabled) return true;
    
    return false;
  }

  // Generate QR code URL for TOTP setup
  static generateQRCodeURL(secret, email, issuer = 'JAMB Advisor') {
    const label = encodeURIComponent(`${issuer}:${email}`);
    const params = new URLSearchParams({
      secret,
      issuer,
      algorithm: 'SHA1',
      digits: '6',
      period: '30'
    });
    
    return `otpauth://totp/${label}?${params.toString()}`;
  }
}

// SMS-based MFA (mock implementation)
export class SMSMFAUtils {
  static generateSMSCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  static async sendSMSCode(phoneNumber, code) {
    // Mock SMS sending - integrate with actual SMS service
    console.log(`SMS Code ${code} sent to ${phoneNumber}`);
    
    // Store code temporarily (use secure storage in production)
    const expiryTime = Date.now() + (5 * 60 * 1000); // 5 minutes
    sessionStorage.setItem('sms_mfa_code', JSON.stringify({
      code,
      phone: phoneNumber,
      expires: expiryTime
    }));
    
    return { success: true };
  }

  static validateSMSCode(phoneNumber, inputCode) {
    try {
      const stored = JSON.parse(sessionStorage.getItem('sms_mfa_code') || '{}');
      
      if (!stored.code || !stored.phone || !stored.expires) {
        return false;
      }
      
      if (Date.now() > stored.expires) {
        sessionStorage.removeItem('sms_mfa_code');
        return false;
      }
      
      if (stored.phone !== phoneNumber || stored.code !== inputCode) {
        return false;
      }
      
      // Clear code after successful validation
      sessionStorage.removeItem('sms_mfa_code');
      return true;
    } catch {
      return false;
    }
  }
}

// Email-based MFA
export class EmailMFAUtils {
  static generateEmailCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  static async sendEmailCode(email, code) {
    // Mock email sending - integrate with actual email service
    console.log(`Email Code ${code} sent to ${email}`);
    
    // Store code temporarily
    const expiryTime = Date.now() + (10 * 60 * 1000); // 10 minutes
    sessionStorage.setItem('email_mfa_code', JSON.stringify({
      code,
      email,
      expires: expiryTime
    }));
    
    return { success: true };
  }

  static validateEmailCode(email, inputCode) {
    try {
      const stored = JSON.parse(sessionStorage.getItem('email_mfa_code') || '{}');
      
      if (!stored.code || !stored.email || !stored.expires) {
        return false;
      }
      
      if (Date.now() > stored.expires) {
        sessionStorage.removeItem('email_mfa_code');
        return false;
      }
      
      if (stored.email !== email || stored.code !== inputCode) {
        return false;
      }
      
      // Clear code after successful validation
      sessionStorage.removeItem('email_mfa_code');
      return true;
    } catch {
      return false;
    }
  }
}

export default MFAUtils;