/**
 * CSRF Token Store
 * Redis-backed with in-memory fallback.
 * Tokens auto-expire via Redis TTL (no manual cleanup needed).
 */

const { getRedis, isRedisReady, isUpstashClient } = require('../utils/redisClient');
const logger = require('../utils/logger');

const CSRF_PREFIX = 'csrf:';
const CSRF_TTL = 3600; // 1 hour in seconds
const MAX_MEMORY_TOKENS = 10000;

// In-memory fallback
const memoryStore = new Map();

/**
 * Store a CSRF token with auto-expiry.
 */
async function set(token) {
  if (isRedisReady()) {
    try {
      const redis = getRedis();
      const key = CSRF_PREFIX + token;
      if (isUpstashClient()) {
        await redis.set(key, '1', { ex: CSRF_TTL });
      } else {
        await redis.setex(key, CSRF_TTL, '1');
      }
      return;
    } catch (error) {
      logger.error('CSRF Redis set failed, using memory fallback', { error: error.message });
    }
  }

  // Fallback: in-memory with eviction
  if (memoryStore.size >= MAX_MEMORY_TOKENS) {
    const entries = Array.from(memoryStore.entries());
    entries.sort((a, b) => a[1] - b[1]);
    const toRemove = Math.floor(MAX_MEMORY_TOKENS * 0.2);
    for (let i = 0; i < toRemove; i++) {
      memoryStore.delete(entries[i][0]);
    }
  }
  memoryStore.set(token, Date.now());
}

/**
 * Check if a CSRF token exists and is valid.
 */
async function has(token) {
  if (isRedisReady()) {
    try {
      const redis = getRedis();
      const key = CSRF_PREFIX + token;
      const result = await redis.exists(key);
      // Upstash returns number, ioredis returns number
      return result === 1 || result === true;
    } catch (error) {
      logger.error('CSRF Redis has failed, checking memory', { error: error.message });
    }
  }

  // Fallback: in-memory with TTL check
  const timestamp = memoryStore.get(token);
  if (!timestamp) return false;
  if (Date.now() - timestamp > CSRF_TTL * 1000) {
    memoryStore.delete(token);
    return false;
  }
  return true;
}

/**
 * Delete a CSRF token (one-time use).
 */
async function del(token) {
  if (isRedisReady()) {
    try {
      const redis = getRedis();
      await redis.del(CSRF_PREFIX + token);
      return;
    } catch (error) {
      logger.error('CSRF Redis del failed, deleting from memory', { error: error.message });
    }
  }

  memoryStore.delete(token);
}

module.exports = { set, has, del };
