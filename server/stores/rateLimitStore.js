/**
 * Redis-backed store for express-rate-limit.
 * Implements the Store interface: https://express-rate-limit.mintlify.app/reference/stores
 * Falls back to the default MemoryStore if Redis is unavailable.
 */

const { getRedis, isRedisReady, isUpstashClient } = require('../utils/redisClient');
const logger = require('../utils/logger');

const RATE_LIMIT_PREFIX = 'rl:';

class RedisRateLimitStore {
  constructor(windowMs) {
    this.windowMs = windowMs;
    this.ttlSeconds = Math.ceil(windowMs / 1000);
    // In-memory fallback
    this.memoryStore = new Map();
    this.resetTimers = new Map();
  }

  _getMemoryEntry(key) {
    const entry = this.memoryStore.get(key);
    if (!entry) return { totalHits: 0, resetTime: new Date(Date.now() + this.windowMs) };
    if (Date.now() > entry.resetTime.getTime()) {
      this.memoryStore.delete(key);
      return { totalHits: 0, resetTime: new Date(Date.now() + this.windowMs) };
    }
    return entry;
  }

  /**
   * Increment the hit counter for a client.
   * @param {string} key - The client identifier
   * @returns {Promise<{totalHits: number, resetTime: Date}>}
   */
  async increment(key) {
    if (isRedisReady()) {
      try {
        const redis = getRedis();
        const redisKey = RATE_LIMIT_PREFIX + key;

        if (isUpstashClient()) {
          // Upstash: use pipeline for atomic INCR + TTL check
          const pipeline = redis.pipeline();
          pipeline.incr(redisKey);
          pipeline.ttl(redisKey);
          const results = await pipeline.exec();
          const totalHits = results[0];
          const ttl = results[1];

          // Set expiry on first hit (ttl === -1 means no expiry set)
          if (ttl === -1) {
            await redis.expire(redisKey, this.ttlSeconds);
          }

          const resetTime = new Date(Date.now() + (ttl > 0 ? ttl * 1000 : this.windowMs));
          return { totalHits, resetTime };
        } else {
          // ioredis: use multi for atomicity
          const results = await redis.multi()
            .incr(redisKey)
            .ttl(redisKey)
            .exec();

          const totalHits = results[0][1];
          const ttl = results[1][1];

          if (ttl === -1) {
            await redis.expire(redisKey, this.ttlSeconds);
          }

          const resetTime = new Date(Date.now() + (ttl > 0 ? ttl * 1000 : this.windowMs));
          return { totalHits, resetTime };
        }
      } catch (error) {
        logger.error('Rate limit Redis increment failed, using memory', { error: error.message });
      }
    }

    // Fallback: in-memory
    const entry = this._getMemoryEntry(key);
    entry.totalHits++;
    if (!this.memoryStore.has(key)) {
      entry.resetTime = new Date(Date.now() + this.windowMs);
    }
    this.memoryStore.set(key, entry);
    return { totalHits: entry.totalHits, resetTime: entry.resetTime };
  }

  /**
   * Decrement the hit counter for a client.
   * @param {string} key - The client identifier
   */
  async decrement(key) {
    if (isRedisReady()) {
      try {
        const redis = getRedis();
        await redis.decr(RATE_LIMIT_PREFIX + key);
        return;
      } catch (error) {
        logger.error('Rate limit Redis decrement failed', { error: error.message });
      }
    }

    // Fallback: in-memory
    const entry = this._getMemoryEntry(key);
    entry.totalHits = Math.max(0, entry.totalHits - 1);
    this.memoryStore.set(key, entry);
  }

  /**
   * Reset the hit counter for a client.
   * @param {string} key - The client identifier
   */
  async resetKey(key) {
    if (isRedisReady()) {
      try {
        const redis = getRedis();
        await redis.del(RATE_LIMIT_PREFIX + key);
        return;
      } catch (error) {
        logger.error('Rate limit Redis resetKey failed', { error: error.message });
      }
    }

    this.memoryStore.delete(key);
  }
}

/**
 * Create a rate limit store. Uses Redis if available, otherwise in-memory.
 * @param {number} windowMs - The rate limit window in milliseconds
 * @returns {RedisRateLimitStore}
 */
function createStore(windowMs) {
  return new RedisRateLimitStore(windowMs);
}

module.exports = { createStore };
