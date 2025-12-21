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

// Analytics and gamification
router.get('/leaderboard/:testId', tutorialCenterController.getLeaderboard);
router.get('/analytics/:centerId', tutorialCenterController.getStudentAnalytics);
router.get('/achievements', tutorialCenterController.getMyAchievements);
router.get('/achievements/all', tutorialCenterController.getAllAchievements);

module.exports = router;
