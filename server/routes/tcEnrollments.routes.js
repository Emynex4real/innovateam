const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authenticate');
const { checkEnrollmentLimit } = require('../middleware/subscriptionLimits');
const tcEnrollmentsController = require('../controllers/tcEnrollments.controller');

// All routes require authentication
router.use(authenticate);

// Student enrollment (checks tutor's plan capacity before allowing)
router.post('/join', checkEnrollmentLimit(), tcEnrollmentsController.joinCenter);
router.get('/my-centers', tcEnrollmentsController.getEnrolledCenters);

module.exports = router;
