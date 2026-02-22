const express = require('express');
const router = express.Router();
const proctoringController = require('../controllers/proctoring.controller');
const { authenticate } = require('../middleware/authenticate');

// Log proctoring session
router.post('/session', authenticate, proctoringController.logSession);

// End session
router.post('/session/end', authenticate, proctoringController.endSession);

// Get report for specific attempt (tutor)
router.get('/report/:attempt_id', authenticate, proctoringController.getReport);

// Get all reports for center (tutor)
router.get('/reports', authenticate, proctoringController.getCenterReports);

// Get student's own session data
router.get('/my-session/:attempt_id', authenticate, proctoringController.getMySession);

module.exports = router;
