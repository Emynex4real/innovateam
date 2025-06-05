const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { AppError } = require('../middleware/errorHandler');
const { logger } = require('../utils/logger');
const User = require('../models/User');

// In-memory users array for testing (remove when using MongoDB)
const users = [];

const generateTokens = (user) => {
  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  const refreshToken = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  return { token, refreshToken };
};

exports.register = async (req, res, next) => {
  try {
    const { name, email, phoneNumber, password } = req.body;

    // Check if user exists (in-memory)
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      throw new AppError('User already exists', 400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user (in-memory)
    const user = {
      id: Date.now().toString(),
      name,
      email,
      phoneNumber,
      password: hashedPassword
    };
    users.push(user);

    // Generate tokens
    const { token, refreshToken } = generateTokens(user);

    // Remove password from response
    const userResponse = { ...user };
    delete userResponse.password;

    res.status(201).json({
      status: 'success',
      data: {
        user: userResponse,
        token,
        refreshToken
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user (in-memory)
    const user = users.find(u => u.email === email);
    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401);
    }

    // Generate tokens
    const { token, refreshToken } = generateTokens(user);

    // Remove password from response
    const userResponse = { ...user };
    delete userResponse.password;

    res.json({
      status: 'success',
      data: {
        user: userResponse,
        token,
        refreshToken
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.logout = async (req, res, next) => {
  try {
    // In a real application, you would:
    // 1. Add the token to a blacklist
    // 2. Clear any server-side session data
    res.json({
      status: 'success',
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};

exports.validateToken = async (req, res, next) => {
  try {
    res.json({
      status: 'success',
      data: {
        valid: true,
        user: req.user
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new AppError('Refresh token is required', 400);
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

    // Find user (in-memory)
    const user = users.find(u => u.email === decoded.email);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Generate new tokens
    const tokens = generateTokens(user);

    // Remove password from response
    const userResponse = { ...user };
    delete userResponse.password;

    res.json({
      status: 'success',
      data: {
        user: userResponse,
        ...tokens
      }
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      next(new AppError('Invalid refresh token', 401));
    } else {
      next(error);
    }
  }
}; 