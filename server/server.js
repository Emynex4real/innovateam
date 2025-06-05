const express = require('express');
const cors = require('cors');
const multer = require('multer');
const axios = require('axios');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// In-memory user storage (replace with database in production)
const users = [];

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
    // Allow PDF, JPEG, and PNG files
    if (file.mimetype === 'application/pdf' || 
        file.mimetype === 'image/jpeg' || 
        file.mimetype === 'image/png') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, JPEG, and PNG files are allowed'));
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

// Authentication endpoints
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, phoneNumber, password } = req.body;

    // Validate input
    if (!name || !email || !phoneNumber || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user already exists
    if (users.find(user => user.email === email)) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = {
      id: users.length + 1,
      name,
      email,
      phoneNumber,
      password: hashedPassword
    };

    users.push(user);

    // Generate tokens
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });
    const refreshToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    // Return user data (excluding password)
    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json({
      user: userWithoutPassword,
      token,
      refreshToken
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Error creating user' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate tokens
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });
    const refreshToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    // Return user data (excluding password)
    const { password: _, ...userWithoutPassword } = user;
    res.json({
      user: userWithoutPassword,
      token,
      refreshToken
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in' });
  }
});

// Add logout endpoint
app.post('/api/auth/logout', (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    // In a real application, you would:
    // 1. Validate the refresh token
    // 2. Add it to a blacklist
    // 3. Clear any server-side session data
    
    // For now, we'll just return a success response
    res.json({ 
      success: true, 
      message: 'Logged out successfully' 
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error logging out' 
    });
  }
});

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

// O-Level upload endpoint
app.post('/api/olevel/upload', upload.fields([
  { name: 'oLevelFile', maxCount: 1 },
  { name: 'secondSittingFile', maxCount: 1 }
]), async (req, res) => {
  try {
    const { fullname, jambRegNo, profileCode, courses, additionalInfo } = req.body;
    const files = req.files;

    // Validate required fields
    if (!fullname || !courses) {
      return res.status(400).json({
        success: false,
        message: 'Full name and courses are required'
      });
    }

    // Parse courses from JSON string
    const parsedCourses = JSON.parse(courses);

    // Validate courses data
    if (!Array.isArray(parsedCourses) || parsedCourses.length !== 9) {
      return res.status(400).json({
        success: false,
        message: 'Invalid courses data'
      });
    }

    // Create entry object
    const entry = {
      id: Date.now().toString(),
      fullname,
      jambRegNo: jambRegNo || null,
      profileCode: profileCode || `PROFESS-${Math.floor(Math.random() * 90000)}`,
      courses: parsedCourses,
      additionalInfo: additionalInfo || '',
      files: {
        oLevelFile: files?.oLevelFile?.[0]?.filename || null,
        secondSittingFile: files?.secondSittingFile?.[0]?.filename || null
      },
      status: 'Pending',
      submissionDate: new Date().toISOString()
    };

    // In a real application, you would save this to a database
    // For now, we'll just return success
    res.json({
      success: true,
      message: 'O-Level entry submitted successfully',
      entryId: entry.id,
      profileCode: entry.profileCode
    });
  } catch (error) {
    console.error('O-Level upload error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error processing O-Level entry'
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