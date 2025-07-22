const jwt = require('jsonwebtoken');
const { AppError } = require('./errorHandler');

// Import the users array from auth controller
const { users } = require('../controllers/auth.controller');

exports.authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No token provided', 401);
    }

    const token = authHeader.split(' ')[1];

    // Verify token and decode the payload
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Log the decoded token for debugging
    console.log('Decoded token:', decoded);

    // Find user (in-memory)
    const user = users.find(u => u.email === decoded.email);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Create user object with role from token or user object, default to 'user'
    const userWithRole = {
      id: user.id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: decoded.role || user.role || 'user',
      isAdmin: (decoded.role === 'admin' || user.role === 'admin')
    };

    // Log the user object being attached to the request
    console.log('Authenticated user:', {
      id: userWithRole.id,
      email: userWithRole.email,
      role: userWithRole.role,
      isAdmin: userWithRole.isAdmin
    });

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