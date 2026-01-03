const express = require('express');
const { body } = require('express-validator');
const { validateRequest } = require('../middleware/validateRequest');
const { authenticate } = require('../middleware/authenticate');
const { authLimiter, ipLimiter, apiLimiter } = require('../middleware/advancedRateLimiter');
const router = express.Router();
const supabase = require('../supabaseClient');

// Validation middleware
const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('phoneNumber').trim().notEmpty().withMessage('Phone number is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  body('confirmPassword')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Passwords do not match'),
  validateRequest,
];

const loginValidation = [
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
  validateRequest,
];

// Helper function to log detailed error information
const logError = (error, context = {}) => {
  const errorInfo = {
    timestamp: new Date().toISOString(),
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
      ...(error.code && { code: error.code }),
      ...(error.status && { status: error.status }),
      ...(error.details && { details: error.details })
    },
    context
  };
  console.error('❌ ERROR DETAILS:', JSON.stringify(errorInfo, null, 2));
  return errorInfo;
};

// Register route - Apply IP and auth rate limiting
router.post('/register', ipLimiter, authLimiter, registerValidation, async (req, res, next) => {
  const { email, password, name, phoneNumber, confirmPassword } = req.body;
  const requestId = Math.random().toString(36).substring(2, 10);
  console.log(`\n🔔 [${requestId}] ===== REGISTRATION ATTEMPT =====`);
  console.log(`📝 [${requestId}] Request details:`, { 
    email, 
    name, 
    phoneNumber, 
    ip: req.ip, 
    userAgent: req.get('user-agent') 
  });

  try {
    // Skip user existence check for now due to connectivity issues
    console.log(`🔍 [${requestId}] Skipping user existence check...`);

    // Create auth user
    console.log(`🚀 [${requestId}] Creating auth user in Supabase Auth...`);
    const signUpPayload = { 
      email, 
      password,
      options: {
        data: { name, phone_number: phoneNumber },
        emailRedirectTo: process.env.SITE_URL || 'http://localhost:3000/auth/confirm'
      }
    };
    
    // For development, try to auto-confirm the user
    if (process.env.NODE_ENV === 'development') {
      try {
        // Use admin client to create user without email confirmation
        const { data: adminData, error: adminError } = await supabase.auth.admin.createUser({
          email,
          password,
          user_metadata: { name, phone_number: phoneNumber },
          email_confirm: true // Auto-confirm email
        });
        
        if (!adminError && adminData.user) {
          console.log(`✅ [${requestId}] User created and auto-confirmed via admin API`);
          // Sign in the user to get session tokens
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
          if (!signInError && signInData.session) {
            return res.json({
              success: true,
              user: { id: adminData.user.id, email, name, phoneNumber },
              token: signInData.session.access_token,
              refreshToken: signInData.session.refresh_token,
              requestId
            });
          }
        }
      } catch (adminError) {
        console.log(`⚠️ [${requestId}] Admin user creation failed, falling back to regular signup:`, adminError.message);
      }
    }
    const { data, error } = await supabase.auth.signUp(signUpPayload);
    if (error) {
      const errorInfo = logError(error, { requestId, email, operation: 'auth.signUp' });
      if (error.message.toLowerCase().includes('already registered') || 
          error.message.toLowerCase().includes('already in use')) {
        return res.status(400).json({
          success: false,
          error: 'Email already registered',
          code: 'EMAIL_ALREADY_EXISTS',
          requestId
        });
      }
      return res.status(400).json({
        success: false,
        error: 'Authentication failed',
        code: 'AUTH_ERROR',
        requestId,
        debug: process.env.NODE_ENV === 'development' ? errorInfo : undefined
      });
    }

    console.log(`✅ [${requestId}] Auth user created:`, { userId: data.user?.id, email });
    if (data.user) {
      if (data.session) {
        return res.json({
          success: true,
          user: { id: data.user.id, email, name, phoneNumber: data.user.user_metadata.phone_number },
          token: data.session.access_token,
          refreshToken: data.session.refresh_token,
          requestId
        });
      } else {
        return res.json({
          success: true,
          info: 'Registration successful! Please check your email to confirm your account.',
          requiresConfirmation: true,
          requestId
        });
      }
    }

    const errorInfo = logError(new Error('No user data returned'), { requestId, email, operation: 'auth.signUp' });
    return res.status(500).json({
      success: false,
      error: 'Registration failed',
      code: 'REGISTRATION_FAILED',
      requestId,
      debug: process.env.NODE_ENV === 'development' ? errorInfo : undefined
    });
  } catch (error) {
    const errorInfo = logError(error, { requestId, email, operation: 'register' });
    return res.status(500).json({
      success: false,
      error: 'Server error',
      code: 'SERVER_ERROR',
      requestId,
      debug: process.env.NODE_ENV === 'development' ? errorInfo : undefined
    });
  }
});

// Keep existing login, logout, validate, refresh-token, and profile routes
router.post('/login', ipLimiter, authLimiter, loginValidation, async (req, res) => {
  const { email, password } = req.body;
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      return res.status(401).json({ success: false, error: error.message });
    }
    
    // Get user role from metadata
    const userRole = data.user.user_metadata?.role || 'user';
    const isAdmin = userRole === 'admin';
    
    const userResponse = {
      id: data.user.id,
      email: data.user.email,
      name: data.user.user_metadata?.name,
      phoneNumber: data.user.user_metadata?.phone_number,
      role: userRole,
      isAdmin
    };
    
    res.json({ 
      success: true, 
      user: userResponse, 
      token: data.session.access_token, 
      refreshToken: data.session.refresh_token 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.post('/logout', async (req, res) => {
  try {
    await supabase.auth.signOut();
    res.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.get('/validate', apiLimiter, async (req, res) => {
  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) {
    return res.status(401).json({ success: false, error: 'No token provided' });
  }
  try {
    const { data, error } = await supabase.auth.getUser(token);
    if (error) {
      return res.status(401).json({ success: false, error: error.message });
    }
    
    const userRole = data.user.user_metadata?.role || 'user';
    const userResponse = {
      id: data.user.id,
      email: data.user.email,
      name: data.user.user_metadata?.name,
      phoneNumber: data.user.user_metadata?.phone_number,
      role: userRole,
      isAdmin: userRole === 'admin',
      user_metadata: data.user.user_metadata // Include full user_metadata
    };
    
    res.json({ success: true, valid: true, user: userResponse });
  } catch (error) {
    console.error('Validate token error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.post('/refresh-token', authLimiter, async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ success: false, error: 'No refresh token provided' });
  }
  try {
    const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken });
    if (error) {
      return res.status(401).json({ success: false, error: error.message });
    }
    res.json({ success: true, token: data.session.access_token, refreshToken: data.session.refresh_token, user: data.user });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.get('/api/profile/me', authenticate, async (req, res) => {
  try {
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.user.id)
      .single();
    if (profileError || !profile) {
      return res.status(404).json({ success: false, error: 'Profile not found' });
    }
    res.json({ success: true, profile });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.post('/api/profile', authenticate, async (req, res) => {
  const { name, phone_number } = req.body;
  try {
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .insert([{ id: req.user.id, email: req.user.email, name, phone_number, role: 'user', status: 'active' }])
      .select()
      .single();
    if (profileError) {
      return res.status(400).json({ success: false, error: profileError.message });
    }
    res.json({ success: true, profile });
  } catch (error) {
    console.error('Create profile error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;