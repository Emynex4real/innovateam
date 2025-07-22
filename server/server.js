const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const { errorHandler } = require('./middleware/errorHandler');
const authRoutes = require('./routes/auth.routes');
const { logger } = require('./utils/logger');
const adminRoutes = require('./routes/admin.routes');

// In-memory users array for testing
const users = [];

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

// Enhanced request logging
app.use((req, res, next) => {
  const start = Date.now();
  
  // Log the incoming request
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`, {
    headers: req.headers,
    query: req.query,
    body: req.body,
    ip: req.ip
  });

  // Store the original end function
  const originalEnd = res.end;
  
  // Create a buffer to store the response body
  const chunks = [];
  
  // Override the end function to capture the response
  res.end = function (chunk, ...args) {
    if (chunk) chunks.push(Buffer.from(chunk));
    
    // Log the response
    const responseTime = Date.now() - start;
    let responseBody = '';
    
    try {
      responseBody = Buffer.concat(chunks).toString('utf8');
      if (responseBody) JSON.parse(responseBody); // Check if it's valid JSON
    } catch (e) {
      // If not JSON, use as is
      responseBody = chunks.length ? chunks[0].toString('utf8') : '';
    }
    
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} ${res.statusCode} - ${responseTime}ms`, {
      status: res.statusCode,
      responseTime: `${responseTime}ms`,
      response: responseBody.length > 500 ? `${responseBody.substring(0, 500)}...` : responseBody
    });
    
    // Call the original end function
    return originalEnd.apply(res, [chunk, ...args]);
  };
  
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

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Authentication endpoints
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, phoneNumber, password } = req.body;

    // Validate input
    if (!name || !email || !phoneNumber || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user already exists (in-memory)
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user (in-memory)
    const user = { 
      id: users.length + 1,
      name, 
      email, 
      phoneNumber, 
      password: hashedPassword,
      role: 'user', // Default role is user
      createdAt: new Date()
    };

    // If this is the first user, make them an admin
    if (users.length === 0) {
      user.role = 'admin';
    }
    users.push(user);

    // Generate tokens
    const token = jwt.sign({ email: user.email }, JWT_SECRET, { expiresIn: '1h' });
    const refreshToken = jwt.sign({ email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    // Remove password from response
    const userResponse = { ...user };
    delete userResponse.password;

    res.status(201).json({
      success: true,
      user: userResponse,
      token,
      refreshToken
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error creating user' 
    });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user (in-memory)
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate tokens
    const token = jwt.sign({ email: user.email }, JWT_SECRET, { expiresIn: '1h' });
    const refreshToken = jwt.sign({ email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    // Remove password from response
    const userResponse = { ...user };
    delete userResponse.password;

    res.json({
      success: true,
      user: userResponse,
      token,
      refreshToken
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in' });
  }
});

// Add logout endpoint
app.post('/api/auth/logout', (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    // In a real application, you would:
    // 1. Validate the refresh token
    // 2. Add it to a blacklist
    // 3. Clear any server-side session data
    
    // For now, we'll just return a success response
    res.json({ 
      success: true, 
      message: 'Logged out successfully' 
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error logging out' 
    });
  }
});

// Add token validation endpoint
app.get('/api/auth/validate', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ valid: false });
    }

    // Verify token
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ valid: false });
      }
      
      // Find user in memory
      const user = users.find(u => u.email === decoded.email);
      if (!user) {
        return res.status(401).json({ valid: false });
      }

      // Return user object with isAdmin
      const userResponse = {
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        isAdmin: user.role === 'admin',
      };

      res.json({ valid: true, user: userResponse });
    });
  } catch (error) {
    console.error('Token validation error:', error);
    res.status(500).json({ valid: false });
  }
});

// Add token refresh endpoint
app.post('/api/auth/refresh-token', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token is required' });
    }

    // Verify refresh token
    jwt.verify(refreshToken, JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: 'Invalid refresh token' });
      }

      // Find user in memory
      const user = users.find(u => u.email === decoded.email);
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }

      // Generate new tokens
      const token = jwt.sign({ email: user.email }, JWT_SECRET, { expiresIn: '1h' });
      const newRefreshToken = jwt.sign({ email: user.email }, JWT_SECRET, { expiresIn: '7d' });

      // Return user object with isAdmin
      const userResponse = {
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        isAdmin: user.role === 'admin',
      };

      res.json({
        token,
        refreshToken: newRefreshToken,
        user: userResponse
      });
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ message: 'Error refreshing token' });
  }
});

// Use auth routes
app.use('/api/auth', authRoutes);

// Use admin routes
app.use('/api/admin', adminRoutes);

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

// Add request logging middleware
app.use((req, res, next) => {
  logger.info(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

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