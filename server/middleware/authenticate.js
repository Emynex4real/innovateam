const supabase = require('../supabaseClient');

// Authentication middleware
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        code: 'NO_TOKEN'
      });
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token format',
        code: 'INVALID_TOKEN_FORMAT'
      });
    }

    const { data, error } = await supabase.auth.getUser(token);
    
    if (error || !data.user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token',
        code: 'INVALID_TOKEN'
      });
    }

    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('role, is_admin, is_tutor, is_student')
      .eq('id', data.user.id)
      .single();

    const userRole = userProfile?.role || 'user';

    req.user = {
      id: data.user.id,
      email: data.user.email,
      role: userRole,
      isAdmin: userProfile?.is_admin || userRole === 'admin',
      isTutor: userProfile?.is_tutor || userRole === 'tutor',
      isStudent: userProfile?.is_student || userRole === 'student',
      metadata: data.user.user_metadata
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      error: 'Authentication service error',
      code: 'AUTH_SERVICE_ERROR'
    });
  }
};

// Admin-only middleware
const requireAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        code: 'NO_TOKEN'
      });
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token format',
        code: 'INVALID_TOKEN_FORMAT'
      });
    }

    const { data, error } = await supabase.auth.getUser(token);
    
    if (error || !data.user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token',
        code: 'INVALID_TOKEN'
      });
    }

    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('role, is_admin, is_tutor, is_student')
      .eq('id', data.user.id)
      .single();

    const userRole = userProfile?.role || 'user';
    const isAdmin = userProfile?.is_admin || userRole === 'admin';

    req.user = {
      id: data.user.id,
      email: data.user.email,
      role: userRole,
      isAdmin,
      isTutor: userProfile?.is_tutor || userRole === 'tutor',
      isStudent: userProfile?.is_student || userRole === 'student',
      metadata: data.user.user_metadata
    };

    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Admin access required',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }
    
    next();
  } catch (error) {
    console.error('Admin authentication error:', error);
    return res.status(500).json({
      success: false,
      error: 'Authentication service error',
      code: 'AUTH_SERVICE_ERROR'
    });
  }
};

// Optional authentication
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      req.user = null;
      return next();
    }

    const { data, error } = await supabase.auth.getUser(token);
    
    if (error || !data.user) {
      req.user = null;
      return next();
    }

    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('role, is_admin, is_tutor, is_student')
      .eq('id', data.user.id)
      .single();

    const userRole = userProfile?.role || 'user';

    req.user = {
      id: data.user.id,
      email: data.user.email,
      role: userRole,
      isAdmin: userProfile?.is_admin || userRole === 'admin',
      isTutor: userProfile?.is_tutor || userRole === 'tutor',
      isStudent: userProfile?.is_student || userRole === 'student',
      metadata: data.user.user_metadata
    };

    next();
  } catch (error) {
    console.error('Optional auth error:', error);
    req.user = null;
    next();
  }
};

module.exports = {
  authenticate,
  requireAdmin,
  optionalAuth
};
