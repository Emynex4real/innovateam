/**
 * Request Manager - Handles deduplication, caching, and circuit breaking
 */
import { isDebugEnabled } from '../config/debug.config';

class RequestManager {
  constructor() {
    this.pendingRequests = new Map();
    this.cache = new Map();
    this.circuitBreaker = {
      failures: 0,
      lastFailure: null,
      isOpen: false,
      threshold: 3,
      resetTimeout: 30000 // 30s
    };
  }

  log(level, message, data = {}) {
    if (!isDebugEnabled('REQUEST_MANAGER')) return;
    const timestamp = new Date().toISOString();
    const emoji = { info: '📘', warn: '⚠️', error: '❌', success: '✅' }[level] || '📝';
    console.log(`${emoji} [REQ-MGR ${timestamp}] ${message}`, data);
  }

  getCacheKey(url, params) {
    return `${url}:${JSON.stringify(params || {})}`;
  }

  checkCircuitBreaker() {
    if (!this.circuitBreaker.isOpen) return true;

    const timeSinceFailure = Date.now() - this.circuitBreaker.lastFailure;
    if (timeSinceFailure > this.circuitBreaker.resetTimeout) {
      this.log('info', 'Circuit breaker reset');
      this.circuitBreaker.isOpen = false;
      this.circuitBreaker.failures = 0;
      return true;
    }

    this.log('warn', 'Circuit breaker OPEN - blocking request', {
      failures: this.circuitBreaker.failures,
      timeSinceFailure: `${Math.round(timeSinceFailure / 1000)}s`
    });
    return false;
  }

  recordFailure() {
    this.circuitBreaker.failures++;
    this.circuitBreaker.lastFailure = Date.now();

    if (this.circuitBreaker.failures >= this.circuitBreaker.threshold) {
      this.circuitBreaker.isOpen = true;
      this.log('error', 'Circuit breaker OPENED', {
        failures: this.circuitBreaker.failures,
        threshold: this.circuitBreaker.threshold
      });
    }
  }

  recordSuccess() {
    if (this.circuitBreaker.failures > 0) {
      this.circuitBreaker.failures = Math.max(0, this.circuitBreaker.failures - 1);
      this.log('success', 'Request succeeded - reducing failure count', {
        failures: this.circuitBreaker.failures
      });
    }
  }

  async deduplicate(key, requestFn, options = {}) {
    const { cache = true, cacheTTL = 30000 } = options;

    this.log('info', 'Request initiated', { key, cache, cacheTTL });

    // Check circuit breaker
    if (!this.checkCircuitBreaker()) {
      throw new Error('Circuit breaker is open - too many failures');
    }

    // Check cache
    if (cache) {
      const cached = this.cache.get(key);
      if (cached && Date.now() - cached.timestamp < cacheTTL) {
        this.log('success', 'Cache HIT', { key, age: `${Math.round((Date.now() - cached.timestamp) / 1000)}s` });
        return cached.data;
      }
      if (cached) {
        this.log('info', 'Cache EXPIRED', { key });
      }
    }

    // Check for pending request
    if (this.pendingRequests.has(key)) {
      this.log('warn', 'Request DEDUPLICATED - waiting for pending', { key });
      return this.pendingRequests.get(key);
    }

    // Execute request
    this.log('info', 'Executing NEW request', { key });
    const promise = requestFn()
      .then(data => {
        this.log('success', 'Request completed', { key });
        this.recordSuccess();
        
        // Cache result
        if (cache) {
          this.cache.set(key, { data, timestamp: Date.now() });
          this.log('info', 'Response cached', { key, ttl: `${cacheTTL / 1000}s` });
        }
        
        // Clean up
        this.pendingRequests.delete(key);
        return data;
      })
      .catch(error => {
        this.log('error', 'Request failed', { 
          key, 
          error: error.message,
          status: error.response?.status 
        });
        this.recordFailure();
        this.pendingRequests.delete(key);
        throw error;
      });

    this.pendingRequests.set(key, promise);
    return promise;
  }

  clearCache(pattern) {
    if (!pattern) {
      this.log('info', 'Clearing ALL cache');
      this.cache.clear();
      return;
    }

    const keys = Array.from(this.cache.keys()).filter(k => k.includes(pattern));
    keys.forEach(k => this.cache.delete(k));
    this.log('info', 'Cache cleared', { pattern, count: keys.length });
  }

  getStats() {
    return {
      pendingRequests: this.pendingRequests.size,
      cachedItems: this.cache.size,
      circuitBreaker: {
        isOpen: this.circuitBreaker.isOpen,
        failures: this.circuitBreaker.failures
      }
    };
  }
}

export const requestManager = new RequestManager();
export default requestManager;
