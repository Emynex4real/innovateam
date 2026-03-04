const supabase = require("../supabaseClient");
const NodeCache = require("node-cache");

// Cache verified auth tokens for 60s to avoid hitting Supabase on every request
const authCache = new NodeCache({ stdTTL: 60, checkperiod: 30, maxKeys: 1000 });

const withTimeout = (promise, ms = 3000) => {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Timeout")), ms),
    ),
  ]);
};

// Create a short cache key from token (never store full token)
const tokenCacheKey = (token) => `auth:${token.slice(-16)}`;

const authenticate = async (req, res, next) => {
  try {
    // Prefer httpOnly cookie, fall back to Authorization header
    const cookieToken = req.cookies?.access_token;
    const authHeader = req.headers.authorization;
    const token =
      cookieToken ||
      (authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null);

    if (!token || token === "null" || token === "undefined") {
      return res
        .status(401)
        .json({ success: false, error: "No token", code: "NO_TOKEN" });
    }

    // Check auth cache first (instant, ~0ms)
    const cacheKey = tokenCacheKey(token);
    const cachedUser = authCache.get(cacheKey);
    if (cachedUser) {
      req.user = cachedUser;
      return next();
    }

    let data, error;
    const maxRetries = 2;

    for (let i = 0; i <= maxRetries; i++) {
      try {
        const result = await withTimeout(supabase.auth.getUser(token), 3000);
        data = result.data;
        error = result.error;
        break;
      } catch (e) {
        if (i === maxRetries) {
          return res
            .status(503)
            .json({
              success: false,
              error: "Service unavailable",
              code: "TIMEOUT",
            });
        }
        await new Promise((r) => setTimeout(r, 300 * Math.pow(2, i)));
      }
    }

    if (error || !data.user) {
      return res
        .status(401)
        .json({
          success: false,
          error: "Invalid token",
          code: "INVALID_TOKEN",
        });
    }

    let userProfile = null;
    try {
      const result = await withTimeout(
        supabase
          .from("user_profiles")
          .select("role, is_admin, is_tutor, is_student")
          .eq("id", data.user.id)
          .single(),
        2000,
      );
      userProfile = result.data;
    } catch (e) {}

    const userRole =
      userProfile?.role || data.user.user_metadata?.role || "user";

    req.user = {
      id: data.user.id,
      email: data.user.email,
      role: userRole,
      isAdmin: userProfile?.is_admin || userRole === "admin",
      isTutor: userProfile?.is_tutor || userRole === "tutor",
      isStudent: userProfile?.is_student || userRole === "student",
      metadata: data.user.user_metadata,
    };

    // Cache the verified user for subsequent requests
    authCache.set(cacheKey, req.user);

    next();
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "Auth error", code: "ERROR" });
  }
};

const requireAdmin = async (req, res, next) => {
  if (!req.user) {
    return res
      .status(401)
      .json({ success: false, error: "Authentication required" });
  }
  if (!req.user.isAdmin) {
    return res
      .status(403)
      .json({ success: false, error: "Admin access required" });
  }
  next();
};

const optionalAuth = async (req, res, next) => {
  try {
    const cookieToken = req.cookies?.access_token;
    const authHeader = req.headers.authorization;
    const token =
      cookieToken ||
      (authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null);

    if (!token) {
      req.user = null;
      return next();
    }

    // Check auth cache first
    const cacheKey = tokenCacheKey(token);
    const cachedUser = authCache.get(cacheKey);
    if (cachedUser) {
      req.user = cachedUser;
      return next();
    }

    const { data, error } = await withTimeout(
      supabase.auth.getUser(token),
      2000,
    );
    if (error || !data.user) {
      req.user = null;
      return next();
    }

    let userProfile = null;
    try {
      const result = await withTimeout(
        supabase
          .from("user_profiles")
          .select("role, is_admin, is_tutor, is_student")
          .eq("id", data.user.id)
          .single(),
        1500,
      );
      userProfile = result.data;
    } catch (e) {}

    const userRole = userProfile?.role || "user";
    req.user = {
      id: data.user.id,
      email: data.user.email,
      role: userRole,
      isAdmin: userProfile?.is_admin || userRole === "admin",
      isTutor: userProfile?.is_tutor || userRole === "tutor",
      isStudent: userProfile?.is_student || userRole === "student",
      metadata: data.user.user_metadata,
    };

    // Cache for subsequent requests
    authCache.set(cacheKey, req.user);

    next();
  } catch (error) {
    req.user = null;
    next();
  }
};

module.exports = {
  authenticate,
  requireAdmin,
  optionalAuth,
};
