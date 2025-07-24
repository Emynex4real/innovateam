const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const { errorHandler } = require('./middleware/errorHandler');
const authRoutes = require('./routes/auth.routes');
const { logger } = require('./utils/logger');
const adminRoutes = require('./routes/admin.routes');
const path = require('path');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:3003',
    'http://localhost:3004',
    'http://localhost:5001',
    'http://localhost:5002', // <-- add this line
    'http://localhost:5003', // <-- allow frontend on 5003
    'https://emynex4real.github.io',
    'https://emynex4real.github.io/innovateam'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Request parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// Log uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', err);
  process.exit(1);
});

module.exports = app;