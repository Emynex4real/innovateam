const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authenticate');
const transactionsController = require('../controllers/transactions.controller');
const { logger } = require('../utils/logger');
const fs = require('fs');
const path = require('path');

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

// Helper to load users and transactions from disk
function loadUsers() {
  const usersFile = path.join(__dirname, '../data/users.json');
  if (fs.existsSync(usersFile)) {
    return JSON.parse(fs.readFileSync(usersFile, 'utf8'));
  }
  return [];
}
function loadTransactions() {
  const txFile = path.join(__dirname, '../data/transactions.json');
  if (fs.existsSync(txFile)) {
    return JSON.parse(fs.readFileSync(txFile, 'utf8'));
  }
  return [];
}

// GET /api/admin/stats (dashboard metrics)
router.get('/stats', (req, res) => {
  const users = loadUsers();
  const transactions = loadTransactions();
  const totalUsers = users.length;
  const totalTransactions = transactions.length;
  const revenue = transactions.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  const recentUsers = users.slice(-5).reverse();
  const recentTransactions = transactions.slice(-5).reverse();
  res.json({
    success: true,
    data: {
      totalUsers,
      totalTransactions,
      revenue,
      recentUsers,
      recentTransactions
    }
  });
});

// GET /api/admin/users (real user list)
router.get('/users', (req, res) => {
  const users = loadUsers();
  res.json({
    success: true,
    data: users
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

// GET /api/admin/users/:id - get user details
router.get('/users/:id', (req, res) => {
  const users = loadUsers();
  const user = users.find(u => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  res.json({ success: true, data: user });
});

// PATCH /api/admin/users/:id/activate - activate user
router.patch('/users/:id/activate', (req, res) => {
  const users = loadUsers();
  const idx = users.findIndex(u => u.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  users[idx].status = 'active';
  fs.writeFileSync(path.join(__dirname, '../data/users.json'), JSON.stringify(users, null, 2));
  res.json({ success: true, data: users[idx] });
});

// PATCH /api/admin/users/:id/deactivate - deactivate user
router.patch('/users/:id/deactivate', (req, res) => {
  const users = loadUsers();
  const idx = users.findIndex(u => u.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  users[idx].status = 'inactive';
  fs.writeFileSync(path.join(__dirname, '../data/users.json'), JSON.stringify(users, null, 2));
  res.json({ success: true, data: users[idx] });
});

// GET /api/admin/users/:id/transactions - get all transactions for a user
router.get('/users/:id/transactions', (req, res) => {
  const transactions = loadTransactions();
  const userTx = transactions.filter(t => t.user && (t.user.id === req.params.id || t.user.userId === req.params.id));
  res.json({ success: true, data: userTx });
});

module.exports = router;