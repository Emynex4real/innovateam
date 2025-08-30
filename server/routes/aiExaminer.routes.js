const express = require('express');
const multer = require('multer');
const router = express.Router();
const aiExaminerController = require('../controllers/aiExaminer.controller');
const { requireAuth } = require('../middleware/supabaseAuth');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, TXT, DOC, and DOCX files are allowed.'));
    }
  }
});

// Apply authentication to all routes
router.use(requireAuth);

// Routes
router.post('/upload', upload.single('document'), aiExaminerController.uploadDocument);
router.post('/generate', aiExaminerController.generateQuestions);
router.post('/submit/:examId', aiExaminerController.submitAnswers);
router.get('/history', aiExaminerController.getExamHistory);
router.get('/results/:examId', aiExaminerController.getExamResults);

module.exports = router;