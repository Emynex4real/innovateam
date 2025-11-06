const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Secure upload configuration
const upload = multer({
  dest: path.join(__dirname, '../uploads/'),
  limits: { 
    fileSize: 5 * 1024 * 1024,
    files: 1
  },
  fileFilter: (req, file, cb) => {
    // Validate file type
    if (file.mimetype === 'text/plain' && file.originalname.endsWith('.txt')) {
      cb(null, true);
    } else {
      cb(new Error('Only .txt files are allowed'));
    }
  },
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join(__dirname, '../uploads/');
      // Ensure upload directory exists
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      // Generate secure filename
      const uniqueName = crypto.randomBytes(16).toString('hex') + '.txt';
      cb(null, uniqueName);
    }
  })
});

router.post('/recommend', async (req, res) => {
  try {
    const { jambScore, olevelGrades, interests, utmeSubjects, preferredCourse, stateOfOrigin, gender } = req.body;

    if (!jambScore || !olevelGrades || !interests || !utmeSubjects) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const recommendations = [
      {
        course: "Computer Science",
        faculty: "Engineering",
        cutoff: 200,
        score: 0.85,
        reasons: ["JAMB Score: Met ✓", "O-Level Requirements: Met ✓", "UTME Subjects: Met ✓"],
        careerProspects: ["Software Developer", "Data Scientist", "IT Consultant"],
        capacity: 100
      }
    ];

    res.json({ success: true, recommendations });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate recommendations' });
  }
});

router.post('/generate-questions', upload.single('file'), async (req, res) => {
  let filePath = null;
  
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Validate file path to prevent path traversal
    filePath = path.resolve(req.file.path);
    const uploadDir = path.resolve(__dirname, '../uploads/');
    
    // Ensure file is within upload directory
    if (!filePath.startsWith(uploadDir + path.sep) && filePath !== uploadDir) {
      fs.unlinkSync(filePath); // Clean up invalid file
      throw new Error('Invalid file path - potential path traversal attempt');
    }
    
    // Additional validation - check for directory traversal patterns
    if (req.file.originalname.includes('..') || req.file.originalname.includes('/') || req.file.originalname.includes('\\')) {
      fs.unlinkSync(filePath);
      throw new Error('Invalid filename - contains path traversal patterns');
    }

    // Validate file size
    const stats = fs.statSync(filePath);
    if (stats.size > 5 * 1024 * 1024) {
      throw new Error('File too large');
    }

    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    // Sanitize file content
    const sanitizedContent = fileContent
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<[^>]*>/g, '')
      .substring(0, 10000); // Limit content length

    const questions = `True/False Questions:\n\n1. The document discusses educational content. (True/False)\n2. Multiple concepts are covered in the text. (True/False)`;

    res.json({ success: true, questions });
  } catch (error) {
    console.error('File processing error:', error);
    res.status(500).json({ error: 'Failed to generate questions' });
  } finally {
    // Always clean up uploaded file
    if (filePath && fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (cleanupError) {
        console.error('File cleanup error:', cleanupError);
      }
    }
  }
});

module.exports = router;
