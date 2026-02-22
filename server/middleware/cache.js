const NodeCache = require('node-cache');
const cacheService = require('../services/cache.service');

// Local cache for 5 minutes, check every 60s
const cache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

const cacheMiddleware = (duration = 300, shared = false) => {
  return async (req, res, next) => {
    if (req.method !== 'GET') return next();
    
    // Shared cache: same for all users (public data)
    // Private cache: per-user (personal data)
    const key = shared 
      ? `public:${req.originalUrl}`
      : `api:${req.user?.id || 'anon'}:${req.originalUrl}`;
    
    // Try Redis first, then local cache
    let cached = await cacheService.get(key);
    if (!cached) {
      cached = cache.get(key);
    }
    
    if (cached) {
      return res.json(cached);
    }
    
    const originalJson = res.json.bind(res);
    res.json = async (data) => {
      // Store in both Redis and local cache
      await cacheService.set(key, data, duration);
      cache.set(key, data, duration);
      return originalJson(data);
    };
    
    next();
  };
};

module.exports = { cache, cacheMiddleware, cacheService };
