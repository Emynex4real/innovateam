const { getRedis, isRedisReady } = require('../utils/redisClient');
const logger = require('../utils/logger');

class CacheService {
  constructor() {
    this.memoryCache = new Map();
  }

  async get(key) {
    if (isRedisReady()) {
      try {
        const redis = getRedis();
        const data = await redis.get(key);
        if (!data) return null;
        
        // Upstash returns objects directly, not strings
        if (typeof data === 'object') return data;
        
        // Standard Redis returns strings
        return JSON.parse(data);
      } catch (error) {
        logger.error('Redis get failed', { key, error: error.message });
      }
    }
    return this.memoryCache.get(key) || null;
  }

  async set(key, value, ttlSeconds = 300) {
    if (isRedisReady()) {
      try {
        const redis = getRedis();
        // Upstash accepts objects directly, no need to stringify
        await redis.set(key, value, { ex: ttlSeconds });
        return true;
      } catch (error) {
        logger.error('Redis set failed', { key, error: error.message });
      }
    }
    this.memoryCache.set(key, value);
    setTimeout(() => this.memoryCache.delete(key), ttlSeconds * 1000);
    return true;
  }

  async del(key) {
    if (isRedisReady()) {
      try {
        const redis = getRedis();
        await redis.del(key);
      } catch (error) {
        logger.error('Redis del failed', { key, error: error.message });
      }
    }
    this.memoryCache.delete(key);
  }

  async invalidatePattern(pattern) {
    if (isRedisReady()) {
      try {
        const redis = getRedis();
        const keys = await redis.keys(pattern);
        if (keys.length > 0) {
          await redis.del(...keys);
        }
      } catch (error) {
        logger.error('Redis pattern delete failed', { pattern, error: error.message });
      }
    }
    // Memory cache: clear all (pattern matching not supported)
    this.memoryCache.clear();
  }
}

module.exports = new CacheService();
