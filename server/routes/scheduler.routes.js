const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authenticate');
const schedulerController = require('../controllers/scheduler.controller');

// Manual trigger (admin only - add admin check if needed)
router.post('/run', authenticate, schedulerController.runScheduler);

// Get scheduler status
router.get('/status', authenticate, schedulerController.getSchedulerStatus);

module.exports = router;
