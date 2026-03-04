const NodeCache = require("node-cache");
const cacheService = require("../services/cache.service");

// Local cache for 5 minutes, check every 60s
const cache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

const cacheMiddleware = (duration = 300, shared = false) => {
  return async (req, res, next) => {
    if (req.method !== "GET") return next();

    // Shared cache: same for all users (public data)
    // Private cache: per-user (personal data)
    const key = shared
      ? `public:${req.originalUrl}`
      : `api:${req.user?.id || "anon"}:${req.originalUrl}`;

    // Check LOCAL cache first (instant, ~0ms) before Redis (slow REST API)
    let cached = cache.get(key);
    if (!cached) {
      cached = await cacheService.get(key);
      if (cached) {
        // Populate local cache from Redis hit for next time
        cache.set(key, cached, duration);
      }
    }

    if (cached) {
      return res.json(cached);
    }

    const originalJson = res.json.bind(res);
    res.json = (data) => {
      // Store in local cache first (instant), then Redis (async)
      cache.set(key, data, duration);
      cacheService.set(key, data, duration).catch(() => {}); // fire-and-forget
      return originalJson(data);
    };

    next();
  };
};

module.exports = { cache, cacheMiddleware, cacheService };
