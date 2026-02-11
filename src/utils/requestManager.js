/**
 * Request Manager - Handles deduplication, caching, and per-endpoint circuit breaking
 */
import { isDebugEnabled } from '../config/debug.config';

// Circuit breaker states
const CB_CLOSED = 'CLOSED';
const CB_OPEN = 'OPEN';
const CB_HALF_OPEN = 'HALF_OPEN';

class RequestManager {
  constructor() {
    this.pendingRequests = new Map();
    this.cache = new Map();
    // Per-endpoint circuit breakers (keyed by base path)
    this.circuitBreakers = new Map();
    this.cbDefaults = {
      threshold: 3,
      resetTimeout: 30000, // 30s
    };
  }

  log(level, message, data = {}) {
    if (!isDebugEnabled('REQUEST_MANAGER')) return;
    const timestamp = new Date().toISOString();
    console.log(`[REQ-MGR ${timestamp}] ${message}`, data);
  }

  getCacheKey(url, params) {
    return `${url}:${JSON.stringify(params || {})}`;
  }

  // Extract base path for circuit breaker grouping (e.g., "/api/wallet" from "/api/wallet/balance?x=1")
  _getEndpointGroup(key) {
    try {
      // Key format is "url:params" - extract URL part
      const url = key.split(':')[0];
      // Extract the first two path segments as the group (e.g., /api/wallet)
      const match = url.match(/\/api\/[^/?#]+/);
      return match ? match[0] : url;
    } catch {
      return key;
    }
  }

  _getCircuitBreaker(endpoint) {
    if (!this.circuitBreakers.has(endpoint)) {
      this.circuitBreakers.set(endpoint, {
        state: CB_CLOSED,
        failures: 0,
        lastFailure: null,
      });
    }
    return this.circuitBreakers.get(endpoint);
  }

  checkCircuitBreaker(endpoint) {
    const cb = this._getCircuitBreaker(endpoint);

    if (cb.state === CB_CLOSED) return true;

    if (cb.state === CB_OPEN) {
      const timeSinceFailure = Date.now() - cb.lastFailure;
      if (timeSinceFailure > this.cbDefaults.resetTimeout) {
        // Transition to HALF_OPEN - allow one probe request
        cb.state = CB_HALF_OPEN;
        this.log('info', `Circuit breaker HALF-OPEN for ${endpoint} - allowing probe request`);
        return true;
      }
      this.log('warn', `Circuit breaker OPEN for ${endpoint} - blocking request`, {
        failures: cb.failures,
        timeSinceFailure: `${Math.round(timeSinceFailure / 1000)}s`
      });
      return false;
    }

    // HALF_OPEN: allow the probe request through
    return true;
  }

  recordFailure(endpoint) {
    const cb = this._getCircuitBreaker(endpoint);
    cb.failures++;
    cb.lastFailure = Date.now();

    if (cb.state === CB_HALF_OPEN) {
      // Probe failed - go back to OPEN
      cb.state = CB_OPEN;
      this.log('error', `Circuit breaker re-OPENED for ${endpoint} (probe failed)`, {
        failures: cb.failures
      });
    } else if (cb.failures >= this.cbDefaults.threshold) {
      cb.state = CB_OPEN;
      this.log('error', `Circuit breaker OPENED for ${endpoint}`, {
        failures: cb.failures,
        threshold: this.cbDefaults.threshold
      });
    }
  }

  recordSuccess(endpoint) {
    const cb = this._getCircuitBreaker(endpoint);

    if (cb.state === CB_HALF_OPEN) {
      // Probe succeeded - fully close the circuit
      cb.state = CB_CLOSED;
      cb.failures = 0;
      this.log('info', `Circuit breaker CLOSED for ${endpoint} (probe succeeded)`);
    } else if (cb.failures > 0) {
      cb.failures = Math.max(0, cb.failures - 1);
    }
  }

  async deduplicate(key, requestFn, options = {}) {
    const { cache = true, cacheTTL = 30000 } = options;
    const endpoint = this._getEndpointGroup(key);

    this.log('info', 'Request initiated', { key, cache, cacheTTL, endpoint });

    // Check per-endpoint circuit breaker
    if (!this.checkCircuitBreaker(endpoint)) {
      throw new Error(`Circuit breaker is open for ${endpoint} - too many failures`);
    }

    // Check cache
    if (cache) {
      const cached = this.cache.get(key);
      if (cached && Date.now() - cached.timestamp < cacheTTL) {
        this.log('info', 'Cache HIT', { key, age: `${Math.round((Date.now() - cached.timestamp) / 1000)}s` });
        return cached.data;
      }
      if (cached) {
        this.log('info', 'Cache EXPIRED', { key });
      }
    }

    // Check for pending request (deduplication)
    if (this.pendingRequests.has(key)) {
      this.log('info', 'Request DEDUPLICATED - waiting for pending', { key });
      return this.pendingRequests.get(key);
    }

    // Execute request
    this.log('info', 'Executing NEW request', { key });
    const promise = requestFn()
      .then(data => {
        this.recordSuccess(endpoint);

        // Cache result
        if (cache) {
          this.cache.set(key, { data, timestamp: Date.now() });
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
        this.recordFailure(endpoint);
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
    const breakers = {};
    for (const [endpoint, cb] of this.circuitBreakers.entries()) {
      breakers[endpoint] = { state: cb.state, failures: cb.failures };
    }
    return {
      pendingRequests: this.pendingRequests.size,
      cachedItems: this.cache.size,
      circuitBreakers: breakers
    };
  }
}

export const requestManager = new RequestManager();
export default requestManager;
