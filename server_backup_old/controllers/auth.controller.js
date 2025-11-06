const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');
const { logger } = require('../utils/logger');
const supabase = require('../supabaseClient');

// Function to generate tokens
const generateTokens = (user) => {
  // Ensure we have a complete user object
  const userWithDefaults = {
    id: user.id,
    email: user.email,
    role: user.role || 'user',
    ...user
  };

  // Include all necessary user data in the token payload
  const tokenPayload = { 
    userId: userWithDefaults.id,  // Use userId for consistency
    id: userWithDefaults.id,      // Keep id for backward compatibility
    email: userWithDefaults.email,
    role: userWithDefaults.role,
    isAdmin: userWithDefaults.role === 'admin'
  };

  const token = jwt.sign(
    tokenPayload,
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '1h' }
  );

  const refreshToken = jwt.sign(
    tokenPayload,
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '7d' }
  );

  return { 
    token, 
    refreshToken,
    user: tokenPayload  // Include the complete user data in the response
  };
};

exports.register = async (req, res) => {
  try {
    const { name, email, phoneNumber, password } = req.body;

    // Validate input
    if (!name || !email || !phoneNumber || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Create user in Supabase Auth
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      logger.error('Error creating user:', error);
      return res.status(500).json({
        success: false,
        message: 'Error creating user'
      });
    }

    // Create user profile in users table
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .insert([
        {
          id: data.user.id,
          name,
          email,
          phoneNumber,
        },
      ])
      .single();
    if (profileError) {
      logger.error('Error creating user profile:', profileError);
      return res.status(500).json({
        success: false,
        message: 'Error creating user profile'
      });
    }

    // Generate tokens
    const { token, refreshToken } = generateTokens(profile);

    res.status(201).json({
      success: true,
      user: profile,
      token,
      refreshToken
    });
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating user'
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    logger.info('🔐 Login attempt (Supabase)', { email });

    // Authenticate with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) {
      logger.warn('❌ Login failed: Invalid credentials', { email, error: error?.message });
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Try to fetch user profile from users table, create if doesn't exist
    let profile;
    const { data: existingProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();
    
    if (profileError || !existingProfile) {
      // Create profile if it doesn't exist
      const { data: newProfile, error: createError } = await supabase
        .from('users')
        .insert([
          {
            id: data.user.id,
            email: data.user.email,
            name: data.user.user_metadata?.name || data.user.email.split('@')[0],
            role: data.user.user_metadata?.role || 'user'
          }
        ])
        .select()
        .single();
      
      if (createError) {
        logger.warn('❌ Failed to create user profile', { email, error: createError.message });
        // Use auth user data as fallback
        profile = {
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.name || data.user.email.split('@')[0],
          role: data.user.user_metadata?.role || 'user'
        };
      } else {
        profile = newProfile;
      }
    } else {
      profile = existingProfile;
    }

    res.json({
      success: true,
      user: {
        ...profile,
        id: profile.id,
        email: profile.email,
        role: profile.role || 'user',
        isAdmin: profile.role === 'admin',
        user_metadata: { role: profile.role || 'user' }
      },
      token: data.session?.access_token,
      refreshToken: data.session?.refresh_token,
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Error logging in'
    });
  }
};

exports.logout = async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging out'
    });
  }
};

exports.validateToken = async (req, res) => {
  try {
    // Log incoming headers for debugging
    console.log('[validateToken] Incoming headers:', req.headers);
    res.set('Cache-Control', 'no-store');
    res.set('ETag', '');

    // Get token from Authorization header
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        valid: false,
        message: 'No token provided'
      });
    }
    const token = authHeader.replace('Bearer ', '');

    // Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({
        success: false,
        valid: false,
        message: 'Invalid or expired token'
      });
    }

    // Fetch user profile from users table
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();
    if (profileError || !profile) {
      return res.status(404).json({
        success: false,
        valid: false,
        message: 'User profile not found'
      });
    }

    res.json({
      success: true,
      valid: true,
      userId: user.id,
      userEmail: user.email,
      userRole: profile.role,
      isAdmin: profile.role === 'admin',
      user: profile
    });
  } catch (error) {
    logger.error('Token validation error:', error);
    res.status(500).json({
      success: false,
      valid: false
    });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required'
      });
    }
    // Supabase does not support refresh via backend SDK, must be handled client-side.
    // Optionally return error or instructions.
    return res.status(400).json({
      success: false,
      message: 'Token refresh must be handled via Supabase client SDK on the frontend.'
    });
  } catch (error) {
    logger.error('Token refresh error:', error);
    res.status(500).json({
      success: false,
      message: 'Error refreshing token'
    });
  }
};

module.exports = {
  register: exports.register,
  login: exports.login,
  logout: exports.logout,
  validateToken: exports.validateToken,
  refreshToken: exports.refreshToken
};