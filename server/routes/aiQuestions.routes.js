const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/authenticate');
const aiQuestionsController = require('../controllers/aiQuestions.controller');
const { aiLimiter, adminLimiter, sensitiveOpLimiter } = require('../middleware/advancedRateLimiter');

// All routes require admin authentication
router.use(authenticate);
router.use(requireAdmin);

// Generate questions from text - STRICT rate limit (cost control)
router.post('/generate', aiLimiter, aiQuestionsController.generateQuestions);

// Question banks
router.get('/banks', adminLimiter, aiQuestionsController.getQuestionBanks);
router.delete('/banks/:id', sensitiveOpLimiter, aiQuestionsController.deleteQuestionBank);

// Questions
router.get('/banks/:bankId/questions', adminLimiter, aiQuestionsController.getQuestionsByBank);
router.put('/questions/:id', adminLimiter, aiQuestionsController.updateQuestion);
router.delete('/questions/:id', sensitiveOpLimiter, aiQuestionsController.deleteQuestion);
router.post('/questions/bulk-delete', sensitiveOpLimiter, aiQuestionsController.bulkDeleteQuestions);
router.patch('/questions/:id/toggle', adminLimiter, aiQuestionsController.toggleQuestionStatus);

// Statistics
router.get('/stats', adminLimiter, aiQuestionsController.getQuestionStats);

module.exports = router;
