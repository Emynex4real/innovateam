const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authenticate');
const transactionsController = require('../controllers/transactions.controller');
const { logger } = require('../utils/logger');

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  logger.info('Checking admin status', { 
    userId: req.user?.id, 
    role: req.user?.role,
    path: req.path 
  });
  
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    logger.warn('Admin access denied', { 
      userId: req.user?.id, 
      role: req.user?.role,
      path: req.path 
    });
    res.status(403).json({ 
      success: false,
      message: 'Access denied. Admin privileges required.' 
    });
  }
};

// Apply authentication and admin check to all admin routes
router.use(authenticate);
router.use(isAdmin);

// GET /api/admin/metrics
router.get('/metrics', (req, res) => {
  res.json({
    success: true,
    data: {
      totalUsers: 100,
      totalTransactions: 200,
      totalServices: 10,
      revenue: 5000
    }
  });
});

// GET /api/admin/users
router.get('/users', (req, res) => {
  res.json({
    success: true,
    data: [
      { id: 1, name: 'John Doe', email: 'john@example.com', role: 'user', status: 'active' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'admin', status: 'active' }
    ]
  });
});

// GET /api/admin/transactions
router.get('/transactions', transactionsController.getTransactions);

// GET /api/services
router.get('/services', (req, res) => {
  res.json({
    services: [
      { id: 1, name: 'Service A', type: 'type1', price: 50, status: 'active' },
      { id: 2, name: 'Service B', type: 'type2', price: 100, status: 'active' }
    ]
  });
});

module.exports = router; 