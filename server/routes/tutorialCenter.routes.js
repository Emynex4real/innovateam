const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authenticate');
const tutorialCenterController = require('../controllers/tutorialCenter.controller');

// All routes require authentication
router.use(authenticate);

// Tutorial center management
router.post('/', tutorialCenterController.createCenter);
router.get('/my-center', tutorialCenterController.getMyCenter);
router.put('/', tutorialCenterController.updateCenter);
router.get('/students', tutorialCenterController.getCenterStudents);

module.exports = router;
