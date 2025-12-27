const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authenticate');
const tutorialCenterController = require('../controllers/tutorialCenter.controller');
const { questionValidation, questionSetValidation, paginationValidation, uuidValidation } = require('../middleware/validation');
const { writeLimiter } = require('../middleware/rateLimiter');

// All routes require authentication
router.use(authenticate);

// Tutorial center management
router.post('/', tutorialCenterController.createCenter);
router.get('/my-center', tutorialCenterController.getMyCenter);
router.put('/', tutorialCenterController.updateCenter);
router.delete('/', tutorialCenterController.deleteCenter);
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

// Questions management
router.post('/tc-questions', writeLimiter, questionValidation, tutorialCenterController.createQuestion);
router.get('/tc-questions', paginationValidation, tutorialCenterController.getQuestions);
router.put('/tc-questions/:id', writeLimiter, uuidValidation('id'), questionValidation, tutorialCenterController.updateQuestion);
router.delete('/tc-questions/:id', writeLimiter, uuidValidation('id'), tutorialCenterController.deleteQuestion);
router.post('/tc-questions/generate-ai', writeLimiter, tutorialCenterController.generateQuestionsAI);
router.post('/tc-questions/parse-bulk', writeLimiter, tutorialCenterController.parseBulkQuestions);
router.post('/tc-questions/save-bulk', writeLimiter, tutorialCenterController.saveBulkQuestions);

// Question sets (tests) management
router.post('/tc-question-sets', writeLimiter, questionSetValidation, tutorialCenterController.createQuestionSet);
router.get('/tc-question-sets', paginationValidation, tutorialCenterController.getQuestionSets);
router.get('/tc-question-sets/:id', uuidValidation('id'), tutorialCenterController.getQuestionSet);
router.put('/tc-question-sets/:id', writeLimiter, uuidValidation('id'), questionSetValidation, tutorialCenterController.updateQuestionSet);
router.put('/tc-question-sets/:id/toggle-answers', writeLimiter, uuidValidation('id'), tutorialCenterController.toggleAnswers);
router.delete('/tc-question-sets/:id', writeLimiter, uuidValidation('id'), tutorialCenterController.deleteQuestionSet);

// Attempts
router.get('/tc-attempts/center-attempts', tutorialCenterController.getCenterAttempts);

module.exports = router;
