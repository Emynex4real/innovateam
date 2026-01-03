const express = require('express');
const router = express.Router();
const aiExaminerController = require('../controllers/aiExaminer.controller');
const { authenticate } = require('../middleware/authenticate');
const multer = require('multer');

// Configure upload (10MB limit)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } 
});

// Protect all routes
router.use(authenticate);

// 1. File Upload Route
router.post('/upload', upload.single('file'), (req, res) => aiExaminerController.uploadDocument(req, res));

// 2. Text Paste Route (THIS WAS MISSING BEFORE)
router.post('/submit-text', (req, res) => aiExaminerController.submitText(req, res));

// 3. Generation & Grading Routes
router.post('/generate', (req, res) => aiExaminerController.generateQuestions(req, res));
router.post('/submit/:examId', (req, res) => aiExaminerController.submitAnswers(req, res));
router.get('/history', (req, res) => aiExaminerController.getExamHistory(req, res));
router.get('/results/:examId', (req, res) => aiExaminerController.getExamResults(req, res));

module.exports = router;