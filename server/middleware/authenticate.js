const jwt = require('jsonwebtoken');
const { AppError } = require('./errorHandler');

// Import the getUsers function from auth controller
const { getUsers } = require('../controllers/auth.controller');

exports.authenticate = async (req, res, next) => {
  try {
    // Log incoming auth header for debugging
    console.log('[AUTH MIDDLEWARE] Incoming Authorization header:', req.headers.authorization);
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('[AUTH MIDDLEWARE] No token provided in header');
      throw new AppError('No token provided', 401);
    }

    const token = authHeader.split(' ')[1];
    console.log('[AUTH MIDDLEWARE] Extracted token:', token ? token.substring(0, 12) + '...' : undefined);

    // Verify token and decode the payload
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      console.log('[AUTH MIDDLEWARE] Decoded token:', decoded);
    } catch (jwtError) {
      console.error('[AUTH MIDDLEWARE] JWT verification error:', jwtError);
      throw jwtError;
    }
    
    // Log the decoded token and all users for debugging
    console.log('Decoded token:', decoded);
    const users = getUsers();
    console.log('All users in authenticate middleware:', users.map(u => ({ id: u.id, email: u.email, role: u.role })));
    const user = users.find(u => u.email === decoded.email);
    if (!user) {
      console.log('User not found for decoded email:', decoded.email);
      throw new AppError('User not found', 404);
    }
    // Log the user object being attached to the request
    console.log('Authenticated user:', {
      id: user.id,
      email: user.email,
      role: user.role,
      isAdmin: user.role === 'admin'
    });

    // Create user object with role from token or user object, default to 'user'
    const userWithRole = {
      id: user.id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: decoded.role || user.role || 'user',
      isAdmin: (decoded.role === 'admin' || user.role === 'admin')
    };

    // Add user to request with role
    req.user = userWithRole;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    if (error.name === 'JsonWebTokenError') {
      next(new AppError('Invalid token', 401));
    } else if (error.name === 'TokenExpiredError') {
      next(new AppError('Token expired', 401));
    } else {
      next(error);
    }
  }
};