import CryptoJS from 'crypto-js';

class SecureStorage {
  constructor() {
    // Generate or retrieve encryption key
    this.encryptionKey = this.getOrCreateKey();
  }

  getOrCreateKey() {
    let key = sessionStorage.getItem('_sk');
    if (!key) {
      // Generate new key for session
      key = CryptoJS.lib.WordArray.random(256/8).toString();
      sessionStorage.setItem('_sk', key);
    }
    return key;
  }

  encrypt(data) {
    try {
      const encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), this.encryptionKey).toString();
      return encrypted;
    } catch (error) {
      console.error('Encryption failed:', error);
      return null;
    }
  }

  decrypt(encryptedData) {
    try {
      const decrypted = CryptoJS.AES.decrypt(encryptedData, this.encryptionKey);
      const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);
      return JSON.parse(decryptedString);
    } catch (error) {
      console.error('Decryption failed:', error);
      return null;
    }
  }

  setItem(key, value) {
    const encrypted = this.encrypt(value);
    if (encrypted) {
      localStorage.setItem(key, encrypted);
      return true;
    }
    return false;
  }

  getItem(key) {
    const encrypted = localStorage.getItem(key);
    if (!encrypted) return null;
    return this.decrypt(encrypted);
  }

  removeItem(key) {
    localStorage.removeItem(key);
  }

  clear() {
    localStorage.clear();
    sessionStorage.removeItem('_sk');
    this.encryptionKey = this.getOrCreateKey();
  }
}

export default new SecureStorage();