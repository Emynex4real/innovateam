const express = require('express');
const cors = require('cors');
const multer = require('multer');
const axios = require('axios');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Configure DeepSeek API client
const deepseekApi = axios.create({
  baseURL: 'https://api.deepseek.com/v1',
  headers: {
    'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
    'Content-Type': 'application/json'
  }
});

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/plain') {
      cb(null, true);
    } else {
      cb(new Error('Only .txt files are allowed'));
    }
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Rate limiting middleware
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10 // 10 requests per minute
});
app.use(limiter);

// Course recommendation endpoint
app.post('/recommend', async (req, res) => {
  try {
    const { waecGrades, jambScore, interests } = req.body;

    // Validate inputs
    if (!waecGrades || !jambScore || jambScore < 0 || jambScore > 400) {
      return res.status(400).json({ error: 'Invalid input data' });
    }

    const response = await deepseekApi.post('/chat/completions', {
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: `You are a knowledgeable Nigerian university course advisor. Your role is to recommend suitable courses based on students' WAEC grades, JAMB scores, and interests. Be concise and specific in your recommendations.`
        },
        {
          role: 'user',
          content: `Please recommend 2-3 suitable university courses based on these qualifications:
          
WAEC Grades:
${Object.entries(waecGrades).map(([subject, grade]) => `- ${subject}: ${grade}`).join('\n')}

JAMB Score: ${jambScore}

Interests: ${interests}

Provide your recommendations in a clear, bullet-point format. Consider both the academic requirements and the student's interests.`
        }
      ],
      max_tokens: 150,
      temperature: 0.7
    });

    res.json({ recommendations: response.data.choices[0].message.content });
  } catch (error) {
    console.error('Recommendation Error:', error.response?.data || error);
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.error?.message || error.message || 'Error generating recommendations'
    });
  }
});

// Question generation endpoint
app.post('/generate-questions', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Read the uploaded file
    const fileContent = fs.readFileSync(req.file.path, 'utf8');

    const response = await deepseekApi.post('/chat/completions', {
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: 'You are an educational content generator that creates true/false questions from text content. Create questions that test understanding of key concepts. Make false statements plausible but incorrect.'
        },
        {
          role: 'user',
          content: `Generate 5-10 true/false questions based on this text. Format each question as "True/False: [Statement]". Make approximately half true and half false.

Text content:
${fileContent}`
        }
      ],
      max_tokens: 500,
      temperature: 0.7
    });

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    res.json({ questions: response.data.choices[0].message.content });
  } catch (error) {
    console.error('Question Generation Error:', error.response?.data || error);
    // Clean up uploaded file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.error?.message || error.message || 'Error generating questions'
    });
  }
});

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 