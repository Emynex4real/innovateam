// Browser-compatible encryption using Web Crypto API
class EncryptionService {
  constructor() {
    this.crypto = window.crypto || window.msCrypto;
  }

  // Generate a random key
  async generateKey() {
    const key = await this.crypto.subtle.generateKey(
      {
        name: 'AES-GCM',
        length: 256,
      },
      true,
      ['encrypt', 'decrypt']
    );
    return key;
  }

  // Encrypt data
  async encrypt(data, key) {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(JSON.stringify(data));
    
    const iv = this.crypto.getRandomValues(new Uint8Array(12));
    
    const encryptedData = await this.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      dataBuffer
    );

    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encryptedData.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(encryptedData), iv.length);
    
    // Convert to base64
    return btoa(String.fromCharCode(...combined));
  }

  // Decrypt data
  async decrypt(encryptedData, key) {
    // Convert from base64
    const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
    
    // Extract IV and data
    const iv = combined.slice(0, 12);
    const data = combined.slice(12);

    const decryptedData = await this.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      data
    );

    const decoder = new TextDecoder();
    return JSON.parse(decoder.decode(decryptedData));
  }
}

export default new EncryptionService();