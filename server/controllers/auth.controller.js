const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const { logger } = require('../utils/logger');

// Path to users data file
const usersFilePath = path.join(__dirname, '../data/users.json');

// Ensure data directory exists
if (!fs.existsSync(path.dirname(usersFilePath))) {
  fs.mkdirSync(path.dirname(usersFilePath), { recursive: true });
}

// Load users from file or initialize empty array
let users = [];

// Load users from file if it exists
const loadUsers = () => {
  if (fs.existsSync(usersFilePath)) {
    try {
      const data = fs.readFileSync(usersFilePath, 'utf8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        users = parsed;
        logger.info(`Loaded ${users.length} users from file`);
      } else {
        logger.warn('Users file does not contain an array, initializing with empty array');
        users = [];
      }
    } catch (error) {
      logger.error('Error reading users file:', error);
      users = [];
    }
  } else {
    logger.info('No users file found, starting with empty users array');
    users = [];
  }
};

// Initial load
loadUsers();

// Function to save users to file
const saveUsers = () => {
  try {
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), 'utf8');
  } catch (error) {
    logger.error('Error saving users file:', error);
  }
};

// Ensure there's at least one admin user
const ensureAdminUser = async () => {
  const adminEmail = 'admin@example.com';
  const adminExists = users.some(u => u.role === 'admin');
  
  if (!adminExists) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    users.push({
      id: Date.now().toString(),
      name: 'Admin User',
      email: adminEmail,
      phoneNumber: '1234567890',
      password: hashedPassword,
      role: 'admin',
      createdAt: new Date().toISOString()
    });
    saveUsers();
    logger.info('Created default admin user');
  }
};

// Initialize admin user when the server starts
ensureAdminUser().catch(error => {
  logger.error('Error ensuring admin user exists:', error);
});

const generateTokens = (user) => {
  // Ensure we have a complete user object
  const userWithDefaults = {
    id: user.id,
    email: user.email,
    role: user.role || 'user',
    ...user
  };

  // Include all necessary user data in the token payload
  const tokenPayload = { 
    userId: userWithDefaults.id,  // Use userId for consistency
    id: userWithDefaults.id,      // Keep id for backward compatibility
    email: userWithDefaults.email,
    role: userWithDefaults.role,
    isAdmin: userWithDefaults.role === 'admin'
  };

  const token = jwt.sign(
    tokenPayload,
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '1h' }
  );

  const refreshToken = jwt.sign(
    tokenPayload,
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '7d' }
  );

  return { 
    token, 
    refreshToken,
    user: tokenPayload  // Include the complete user data in the response
  };
};

exports.register = async (req, res) => {
  try {
    const { name, email, phoneNumber, password } = req.body;

    // Validate input
    if (!name || !email || !phoneNumber || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Check if user exists (in-memory)
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user (in-memory)
    const user = {
      id: Date.now().toString(),
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
    const { token, refreshToken } = generateTokens(user);

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
    logger.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating user'
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Log the login attempt with basic info
    logger.info('🔐 Login attempt', { 
      email, 
      hasPassword: !!password,
      requestBody: { email, password: password ? '***' : undefined }
    });
    
    // Log all users (safely, without passwords)
    const safeUsers = users.map(u => ({
      id: u.id,
      email: u.email,
      role: u.role,
      hasPassword: !!u.password,
      passwordLength: u.password ? u.password.length : 0
    }));
    logger.debug('📋 Current users in memory:', safeUsers);

    // Find user (in-memory)
    const user = users.find(u => u.email === email);
    if (!user) {
      logger.warn('❌ Login failed: User not found', { email });
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    logger.debug('👤 User found in database', { 
      userId: user.id, 
      email: user.email,
      role: user.role,
      hasPassword: !!user.password,
      passwordLength: user.password ? user.password.length : 0
    });
    
    // Check if user has a password
    if (!user.password) {
      logger.error('❌ Login failed: User has no password hash', { email });
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Log the password verification attempt
    logger.debug('🔑 Verifying password...', {
      providedPassword: password,
      storedHash: user.password.substring(0, 10) + '...',
      storedHashLength: user.password.length,
      isBcryptHash: user.password.startsWith('$2a$') || user.password.startsWith('$2b$')
    });
    
    // Check password
    logger.debug('🔑 Verifying password...');
    const isPasswordValid = await bcrypt.compare(password, user.password);
    logger.debug('🔑 Password check result', { 
      isPasswordValid,
      providedPassword: password,
      storedHash: user.password.substring(0, 10) + '...' // Show first 10 chars of hash for debugging
    });
    
    if (!isPasswordValid) {
      logger.warn('❌ Login failed: Invalid password', { email });
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Save users to file
    saveUsers();

    // Generate tokens - this now includes the user data
    const { token, refreshToken, user: userData } = generateTokens(user);

    // Remove password from response
    const userResponse = { ...user };
    delete userResponse.password;

    res.json({
      success: true,
      user: {
        ...userResponse,
        id: user.id,  // Ensure id is included
        userId: user.id,  // Add userId for consistency
        role: user.role || 'user',
        isAdmin: user.role === 'admin'
      },
      token,
      refreshToken
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging in'
    });
  }
};

exports.logout = async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging out'
    });
  }
};

exports.validateToken = async (req, res) => {
  try {
    // Ensure we have a user object with role
    if (!req.user) {
      return res.status(401).json({
        success: false,
        valid: false,
        message: 'No user found in request'
      });
    }

    // Get the user from the database (in-memory array in this case)
    const user = users.find(u => u.id === req.user.id || u.email === req.user.email);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        valid: false,
        message: 'User not found'
      });
    }

    // Create a complete user object with all necessary fields
    const userWithRole = {
      id: user.id,
      userId: user.id,  // For consistency
      email: user.email,
      name: user.name,
      phoneNumber: user.phoneNumber,
      role: user.role || 'user',
      isAdmin: user.role === 'admin'
    };

    res.json({
      success: true,
      valid: true,
      userId: user.id,
      userEmail: user.email,
      userRole: user.role,
      isAdmin: user.role === 'admin',
      user: userWithRole
    });
  } catch (error) {
    logger.error('Token validation error:', error);
    res.status(500).json({
      success: false,
      valid: false
    });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required'
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET || 'your-secret-key');

    // Find user (in-memory)
    const user = users.find(u => u.email === decoded.email);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate new tokens
    const tokens = generateTokens(user);

    // Remove password from response
    const userResponse = { ...user };
    delete userResponse.password;

    res.json({
      success: true,
      user: userResponse,
      ...tokens
    });
  } catch (error) {
    logger.error('Token refresh error:', error);
    if (error.name === 'JsonWebTokenError') {
      res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Error refreshing token'
      });
    }
  }
}; 