const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authenticate');
const tcQuestionsController = require('../controllers/tcQuestions.controller');

// All routes require authentication
router.use(authenticate);

// Question management
router.post('/', tcQuestionsController.createQuestion);
router.post('/generate-ai', tcQuestionsController.generateQuestions);
router.post('/parse-bulk', tcQuestionsController.parseBulkQuestions);
router.post('/save-bulk', tcQuestionsController.saveBulkQuestions);
router.get('/', tcQuestionsController.getQuestions);
router.put('/:id', tcQuestionsController.updateQuestion);
router.delete('/:id', tcQuestionsController.deleteQuestion);

module.exports = router;
