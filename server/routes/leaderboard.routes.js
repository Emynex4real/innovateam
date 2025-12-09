const express = require('express');
const router = express.Router();
const leaderboardController = require('../controllers/leaderboard.controller');
const { authenticate } = require('../middleware/authenticate');

// FIX: Import 'requireAdmin' instead of 'isAdmin'
const { requireAdmin } = require('../middleware/supabaseAuth');


// Public routes
router.get('/', leaderboardController.getLeaderboard);

// Admin routes
// FIX: Use 'requireAdmin' in the routes below
router.get('/analytics', authenticate, requireAdmin, leaderboardController.getLeaderboardAnalytics);
router.get('/users-performance', authenticate, requireAdmin, leaderboardController.getUsersPerformance);
router.get('/top-performers', authenticate, requireAdmin, leaderboardController.getTopPerformers);
router.get('/history', authenticate, requireAdmin, leaderboardController.getLeaderboardHistory);
router.post('/snapshot', authenticate, requireAdmin, leaderboardController.createSnapshot);
router.post('/award-top', authenticate, requireAdmin, leaderboardController.awardTopPerformers);
router.post('/reward-user', authenticate, requireAdmin, leaderboardController.rewardUser);
router.post('/bulk-award', authenticate, requireAdmin, leaderboardController.bulkAwardUsers);
router.get('/user-rewards/:userId', authenticate, requireAdmin, leaderboardController.getUserRewards);

module.exports = router;