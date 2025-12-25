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

// Enhanced student management
router.get('/students/:studentId/profile', tutorialCenterController.getStudentProfile);
router.get('/students/:studentId/test-history', tutorialCenterController.getStudentTestHistory);
router.get('/students/:studentId/analytics', tutorialCenterController.getStudentDetailedAnalytics);
router.get('/students/:studentId/progress', tutorialCenterController.getStudentProgress);
router.post('/students/:studentId/report', tutorialCenterController.generateStudentReport);
router.get('/students/:studentId/notes', tutorialCenterController.getStudentNotes);
router.post('/students/:studentId/notes', tutorialCenterController.addStudentNote);
router.get('/students/alerts/all', tutorialCenterController.getStudentAlerts);

// Analytics and gamification
router.get('/leaderboard/:testId', tutorialCenterController.getLeaderboard);
router.get('/analytics/:centerId', tutorialCenterController.getStudentAnalytics);
router.get('/advanced-analytics', tutorialCenterController.getAdvancedAnalytics);
router.get('/achievements', tutorialCenterController.getMyAchievements);
router.get('/achievements/all', tutorialCenterController.getAllAchievements);

module.exports = router;
