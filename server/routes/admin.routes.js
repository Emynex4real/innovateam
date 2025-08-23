const express = require('express');
const router = express.Router();
const { requireAdmin } = require('../middleware/supabaseAuth');
const adminController = require('../controllers/admin.controller');
const { logger } = require('../utils/logger');

// Simple admin middleware
router.use(async (req, res, next) => {
  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) {
    return res.status(401).json({ success: false, error: 'No token provided' });
  }
  
  try {
    const supabase = require('../supabaseClient');
    const { data, error } = await supabase.auth.admin.getUser(token);
    
    if (error || !data.user) {
      return res.status(401).json({ success: false, error: 'Invalid token' });
    }
    
    const userRole = data.user.user_metadata?.role || 'user';
    
    if (userRole !== 'admin') {
      return res.status(403).json({ success: false, error: 'Admin access required' });
    }
    
    req.user = {
      id: data.user.id,
      email: data.user.email,
      role: userRole
    };
    next();
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Server error' });
  }
});

// GET /api/admin/stats
router.get('/stats', async (req, res) => {
  try {
    const supabase = require('../supabaseClient');
    
    const { data: authUsers, error } = await supabase.admin.auth.listUsers();
    if (error) {
      console.error('Stats error:', error);
      return res.status(500).json({ success: false, error: error.message });
    }
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const stats = {
      totalUsers: authUsers.users.length,
      activeUsers: authUsers.users.filter(u => 
        u.last_sign_in_at && new Date(u.last_sign_in_at) > thisWeek
      ).length,
      newUsersToday: authUsers.users.filter(u => 
        new Date(u.created_at) >= today
      ).length,
      adminUsers: authUsers.users.filter(u => 
        u.user_metadata?.role === 'admin'
      ).length
    };
    
    res.json({ success: true, stats });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/admin/users
router.get('/users', async (req, res) => {
  try {
    const supabase = require('../supabaseClient');
    
    // Use service role to get all users
    const { data: authData, error } = await supabase.admin.auth.listUsers();
    if (error) {
      console.error('List users error:', error);
      return res.status(500).json({ success: false, error: error.message });
    }
    
    const users = authData.users.map(user => ({
      id: user.id,
      email: user.email,
      name: user.user_metadata?.name || user.user_metadata?.full_name || 'N/A',
      role: user.user_metadata?.role || 'user',
      status: user.email_confirmed_at ? 'active' : 'pending',
      created_at: user.created_at,
      last_sign_in_at: user.last_sign_in_at,
      email_confirmed_at: user.email_confirmed_at
    }));
    
    res.json({
      success: true,
      users
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/admin/users/:id/role
router.post('/users/:id/role', async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const supabase = require('../supabaseClient');
    
    if (!['admin', 'user'].includes(role)) {
      return res.status(400).json({ success: false, error: 'Invalid role' });
    }
    
    const { error } = await supabase.admin.auth.updateUserById(id, {
      user_metadata: { role }
    });
    
    if (error) {
      console.error('Update role error:', error);
      return res.status(500).json({ success: false, error: error.message });
    }
    
    res.json({ success: true, message: `User role updated to ${role}` });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const supabase = require('../supabaseClient');
    
    const { error } = await supabase.admin.auth.deleteUser(id);
    if (error) {
      console.error('Delete user error:', error);
      return res.status(500).json({ success: false, error: error.message });
    }
    
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/admin/users/:id - Get user details
router.get('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const supabase = require('../supabaseClient');
    
    const { data, error } = await supabase.auth.admin.getUserById(id);
    if (error) throw error;
    
    const userDetails = {
      id: data.user.id,
      email: data.user.email,
      name: data.user.user_metadata?.name || 'N/A',
      phone: data.user.user_metadata?.phone_number || 'N/A',
      role: data.user.user_metadata?.role || 'user',
      status: data.user.email_confirmed_at ? 'active' : 'pending',
      created_at: data.user.created_at,
      updated_at: data.user.updated_at,
      last_sign_in_at: data.user.last_sign_in_at,
      email_confirmed_at: data.user.email_confirmed_at,
      is_admin: data.user.user_metadata?.role === 'admin',
      app_metadata: data.user.app_metadata,
      user_metadata: data.user.user_metadata
    };
    
    res.json({ success: true, data: userDetails });
  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/admin/system-info - System information
router.get('/system-info', (req, res) => {
  const systemInfo = {
    server: {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      pid: process.pid
    },
    environment: {
      nodeEnv: process.env.NODE_ENV,
      port: process.env.PORT,
      timestamp: new Date().toISOString()
    }
  };
  
  res.json({ success: true, data: systemInfo });
});

// Transaction routes
router.get('/transactions', adminController.getTransactions);
router.put('/transactions/:id', adminController.updateTransaction);
router.delete('/transactions/:id', adminController.deleteTransaction);

module.exports = router;