const express = require('express');
const router = express.Router();
const { requireAdmin } = require('../middleware/authenticate');
const aiQuestionsController = require('../controllers/aiQuestions.controller');

// All routes require admin authentication
router.use(requireAdmin);

// Generate questions from text
router.post('/generate', aiQuestionsController.generateQuestions);

// Question banks
router.get('/banks', aiQuestionsController.getQuestionBanks);
router.delete('/banks/:id', aiQuestionsController.deleteQuestionBank);

// Questions
router.get('/banks/:bankId/questions', aiQuestionsController.getQuestionsByBank);
router.put('/questions/:id', aiQuestionsController.updateQuestion);
router.delete('/questions/:id', aiQuestionsController.deleteQuestion);
router.post('/questions/bulk-delete', aiQuestionsController.bulkDeleteQuestions);
router.patch('/questions/:id/toggle', aiQuestionsController.toggleQuestionStatus);

// Statistics
router.get('/stats', aiQuestionsController.getQuestionStats);

module.exports = router;
