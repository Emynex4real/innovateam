const express = require('express');
const router = express.Router();
const apiCostController = require('../controllers/apiCost.controller');
const { authenticate } = require('../middleware/authenticate');

// All routes require authentication
router.use(authenticate);

// Admin-only middleware (add this if you have role-based access)
const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }
  next();
};

// Cost monitoring routes (admin only)
router.get('/daily-analysis', requireAdmin, apiCostController.getDailyCostAnalysis);
router.get('/user-summary', requireAdmin, apiCostController.getUserCostSummary);
router.get('/usage-stats', requireAdmin, apiCostController.getUsageStats);

module.exports = router;
