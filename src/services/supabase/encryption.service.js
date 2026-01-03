import CryptoJS from 'crypto-js';

// Database field encryption service
export class EncryptionService {
  constructor() {
    // Use environment-based encryption key
    this.encryptionKey = this.getEncryptionKey();
  }

  // Get or generate encryption key
  getEncryptionKey() {
    // In production, use a proper key management system
    const envKey = process.env.REACT_APP_ENCRYPTION_KEY;
    if (envKey) return envKey;
    
    // Fallback: generate from app constants (not recommended for production)
    const appId = process.env.REACT_APP_SUPABASE_URL?.split('//')[1]?.split('.')[0] || 'default';
    return CryptoJS.SHA256(appId + 'encryption_salt_2024').toString();
  }

  // Encrypt sensitive data before database storage
  encryptSensitiveData(data) {
    if (!data || typeof data !== 'string') return data;
    
    try {
      const encrypted = CryptoJS.AES.encrypt(data, this.encryptionKey).toString();
      return `enc:${encrypted}`;
    } catch (error) {
      console.error('Encryption failed:', error);
      return data; // Return original if encryption fails
    }
  }

  // Decrypt sensitive data after database retrieval
  decryptSensitiveData(encryptedData) {
    if (!encryptedData || typeof encryptedData !== 'string') return encryptedData;
    
    // Check if data is encrypted
    if (!encryptedData.startsWith('enc:')) return encryptedData;
    
    try {
      const encrypted = encryptedData.substring(4); // Remove 'enc:' prefix
      const decrypted = CryptoJS.AES.decrypt(encrypted, this.encryptionKey);
      return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error('Decryption failed:', error);
      return encryptedData; // Return original if decryption fails
    }
  }

  // Hash sensitive data for searching (one-way)
  hashForSearch(data) {
    if (!data || typeof data !== 'string') return data;
    
    return CryptoJS.SHA256(data.toLowerCase() + this.encryptionKey).toString();
  }

  // Encrypt phone numbers
  encryptPhone(phone) {
    if (!phone) return null;
    return this.encryptSensitiveData(phone);
  }

  // Decrypt phone numbers
  decryptPhone(encryptedPhone) {
    return this.decryptSensitiveData(encryptedPhone);
  }

  // Encrypt financial amounts (for audit trails)
  encryptAmount(amount) {
    if (!amount) return amount;
    return this.encryptSensitiveData(amount.toString());
  }

  // Decrypt financial amounts
  decryptAmount(encryptedAmount) {
    const decrypted = this.decryptSensitiveData(encryptedAmount);
    return parseFloat(decrypted) || 0;
  }

  // Encrypt metadata objects
  encryptMetadata(metadata) {
    if (!metadata || typeof metadata !== 'object') return metadata;
    
    const encrypted = {};
    Object.keys(metadata).forEach(key => {
      const value = metadata[key];
      if (typeof value === 'string' && this.isSensitiveField(key)) {
        encrypted[key] = this.encryptSensitiveData(value);
      } else {
        encrypted[key] = value;
      }
    });
    
    return encrypted;
  }

  // Decrypt metadata objects
  decryptMetadata(encryptedMetadata) {
    if (!encryptedMetadata || typeof encryptedMetadata !== 'object') return encryptedMetadata;
    
    const decrypted = {};
    Object.keys(encryptedMetadata).forEach(key => {
      const value = encryptedMetadata[key];
      if (typeof value === 'string' && this.isSensitiveField(key)) {
        decrypted[key] = this.decryptSensitiveData(value);
      } else {
        decrypted[key] = value;
      }
    });
    
    return decrypted;
  }

  // Check if field contains sensitive data
  isSensitiveField(fieldName) {
    const sensitiveFields = [
      'phone', 'card_number', 'account_number', 'pin', 'password',
      'secret', 'token', 'key', 'ssn', 'nin', 'bvn'
    ];
    
    return sensitiveFields.some(field => 
      fieldName.toLowerCase().includes(field)
    );
  }

  // Generate secure reference with encryption
  generateSecureReference(prefix = 'TXN') {
    const timestamp = Date.now();
    const random = CryptoJS.lib.WordArray.random(8).toString();
    const hash = CryptoJS.SHA256(timestamp + random + this.encryptionKey).toString().substring(0, 8);
    
    return `${prefix}_${timestamp}_${hash}`.toUpperCase();
  }

  // Validate encrypted data integrity
  validateEncryptedData(encryptedData) {
    if (!encryptedData || !encryptedData.startsWith('enc:')) return false;
    
    try {
      const decrypted = this.decryptSensitiveData(encryptedData);
      return decrypted && decrypted.length > 0;
    } catch {
      return false;
    }
  }
}

// Create singleton instance
const encryptionService = new EncryptionService();
export default encryptionService;