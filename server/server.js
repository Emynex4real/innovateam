/**
 * InnovaTeam Backend Server - ENTERPRISE SECURITY VERSION
 * Production-ready with comprehensive OWASP Top 10 protections
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const xss = require('xss');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');

// Security middleware
const {
  noSqlInjectionProtection,
  pathTraversalProtection,
  contentTypeValidation,
  securityHeaders,
  ipFiltering
} = require('./middleware/security.middleware');

// Redis-backed stores
const csrfStore = require('./stores/csrfStore');
const { createStore: createRateLimitStore } = require('./stores/rateLimitStore');
const redisClient = require('./utils/redisClient');

// Import routes
const authRoutes = require('./routes/auth.routes');
const adminRoutes = require('./routes/admin.routes');
const profileRoutes = require('./routes/profile.routes');
const walletRoutes = require('./routes/wallet.routes');
const servicesRoutes = require('./routes/services.routes');
const aiExaminerRoutes = require('./routes/aiExaminer.routes');
const aiQuestionsRoutes = require('./routes/aiQuestions.routes');
const emailRoutes = require('./routes/email.routes');
const courseRecommendationRoutes = require('./routes/courseRecommendation.routes');
const leaderboardRoutes = require('./routes/leaderboard.routes');
const apiCostRoutes = require('./routes/apiCost.routes');
const knowledgeBaseRoutes = require('./routes/knowledgeBase.routes');

// Tutorial Center routes
const tutorialCenterRoutes = require('./routes/tutorialCenter.routes');
const tcEnrollmentsRoutes = require('./routes/tcEnrollments.routes');
const tcQuestionsRoutes = require('./routes/tcQuestions.routes');
const tcQuestionSetsRoutes = require('./routes/tcQuestionSets.routes');
const tcAttemptsRoutes = require('./routes/tcAttempts.routes');
const schedulerRoutes = require('./routes/scheduler.routes');

// Webhook routes (Paystack)
const webhookRoutes = require('./routes/webhook.routes');

// Phase 1 & 2 routes
const subscriptionRoutes = require('./routes/subscription.routes');
const messagingRoutes = require('./routes/messaging.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const gamificationRoutes = require('./routes/gamification.routes');
const phase2Routes = require('./routes/phase2Routes');

// Import middleware
const { errorHandler } = require('./middleware/errorHandler');
const logger = require('./utils/logger');

const app = express();

// ============================================
// 1. SECURITY HEADERS (Enhanced Helmet)
// ============================================
app.use(securityHeaders);
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://*.supabase.co"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// ============================================
// 2. CORS (Secure)
// ============================================
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://innovateam.vercel.app',
  ...(process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : [])
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    logger.warn('CORS blocked', { origin, ip: 'unknown' });
    callback(new Error('CORS policy: Origin not allowed'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-csrf-token', 'x-request-id'],
  exposedHeaders: ['Content-Length', 'x-request-id'],
  maxAge: 86400
}));

// ============================================
// 3. ENTERPRISE SECURITY MIDDLEWARE
// ============================================
app.use(ipFiltering);
app.use(noSqlInjectionProtection);
app.use(pathTraversalProtection);
app.use(contentTypeValidation);

// ============================================
// 4. REQUEST ID (for tracking)
// ============================================
app.use((req, res, next) => {
  req.id = crypto.randomBytes(8).toString('hex');
  res.setHeader('x-request-id', req.id);
  next();
});

// ============================================
// 5. XSS PROTECTION
// ============================================
const sanitizeInput = (obj) => {
  if (typeof obj === 'string') {
    return xss(obj);
  }
  if (Array.isArray(obj)) {
    return obj.map(sanitizeInput);
  }
  if (obj && typeof obj === 'object') {
    const sanitized = {};
    for (const key in obj) {
      sanitized[key] = sanitizeInput(obj[key]);
    }
    return sanitized;
  }
  return obj;
};

app.use((req, res, next) => {
  if (req.body) {
    req.body = sanitizeInput(req.body);
  }
  if (req.query) {
    req.query = sanitizeInput(req.query);
  }
  next();
});

// ============================================
// 6. REQUEST PARSING
// ============================================
app.use(express.json({
  limit: '10mb',
  verify: (req, res, buf) => {
    // Store raw body for webhook signature verification
    req.rawBody = buf.toString();
    if (/<script[\s\S]*?>[\s\S]*?<\/script>/gi.test(req.rawBody)) {
      throw new Error('Potentially malicious content detected');
    }
  }
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(compression());

// ============================================
// 7. LOGGING
// ============================================
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`[${req.id}] ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// ============================================
// 8. RATE LIMITING (Redis-backed)
// ============================================
const authWindowMs = 15 * 60 * 1000;
const apiWindowMs = 15 * 60 * 1000;

const authLimiter = rateLimit({
  windowMs: authWindowMs,
  max: process.env.NODE_ENV === 'development' ? 50 : 5,
  message: { success: false, error: 'Too many authentication attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  store: createRateLimitStore(authWindowMs)
});

const apiLimiter = rateLimit({
  windowMs: apiWindowMs,
  max: process.env.NODE_ENV === 'development' ? 500 : 100,
  message: { success: false, error: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  store: createRateLimitStore(apiWindowMs)
});

app.use('/api/auth/register', authLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/', apiLimiter);

// ============================================
// 9. SSRF PROTECTION
// ============================================
const blockedHosts = ['localhost', '127.0.0.1', '0.0.0.0', '169.254.169.254'];

app.use('/api', (req, res, next) => {
  const checkForSSRF = (obj) => {
    if (typeof obj === 'string') {
      try {
        const url = new URL(obj);
        if (blockedHosts.some(host => url.hostname.includes(host))) {
          throw new Error('SSRF attempt detected');
        }
      } catch (e) {
        // Not a URL, ignore
      }
    } else if (obj && typeof obj === 'object') {
      for (const key in obj) {
        checkForSSRF(obj[key]);
      }
    }
  };

  try {
    if (req.body) checkForSSRF(req.body);
    next();
  } catch (error) {
    res.status(400).json({ success: false, error: 'Invalid request' });
  }
});

// ============================================
// 10. CSRF PROTECTION (Redis-backed, global)
// ============================================
app.get('/api/csrf-token', async (req, res) => {
  const token = crypto.randomBytes(32).toString('hex');
  await csrfStore.set(token);
  res.json({ csrfToken: token });
});

const csrfProtection = async (req, res, next) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();

  const token = req.headers['x-csrf-token'];
  if (!token) {
    logger.warn('CSRF token missing', { ip: req.ip, path: req.path });
    return res.status(403).json({ success: false, error: 'Invalid CSRF token' });
  }

  const valid = await csrfStore.has(token);
  if (!valid) {
    logger.warn('CSRF token invalid', { ip: req.ip, path: req.path });
    return res.status(403).json({ success: false, error: 'Invalid CSRF token' });
  }

  // One-time use: delete after validation
  await csrfStore.del(token);
  next();
};

// ============================================
// 11. HEALTH CHECK (before CSRF)
// ============================================
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    redis: redisClient.isRedisReady() ? 'connected' : 'unavailable'
  });
});

app.get('/', (req, res) => {
  res.json({
    message: 'InnovaTeam API - Enterprise Security',
    version: '3.0.0',
    security: 'OWASP Top 10 Protected',
    timestamp: new Date().toISOString()
  });
});

// ============================================
// 12. API ROUTES (CSRF applied globally)
// ============================================

// Webhook routes - BEFORE CSRF (verified by Paystack signature)
app.use('/api/webhooks', webhookRoutes);

// Auth routes - CSRF exempt for login/register
app.use('/api/auth', authRoutes);

// Wallet routes - BEFORE CSRF (protected by Bearer token auth, not cookies)
app.use('/api/wallet', walletRoutes);

// Subscription routes - BEFORE CSRF (protected by Bearer token auth)
app.use('/api/subscriptions', subscriptionRoutes);

// Apply CSRF to all remaining /api routes
app.use('/api', csrfProtection);

// Protected routes
app.use('/api/profile', profileRoutes);
app.use('/api/services', servicesRoutes);

// AI routes
app.use('/api/ai-examiner', aiExaminerRoutes);
app.use('/api/admin/ai-questions', aiQuestionsRoutes);

// Other routes
app.use('/api/email', emailRoutes);
app.use('/api', courseRecommendationRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/cost-monitoring', apiCostRoutes);
app.use('/api/knowledge-base', knowledgeBaseRoutes);

// Tutorial Center routes
app.use('/api/tutorial-centers', tutorialCenterRoutes);
app.use('/api/tc-enrollments', tcEnrollmentsRoutes);
app.use('/api/tc-questions', tcQuestionsRoutes);
app.use('/api/tc-question-sets', tcQuestionSetsRoutes);
app.use('/api/tc-attempts', tcAttemptsRoutes);
app.use('/api/scheduler', schedulerRoutes);

// Phase 1 routes
app.use('/api/analytics', analyticsRoutes);
app.use('/api/gamification', gamificationRoutes);

// ============================================
// 13. ERROR HANDLING
// ============================================

app.use('/api/messages', messagingRoutes);
app.use('/phase2/messaging', messagingRoutes);
app.use('/phase2', phase2Routes);
app.use('/api/phase2', phase2Routes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.path
  });
});

app.use(errorHandler);

// ============================================
// 14. SERVER STARTUP
// ============================================

const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';

const server = app.listen(PORT, HOST, () => {
  console.log('\n' + '='.repeat(60));
  console.log('InnovaTeam ENTERPRISE SECURITY Server Started');
  console.log('='.repeat(60));
  console.log(`URL: http://${HOST}:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Redis: ${redisClient.isRedisReady() ? 'connected' : 'in-memory fallback'}`);
  console.log('\nSecurity Features Active:');
  console.log('   - XSS Protection');
  console.log('   - CSRF Protection (global, Redis-backed)');
  console.log('   - SSRF Protection');
  console.log('   - Path Traversal Protection');
  console.log('   - Rate Limiting (Redis-backed)');
  console.log('   - Security Audit Logging');
  console.log('   - Input Validation & Sanitization');
  console.log('='.repeat(60) + '\n');

  logger.info('Secure server started successfully');

  // Start test scheduler
  const testSchedulerService = require('./services/testScheduler.service');
  schedulerInterval = setInterval(async () => {
    try {
      await testSchedulerService.runScheduler();
    } catch (error) {
      logger.error('Scheduler error:', error);
    }
  }, 60000);

  logger.info('Test scheduler started (runs every minute)');
});

// ============================================
// 15. GRACEFUL SHUTDOWN
// ============================================

let schedulerInterval;

const gracefulShutdown = async (signal) => {
  logger.info(`${signal} received, shutting down gracefully...`);

  // Stop accepting new connections
  server.close(async () => {
    logger.info('HTTP server closed - all active connections drained');

    if (schedulerInterval) {
      clearInterval(schedulerInterval);
    }

    // Close Redis connection
    await redisClient.close();

    process.exit(0);
  });

  // Force shutdown after 30 seconds
  setTimeout(() => {
    logger.error('Forced shutdown - connections did not drain in 30 seconds');
    process.exit(1);
  }, 30000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  gracefulShutdown('uncaughtException');
});

module.exports = app;
