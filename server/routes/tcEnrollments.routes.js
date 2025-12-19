const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authenticate');
const tcEnrollmentsController = require('../controllers/tcEnrollments.controller');

// All routes require authentication
router.use(authenticate);

// Student enrollment
router.post('/join', tcEnrollmentsController.joinCenter);
router.get('/my-centers', tcEnrollmentsController.getEnrolledCenters);

module.exports = router;
