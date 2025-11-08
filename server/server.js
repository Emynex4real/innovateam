// Load environment variables FIRST before any other modules
const path = require('path');
const fs = require('fs');

// Check if dotenv has already been loaded
if (!process.env.LOADED_DOTENV) {
  try {
    const dotenv = require('dotenv');
    const envPath = path.join(__dirname, '.env');
    console.log(`📁 Loading environment variables from: ${envPath}`);
    const envFileExists = fs.existsSync(envPath);
    if (!envFileExists) {
      throw new Error(`.env file not found at ${envPath}`);
    }
    const envConfig = dotenv.parse(fs.readFileSync(envPath));
    for (const key in envConfig) {
      if (!(key in process.env)) {
        process.env[key] = envConfig[key];
      }
    }
    process.env.LOADED_DOTENV = 'true';
    console.log(`✅ Loaded ${Object.keys(envConfig).length} environment variables from .env`);
  } catch (error) {
    console.error('❌ Failed to load environment variables:');
    console.error('   Error:', error.message);
    console.error('   Stack:', error.stack);
    process.exit(1);
  }
} else {
  console.log('ℹ️ Environment variables already loaded');
}

// Enhanced environment variable loading with detailed logging
console.log('🔍 Starting server initialization...');
console.log(`   Node.js version: ${process.version}`);
console.log(`   Platform: ${process.platform} ${process.arch}`);
console.log(`   Current working directory: ${process.cwd()}`);
console.log(`   __dirname: ${__dirname}`);

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const { errorHandler } = require('./middleware/errorHandler');
const { csrfProtection, csrfTokenRoute } = require('./middleware/csrf');
const { middleware: ssrfMiddleware } = require('./middleware/ssrfProtection');
const { xssProtection } = require('./middleware/xssProtection');
const authRoutes = require('./routes/auth.routes');
const { logger } = require('./utils/logger');
const adminRoutes = require('./routes/admin.routes');
const profileRoutes = require('./routes/profile.routes');
const http = require('http');

// Verify required environment variables
const requiredEnvVars = [
  'PORT',
  'JWT_SECRET',
  'JWT_EXPIRES_IN',
  'JWT_REFRESH_EXPIRES_IN',
  'SUPABASE_URL',
  'SUPABASE_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'SUPABASE_JWT_SECRET'
];
console.log('🔍 Verifying required environment variables...');
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  console.warn('⚠️ Missing environment variables:', missingVars.join(', '));
  console.log('Current environment variables:', 
    Object.keys(process.env).filter(k => 
      k.startsWith('SUPABASE_') || k.startsWith('JWT_') || k === 'NODE_ENV' || k === 'PORT'
    )
  );
  console.log('⚠️ Server will start but some features may not work');
}

