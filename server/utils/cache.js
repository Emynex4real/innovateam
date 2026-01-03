/**
 * Redis Cache Wrapper (Upstash Compatible)
 * Supports both standard Redis and Upstash REST API
 */

const logger = require('./logger');

class CacheService {
  constructor() {
    this.enabled = process.env.ENABLE_CACHE === 'true';
    this.client = null;
    
    if (this.enabled) {
      // Check if using Upstash (REST API)
      if (process.env.REDIS_URL && process.env.REDIS_URL.startsWith('https://')) {
        this.initUpstash();
      } else if (process.env.REDIS_URL) {
        this.initStandardRedis();
      } else {
        logger.warn('ENABLE_CACHE=true but no REDIS_URL provided');
        this.enabled = false;
      }
    } else {
      logger.warn('Cache disabled (ENABLE_CACHE=false)');
    }
  }

  initUpstash() {
    try {
      const { Redis } = require('@upstash/redis');
      this.client = new Redis({
        url: process.env.REDIS_URL,
        token: process.env.REDIS_TOKEN
      });
      this.isUpstash = true;
      logger.info('Upstash Redis initialized');
    } catch (error) {
      logger.error('Failed to initialize Upstash Redis', { error: error.message });
      logger.warn('Install @upstash/redis: npm install @upstash/redis');
      this.enabled = false;
    }
  }

  initStandardRedis() {
    try {
      const Redis = require('ioredis');
      this.client = new Redis(process.env.REDIS_URL, {
        retryStrategy: (times) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
        maxRetriesPerRequest: 3
      });
      this.isUpstash = false;

      this.client.on('error', (err) => {
        logger.error('Redis error', { error: err.message });
      });

      this.client.on('connect', () => {
        logger.info('Redis connected');
      });
    } catch (error) {
      logger.error('Failed to initialize Redis', { error: error.message });
      this.enabled = false;
    }
  }

  /**
   * Get value from cache
   */
  async get(key) {
    if (!this.enabled || !this.client) return null;
    
    try {
      const value = await this.client.get(key);
      if (!value) return null;
      
      // Upstash returns parsed JSON, ioredis returns string
      return this.isUpstash ? value : JSON.parse(value);
    } catch (error) {
      logger.error('Cache get error', { key, error: error.message });
      return null;
    }
  }

  /**
   * Set value in cache with TTL (seconds)
   */
  async set(key, value, ttl = 3600) {
    if (!this.enabled || !this.client) return false;
    
    try {
      if (this.isUpstash) {
        // Upstash REST API
        await this.client.set(key, value, { ex: ttl });
      } else {
        // Standard Redis
        await this.client.setex(key, ttl, JSON.stringify(value));
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
    if (!this.enabled || !this.client) return false;
    
    try {
      await this.client.del(key);
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
    if (!this.enabled || !this.client) return false;
    
    try {
      if (this.isUpstash) {
        logger.warn('Flush not supported on Upstash REST API');
        return false;
      }
      await this.client.flushdb();
      logger.warn('Cache flushed');
      return true;
    } catch (error) {
      logger.error('Cache flush error', { error: error.message });
      return false;
    }
  }

  /**
   * Close connection
   */
  async close() {
    if (this.enabled && this.client && !this.isUpstash) {
      await this.client.quit();
    }
  }
}

module.exports = new CacheService();
