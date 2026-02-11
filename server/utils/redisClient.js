/**
 * Centralized Redis Client
 * Auto-detects Upstash (REST) vs standard Redis (ioredis).
 * Gracefully returns null if no REDIS_URL is configured.
 */

const logger = require('./logger');

let redis = null;
let isUpstash = false;
let ready = false;

const initialize = () => {
  const url = process.env.REDIS_URL;
  if (!url) {
    logger.warn('No REDIS_URL configured - all stores will use in-memory fallback');
    return;
  }

  // Upstash uses HTTPS REST endpoints
  if (url.startsWith('https://')) {
    try {
      const { Redis } = require('@upstash/redis');
      redis = new Redis({
        url,
        token: process.env.REDIS_TOKEN
      });
      isUpstash = true;
      ready = true;
      logger.info('Redis client initialized (Upstash REST)');
    } catch (error) {
      logger.error('Failed to initialize Upstash Redis', { error: error.message });
    }
  } else {
    // Standard Redis via ioredis
    try {
      const IORedis = require('ioredis');
      redis = new IORedis(url, {
        retryStrategy: (times) => Math.min(times * 50, 2000),
        maxRetriesPerRequest: 3,
        lazyConnect: false
      });

      redis.on('connect', () => {
        ready = true;
        logger.info('Redis client connected (ioredis)');
      });

      redis.on('error', (err) => {
        logger.error('Redis connection error', { error: err.message });
        ready = false;
      });

      redis.on('close', () => {
        ready = false;
      });
    } catch (error) {
      logger.error('Failed to initialize ioredis', { error: error.message });
    }
  }
};

initialize();

module.exports = {
  /** The raw Redis client (Upstash or ioredis). null if not configured. */
  getRedis: () => redis,

  /** Whether the Redis client is connected and ready. */
  isRedisReady: () => ready,

  /** Whether the client is Upstash (REST API) vs ioredis (TCP). */
  isUpstashClient: () => isUpstash,

  /** Graceful shutdown. */
  async close() {
    if (redis && !isUpstash && typeof redis.quit === 'function') {
      await redis.quit();
      logger.info('Redis connection closed');
    }
    ready = false;
  }
};