// Log non-sensitive configuration
console.log('\n📋 Configuration:');
console.log(`   - NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
console.log(`   - PORT: ${process.env.PORT}`);
console.log(`   - SUPABASE_URL: ${process.env.SUPABASE_URL ? '*** (configured)' : 'missing'}`);
console.log(`   - SUPABASE_KEY: ${process.env.SUPABASE_KEY ? '*** (present)' : 'missing'}`);
console.log(`   - SUPABASE_SERVICE_ROLE_KEY: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? '*** (present)' : 'missing'}`);
console.log(`   - JWT_SECRET: ${process.env.JWT_SECRET ? '*** (present)' : 'missing'}\n`);
if (missingVars.length === 0) {
  console.log('✅ All required environment variables are present');
}

// Initialize express app and server
const app = express();
const server = http.createServer(app);
server.maxHeadersSize = 16384; // Increase max header size to 16KB

// Health check endpoint (before other middleware)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Root route (before other middleware)
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the API', timestamp: new Date().toISOString() });
});

// Filter out irrelevant cookies to prevent 431 error
app.use((req, res, next) => {
  if (req.headers.cookie) {
    const relevantCookies = req.headers.cookie
      .split('; ')
      .filter(cookie => !cookie.startsWith('username-localhost-888') && !cookie.startsWith('_xsrf'))
      .join('; ');
    req.headers.cookie = relevantCookies || '';
  }
  next();
});

// Add request ID to each request for better tracing
app.use((req, res, next) => {
  req.requestId = Math.random().toString(36).substring(2, 10);
  next();
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Enhanced request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const { method, originalUrl, ip, headers } = req;
  console.log(`\n🌐 [${req.requestId}] ${method} ${originalUrl} from ${ip}`);
  console.log(`   📝 Headers: ${JSON.stringify(headers, null, 2)}`);
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`✅ [${req.requestId}] ${method} ${originalUrl} - ${res.statusCode} (${duration}ms)`);
    if (res.statusCode >= 400) {
      console.error(`❌ [${req.requestId}] Error ${res.statusCode}: ${res.statusMessage || 'Unknown error'}`);
    }
  });
  next();
});

// Security middleware with CSP
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://js.paystack.co"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "http://localhost:5000", "https://api.deepseek.com", "https://*.supabase.co"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"]
    }
  },
  crossOriginEmbedderPolicy: false
}));

// CORS configuration - Secure origins
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.CORS_ORIGIN?.split(',') || false
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-csrf-token', 'x-requested-with'],
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// CSRF token endpoint
app.get('/api/csrf-token', csrfTokenRoute);

// Apply XSS protection to all routes
app.use(xssProtection);

// Apply SSRF protection to all API routes
app.use('/api', ssrfMiddleware());

// Apply CSRF protection to state-changing routes
app.use('/api/auth', csrfProtection);
app.use('/api/admin', csrfProtection);
app.use('/api/profile', csrfProtection);
app.use('/api/wallet', csrfProtection);
app.use('/api/services', csrfProtection);
app.use('/api/ai-examiner', csrfProtection);

// Request parsing with increased limits and XSS protection
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    // Basic XSS detection in JSON payloads
    const body = buf.toString();
    if (/<script|javascript:|on\w+=/i.test(body)) {
      const error = new Error('Potentially malicious content detected');
      error.status = 400;
      throw error;
    }
  }
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb',
  verify: (req, res, buf) => {
    // Basic XSS detection in URL-encoded payloads
    const body = buf.toString();
    if (/<script|javascript:|on\w+=/i.test(body)) {
      const error = new Error('Potentially malicious content detected');
      error.status = 400;
      throw error;
    }
  }
}));

// Increase header size limits
app.use((req, res, next) => {
  req.setTimeout(30000);
  res.setTimeout(30000);
  next();
});

// Compression
app.use(compression());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: process.env.NODE_ENV === 'development' ? 5000 : 500,
  message: 'Too many registration attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false
});
const apiLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: process.env.NODE_ENV === 'development' ? 10000 : 2000,
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false
});
if (process.env.NODE_ENV === 'production') {
  app.use('/api/auth/register', authLimiter);
  app.use('/api/auth/login', authLimiter);
}
app.use('/api/', apiLimiter);

// Simple test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working', timestamp: new Date().toISOString() });
});

// API health endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'API is healthy',
    timestamp: new Date().toISOString(),
    supabase: process.env.SUPABASE_URL ? 'configured' : 'missing'
  });
});

// Use routes (after CSRF middleware)
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/wallet', require('./routes/wallet.routes'));
app.use('/api/services', require('./routes/services.routes'));
app.use('/api/ai-examiner', require('./routes/aiExaminer.routes'));
app.use('/api', require('./routes/courseRecommendation.routes'));

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  const buildPath = path.join(__dirname, '../build');
  if (!fs.existsSync(buildPath)) {
    try {
      logger.info('No build folder found. Building frontend...');
      const { execSync } = require('child_process');
      execSync('npm run build', { cwd: path.join(__dirname, '../client'), stdio: 'inherit' });
      logger.info('Frontend build complete.');
    } catch (err) {
      logger.error('Failed to build frontend automatically:', err);
    }
  }
  app.use(express.static(buildPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
}



// Error handling
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';
server.listen(PORT, HOST, () => {
  logger.info(`Server is running on http://${HOST}:${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info('Available endpoints:');
  logger.info(`- GET  http://${HOST}:${PORT}/health`);
  logger.info(`- GET  http://${HOST}:${PORT}/`);
  logger.info(`- POST http://${HOST}:${PORT}/api/auth/register`);
  logger.info(`- POST http://${HOST}:${PORT}/api/auth/login`);
}).on('error', (error) => {
  logger.error('Failed to start server:', error);
  process.exit(1);
});

// Log server close events
server.on('close', () => {
  logger.info('Server is shutting down');
});

// Enhanced unhandled promise rejections handler
process.on('unhandledRejection', (reason, promise) => {
  const errorId = Math.random().toString(36).substring(2, 10);
  console.error(`\n❌ [${errorId}] UNHANDLED PROMISE REJECTION`);
  console.error(`   Reason:`, reason);
  if (reason instanceof Error) {
    console.error(`   Stack:`, reason.stack);
    const errorDetails = {};
    Object.getOwnPropertyNames(reason).forEach(key => {
      if (key !== 'stack' && key !== 'message') {
        errorDetails[key] = reason[key];
      }
    });
    if (Object.keys(errorDetails).length > 0) {
      console.error(`   Error details:`, errorDetails);
    }
  }
  console.error(`   Promise:`, promise);
  if (process.env.NODE_ENV === 'production') {
    // process.exit(1);
  }
});

// Enhanced uncaught exceptions handler
process.on('uncaughtException', (error) => {
  const errorId = Math.random().toString(36).substring(2, 10);
  console.error(`\n❌ [${errorId}] UNCAUGHT EXCEPTION`);
  console.error(`   Message: ${error.message}`);
  console.error(`   Stack:`, error.stack);
  const errorDetails = {};
  Object.getOwnPropertyNames(error).forEach(key => {
    if (key !== 'stack' && key !== 'message') {
      errorDetails[key] = error[key];
    }
  });
  if (Object.keys(errorDetails).length > 0) {
    console.error(`   Error details:`, errorDetails);
  }
  if (process.env.NODE_ENV === 'production') {
    // process.exit(1);
  }
});

module.exports = app;