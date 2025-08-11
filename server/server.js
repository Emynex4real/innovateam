// Enhanced environment variable loading with detailed logging
console.log('🔍 Starting server initialization...');
console.log(`   Node.js version: ${process.version}`);
console.log(`   Platform: ${process.platform} ${process.arch}`);
console.log(`   Current working directory: ${process.cwd()}`);
console.log(`   __dirname: ${__dirname}`);

const path = require('path');
const fs = require('fs');

// Check if dotenv has already been loaded
if (!process.env.LOADED_DOTENV) {
  try {
    const dotenv = require('dotenv');
    
    // Load environment variables from the root directory (one level up from server/)
    const envPath = path.join(__dirname, '..', '.env');
    console.log(`📁 Loading environment variables from: ${envPath}`);
    
    // Check if .env file exists
    const envFileExists = fs.existsSync(envPath);
    if (!envFileExists) {
      throw new Error(`.env file not found at ${envPath}`);
    }
    
    // Load environment variables
    const envConfig = dotenv.parse(fs.readFileSync(envPath));
    
    // Add to process.env if not already set (don't override existing env vars)
    for (const key in envConfig) {
      if (!(key in process.env)) {
        process.env[key] = envConfig[key];
      }
    }
    
    // Mark as loaded
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
  console.error('❌ Missing required environment variables:', missingVars.join(', '));
  console.log('Current environment variables:', 
    Object.keys(process.env).filter(k => 
      k.startsWith('SUPABASE_') || k.startsWith('JWT_') || k === 'NODE_ENV' || k === 'PORT'
    )
  );
  process.exit(1);
}

// Log non-sensitive configuration
console.log('\n📋 Configuration:');
console.log(`   - NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
console.log(`   - PORT: ${process.env.PORT}`);
console.log(`   - SUPABASE_URL: ${process.env.SUPABASE_URL ? '***' : 'missing'}`);
console.log(`   - SUPABASE_KEY: ${process.env.SUPABASE_KEY ? '*** (present)' : 'missing'}`);
console.log(`   - SUPABASE_SERVICE_ROLE_KEY: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? '*** (present)' : 'missing'}`);
console.log(`   - JWT_SECRET: ${process.env.JWT_SECRET ? '*** (present)' : 'missing'}\n`);

if (missingVars.length === 0) {
  console.log('✅ All required environment variables are present');
  if (process.env.NODE_ENV === 'development') {
    console.log('🔐 Supabase URL:', process.env.SUPABASE_URL);
    console.log('🔑 Supabase Key:', process.env.SUPABASE_KEY ? '*** (present)' : 'missing');
    console.log('🔑 Supabase Service Role Key:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '*** (present)' : 'missing');
    console.log('🔑 JWT Secret:', process.env.JWT_SECRET ? '*** (present)' : 'missing');
  }
}

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const { errorHandler } = require('./middleware/errorHandler');
const authRoutes = require('./routes/auth.routes');
const { logger } = require('./utils/logger');
const adminRoutes = require('./routes/admin.routes');
const profileRoutes = require('./routes/profile.routes');


// Initialize express app
const app = express();

// Add request ID to each request for better tracing
app.use((req, res, next) => {
  req.requestId = Math.random().toString(36).substring(2, 10);
  next();
});

// Enhanced request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const { method, originalUrl, ip, headers } = req;
  
  // Log request start
  console.log(`\n🌐 [${req.requestId}] ${method} ${originalUrl} from ${ip}`);
  console.log(`   📝 Headers: ${JSON.stringify(headers, null, 2)}`);
  
  // Log response finish
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`✅ [${req.requestId}] ${method} ${originalUrl} - ${res.statusCode} (${duration}ms)`);
    if (res.statusCode >= 400) {
      console.error(`❌ [${req.requestId}] Error ${res.statusCode}: ${res.statusMessage || 'Unknown error'}`);
    }
  });
  
  next();
});

// Security middleware
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // In development, allow all origins
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    // In production, only allow specific origins
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:5001',
      'http://localhost:5002',
      'http://localhost:5003',
      'https://emynex4real.github.io',
      'https://emynex4real.github.io/innovateam',
      // Add your production domain here when ready
      // 'https://your-production-domain.com',
    ];
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200 // Some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Request parsing with increased limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Increase header size limits
app.use((req, res, next) => {
  // Set custom header size limits
  req.setTimeout(30000); // 30 seconds timeout
  res.setTimeout(30000);
  next();
});

// Enhanced request logging (DISABLED to fix 431 error)
// app.use((req, res, next) => {
//   const start = Date.now();
  
//   // Log the incoming request
//   console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`, {
//     headers: req.headers,
//     query: req.query,
//     body: req.body,
//     ip: req.ip
//   });

//   // Store the original end function
//   const originalEnd = res.end;
  
//   // Create a buffer to store the response body
//   const chunks = [];
  
//   // Override the end function to capture the response
//   res.end = function (chunk, ...args) {
//     if (chunk) chunks.push(Buffer.from(chunk));
    
//     // Log the response
//     const responseTime = Date.now() - start;
//     let responseBody = '';
    
//     try {
//       responseBody = Buffer.concat(chunks).toString('utf8');
//       if (responseBody) JSON.parse(responseBody); // Check if it's valid JSON
//     } catch (e) {
//       // If not JSON, use as is
//       responseBody = chunks.length ? chunks[0].toString('utf8') : '';
//     }
    
//     console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} ${res.statusCode} - ${responseTime}ms`, {
//       status: res.statusCode,
//       responseTime: `${responseTime}ms`,
//       response: responseBody.length > 500 ? `${responseBody.substring(0, 500)}...` : responseBody
//     });
    
//     // Call the original end function
//     return originalEnd.apply(res, [chunk, ...args]);
//   };
  
//   next();
// });

// Compression
app.use(compression());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes (reduced from 15)
  max: process.env.NODE_ENV === 'development' ? 5000 : 500, // Increased limits
  message: 'Too many registration attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false
});

const apiLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes (reduced from 15)
  max: process.env.NODE_ENV === 'development' ? 10000 : 2000, // Increased limits
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false
});

// Apply rate limiting only to specific routes
if (process.env.NODE_ENV === 'production') {
  app.use('/api/auth/register', authLimiter);  // Stricter limit for registration
  app.use('/api/auth/login', authLimiter);     // Stricter limit for login
}
app.use('/api/', apiLimiter);

// Use auth routes
app.use('/api/auth', authRoutes);

// Use admin routes
app.use('/api/admin', adminRoutes);
app.use('/api/profile', profileRoutes);

// === AUTOMATED FRONTEND BUILD SERVE LOGIC ===
// If the build folder does not exist, automatically build the frontend
if (process.env.NODE_ENV === 'production') {
  const fs = require('fs');
  const buildPath = path.join(__dirname, '../build');
  const clientPath = path.join(__dirname, '../client');
  if (!fs.existsSync(buildPath)) {
    // Try to build the frontend automatically
    try {
      logger.info('No build folder found. Building frontend...');
      const { execSync } = require('child_process');
      execSync('npm run build', { cwd: clientPath, stdio: 'inherit' });
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

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Add root route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the API' });
});

// Error handling
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5001; // Changed from 5000 to 5001 to avoid System process conflict
const HOST = '0.0.0.0'; // Bind to all network interfaces

const server = app.listen(PORT, HOST, () => {
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
  
  // Log detailed error information
  console.error(`\n❌ [${errorId}] UNHANDLED PROMISE REJECTION`);
  console.error(`   Reason:`, reason);
  
  // If the reason is an error object, log its stack trace
  if (reason instanceof Error) {
    console.error(`   Stack:`, reason.stack);
    
    // Log all properties of the error object
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
  
  // Log the promise that was rejected
  console.error(`   Promise:`, promise);
  
  // In production, you might want to log this to an error tracking service
  // Consider whether to exit or not based on your use case
  if (process.env.NODE_ENV === 'production') {
    // process.exit(1);
  }
});

// Enhanced uncaught exceptions handler
process.on('uncaughtException', (error) => {
  const errorId = Math.random().toString(36).substring(2, 10);
  
  // Log detailed error information
  console.error(`\n❌ [${errorId}] UNCAUGHT EXCEPTION`);
  console.error(`   Message: ${error.message}`);
  console.error(`   Stack:`, error.stack);
  
  // Log all properties of the error object
  const errorDetails = {};
  Object.getOwnPropertyNames(error).forEach(key => {
    if (key !== 'stack' && key !== 'message') {
      errorDetails[key] = error[key];
    }
  });
  
  if (Object.keys(errorDetails).length > 0) {
    console.error(`   Error details:`, errorDetails);
  }
  
  // In production, you might want to log this to an error tracking service
  // Consider whether to exit or not based on your use case
  if (process.env.NODE_ENV === 'production') {
    // process.exit(1);
  }
});

module.exports = app;
