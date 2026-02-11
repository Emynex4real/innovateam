/**
 * Redis Cache Wrapper
 * Uses the shared Redis client from redisClient.js.
 */

const logger = require('./logger');
const { getRedis, isRedisReady, isUpstashClient } = require('./redisClient');

class CacheService {
  constructor() {
    this.enabled = process.env.ENABLE_CACHE === 'true';

    if (!this.enabled) {
      logger.warn('Cache disabled (ENABLE_CACHE=false)');
    }
  }

  /**
   * Get value from cache
   */
  async get(key) {
    if (!this.enabled || !isRedisReady()) return null;

    try {
      const redis = getRedis();
      const value = await redis.get(key);
      if (!value) return null;

      // Upstash returns parsed JSON, ioredis returns string
      return isUpstashClient() ? value : JSON.parse(value);
    } catch (error) {
      logger.error('Cache get error', { key, error: error.message });
      return null;
    }
  }

  /**
   * Set value in cache with TTL (seconds)
   */
  async set(key, value, ttl = 3600) {
    if (!this.enabled || !isRedisReady()) return false;

    try {
      const redis = getRedis();
      if (isUpstashClient()) {
        await redis.set(key, value, { ex: ttl });
      } else {
        await redis.setex(key, ttl, JSON.stringify(value));
      }
      return true;
    } catch (error) {
      logger.error('Cache set error', { key, error: error.message });
      return false;
    }
  }

  /**
   * Delete key from cache
   */
  async delete(key) {
    if (!this.enabled || !isRedisReady()) return false;

    try {
      const redis = getRedis();
      await redis.del(key);
      return true;
    } catch (error) {
      logger.error('Cache delete error', { key, error: error.message });
      return false;
    }
  }

  /**
   * Clear all cache (use with caution)
   */
  async flush() {
    if (!this.enabled || !isRedisReady()) return false;

    try {
      if (isUpstashClient()) {
        logger.warn('Flush not supported on Upstash REST API');
        return false;
      }
      const redis = getRedis();
      await redis.flushdb();
      logger.warn('Cache flushed');
      return true;
    } catch (error) {
      logger.error('Cache flush error', { error: error.message });
      return false;
    }
  }
}

module.exports = new CacheService();
