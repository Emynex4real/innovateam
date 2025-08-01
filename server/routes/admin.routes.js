const express = require('express');
const router = express.Router();
const { requireAdmin } = require('../middleware/supabaseAuth');
const adminController = require('../controllers/admin.controller');
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

// Apply Supabase Auth and admin role check to all admin routes
router.use(requireAdmin);


// GET /api/admin/stats (dashboard metrics, Supabase only)
router.get('/stats', async (req, res) => {
  try {
    // Fetch users and transactions from Supabase
    const { data: users, error: usersError } = await require('../supabaseClient')
      .from('users')
      .select('*')
      .is('deleted_at', null);
    const { data: transactions, error: txError } = await require('../supabaseClient')
      .from('transactions')
      .select('*')
      .is('deleted_at', null);
    if (usersError) throw usersError;
    if (txError) throw txError;

    const totalUsers = users.length;
    const totalTransactions = transactions.length;
    const revenue = transactions.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    const recentUsers = [...users].slice(-5).reverse();
    const recentTransactions = [...transactions].slice(-5).reverse();
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
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/admin/users (MongoDB)
router.get('/users', adminController.getUsers);

// GET /api/admin/transactions (MongoDB)
router.get('/transactions', adminController.getTransactions);

// GET /api/services
router.get('/services', (req, res) => {
  res.json({
    services: [
      { id: 1, name: 'Service A', type: 'type1', price: 50, status: 'active' },
      { id: 2, name: 'Service B', type: 'type2', price: 100, status: 'active' }
    ]
  });
});

// GET /api/admin/users/:id - get user details (Supabase)
router.get('/users/:id', require('../controllers/admin.controller').getUserById);

// DELETE /api/admin/users/:id (MongoDB)
router.delete('/users/:id', adminController.deleteUser);

// PATCH /api/admin/users/:id/activate - activate user (MongoDB)
router.patch('/users/:id/activate', adminController.activateUser);

// PATCH /api/admin/users/:id/deactivate - deactivate user (MongoDB)
router.patch('/users/:id/deactivate', adminController.deactivateUser);

// GET /api/admin/users/:id/transactions - get all transactions for a user (Supabase)
router.get('/users/:id/transactions', require('../controllers/admin.controller').getUserTransactions);

module.exports = router;