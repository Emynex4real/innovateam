// Simple secure storage without external dependencies
class SecureStorage {
  constructor() {
    this.prefix = '_secure_';
  }

  // Simple encoding (not encryption, but obfuscation)
  encode(data) {
    try {
      const jsonString = JSON.stringify(data);
      return btoa(jsonString);
    } catch (error) {
      console.error('Encoding failed:', error);
      return null;
    }
  }

  decode(encodedData) {
    try {
      const jsonString = atob(encodedData);
      return JSON.parse(jsonString);
    } catch (error) {
      console.error('Decoding failed:', error);
      return null;
    }
  }

  setItem(key, value) {
    const encoded = this.encode(value);
    if (encoded) {
      localStorage.setItem(this.prefix + key, encoded);
      return true;
    }
    return false;
  }

  getItem(key) {
    const encoded = localStorage.getItem(this.prefix + key);
    if (!encoded) return null;
    return this.decode(encoded);
  }

  removeItem(key) {
    localStorage.removeItem(this.prefix + key);
  }

  clear() {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(this.prefix)) {
        localStorage.removeItem(key);
      }
    });
  }
}

export default new SecureStorage();