const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');

const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/plain') {
      cb(null, true);
    } else {
      cb(new Error('Only .txt files are allowed'));
    }
  }
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
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileContent = fs.readFileSync(req.file.path, 'utf8');
    fs.unlinkSync(req.file.path);

    const questions = `True/False Questions:\n\n1. The document discusses educational content. (True/False)\n2. Multiple concepts are covered in the text. (True/False)`;

    res.json({ success: true, questions });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: 'Failed to generate questions' });
  }
});

module.exports = router;
