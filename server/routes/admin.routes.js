const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authenticate');

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admin privileges required.' });
  }
};

// Apply authentication and admin check to all admin routes
router.use(authenticate);
router.use(isAdmin);

// GET /api/admin/metrics
router.get('/metrics', (req, res) => {
  res.json({
    totalUsers: 100,
    totalTransactions: 200,
    totalServices: 10,
    revenue: 5000
  });
});

// GET /api/users
router.get('/users', (req, res) => {
  res.json({
    users: [
      { id: 1, name: 'John Doe', email: 'john@example.com', role: 'user', status: 'active' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'admin', status: 'active' }
    ]
  });
});

// GET /api/transactions
router.get('/transactions', (req, res) => {
  res.json({
    transactions: [
      { id: 1, user: { name: 'John Doe', email: 'john@example.com' }, amount: 100, type: 'purchase', status: 'completed', createdAt: new Date() },
      { id: 2, user: { name: 'Jane Smith', email: 'jane@example.com' }, amount: 200, type: 'refund', status: 'pending', createdAt: new Date() }
    ]
  });
});

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