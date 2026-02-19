const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authenticate');
const { checkCenterSuspension } = require('../middleware/checkSuspension');
const { checkLimit } = require('../middleware/subscriptionLimits');
const tutorialCenterController = require('../controllers/tutorialCenter.controller');
const { questionValidation, questionSetValidation, paginationValidation, uuidValidation } = require('../middleware/validation');
const { writeLimiter } = require('../middleware/rateLimiter');

// All routes require authentication
router.use(authenticate);

// Tutorial center management (check suspension for write operations)
router.post('/', tutorialCenterController.createCenter);
router.get('/my-center', tutorialCenterController.getMyCenter);
router.put('/', checkCenterSuspension, tutorialCenterController.updateCenter);
router.delete('/', checkCenterSuspension, tutorialCenterController.deleteCenter);
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

// Questions management (block if suspended or limit exceeded)
router.post('/tc-questions', checkCenterSuspension, checkLimit('questions'), writeLimiter, questionValidation, tutorialCenterController.createQuestion);
router.get('/tc-questions', paginationValidation, tutorialCenterController.getQuestions);
router.put('/tc-questions/:id', checkCenterSuspension, writeLimiter, uuidValidation('id'), questionValidation, tutorialCenterController.updateQuestion);
router.delete('/tc-questions/:id', checkCenterSuspension, writeLimiter, uuidValidation('id'), tutorialCenterController.deleteQuestion);
router.post('/tc-questions/generate-ai', checkCenterSuspension, checkLimit('questions', (req) => req.body.questions?.length || 10), writeLimiter, tutorialCenterController.generateQuestionsAI);
router.post('/tc-questions/generate-ai-stream', checkCenterSuspension, checkLimit('questions', (req) => req.body.count || 10), writeLimiter, tutorialCenterController.generateQuestionsAIStream);
router.post('/tc-questions/parse-bulk', checkCenterSuspension, writeLimiter, tutorialCenterController.parseBulkQuestions);
router.post('/tc-questions/save-bulk', checkCenterSuspension, checkLimit('questions', (req) => req.body.questions?.length || 0), writeLimiter, tutorialCenterController.saveBulkQuestions);

// Question sets (tests) management (block if suspended or limit exceeded)
router.post('/tc-question-sets', checkCenterSuspension, checkLimit('tests'), writeLimiter, questionSetValidation, tutorialCenterController.createQuestionSet);
router.get('/tc-question-sets', paginationValidation, tutorialCenterController.getQuestionSets);
router.get('/tc-question-sets/:id', uuidValidation('id'), tutorialCenterController.getQuestionSet);
router.put('/tc-question-sets/:id', checkCenterSuspension, writeLimiter, uuidValidation('id'), questionSetValidation, tutorialCenterController.updateQuestionSet);
router.put('/tc-question-sets/:id/toggle-answers', checkCenterSuspension, writeLimiter, uuidValidation('id'), tutorialCenterController.toggleAnswers);
router.delete('/tc-question-sets/:id', checkCenterSuspension, writeLimiter, uuidValidation('id'), tutorialCenterController.deleteQuestionSet);

// Question set questions management (block if suspended)
router.post('/tc-question-sets/:id/questions', checkCenterSuspension, writeLimiter, uuidValidation('id'), tutorialCenterController.addQuestionsToTest);
router.delete('/tc-question-sets/:testId/questions/:questionId', checkCenterSuspension, writeLimiter, tutorialCenterController.removeQuestionFromTest);
router.get('/tc-question-sets/:id/questions', uuidValidation('id'), tutorialCenterController.getTestQuestions);

// Attempts
router.get('/tc-attempts/center-attempts', tutorialCenterController.getCenterAttempts);
router.get('/students/:studentId/attempts', tutorialCenterController.getStudentAttempts);
router.get('/tests/:testId/check-access', tutorialCenterController.checkTestAccess);

// Adaptive Learning
const adaptiveLearning = require('../services/adaptiveLearning.service');
router.get('/tests/:question_set_id/access', adaptiveLearning.checkTestAccess);
router.get('/mastery', adaptiveLearning.getStudentMastery);

// Test route to verify routing works
router.post('/remedial/test', (req, res) => {
  res.json({ success: true, message: 'Route is working!' });
});

router.post('/remedial/generate', (req, res, next) => {
  console.log('🎯 Remedial generate route hit!');
  adaptiveLearning.generateRemedialTest(req, res, next);
});

// Gamification
const gamification = require('../services/gamification.service');
router.get('/streak/:centerId', gamification.getMyStreak);
router.get('/league/:centerId', gamification.getMyLeague);

// White Label
router.put('/theme', tutorialCenterController.updateTheme);

module.exports = router;
