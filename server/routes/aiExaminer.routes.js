const express = require('express');
const router = express.Router();
const aiExaminerController = require('../controllers/aiExaminer.controller');
const { requireAuth } = require('../middleware/supabaseAuth');

// Apply authentication to all routes
router.use(requireAuth);

// Routes
router.post('/submit-text', aiExaminerController.submitText);
router.post('/generate', aiExaminerController.generateQuestions);
router.post('/submit/:examId', aiExaminerController.submitAnswers);
router.get('/history', aiExaminerController.getExamHistory);
router.get('/results/:examId', aiExaminerController.getExamResults);

module.exports = router;