const supabase = require('../supabaseClient');

const withTimeout = (promise, ms = 3000) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), ms))
  ]);
};

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ Auth failed: No token or invalid format');
      return res.status(401).json({ success: false, error: 'No token', code: 'NO_TOKEN' });
    }

    const token = authHeader.split(' ')[1];
    
    if (!token || token === 'null' || token === 'undefined') {
      console.log('❌ Auth failed: Invalid token value');
      return res.status(401).json({ success: false, error: 'Invalid token', code: 'INVALID_TOKEN' });
    }

    let data, error;
    const maxRetries = 2;
    
    for (let i = 0; i <= maxRetries; i++) {
      try {
        const result = await withTimeout(supabase.auth.getUser(token), 3000);
        data = result.data;
        error = result.error;
        break;
      } catch (e) {
        if (i === maxRetries) {
          console.log('❌ Auth failed: Timeout after retries');
          return res.status(503).json({ success: false, error: 'Service unavailable', code: 'TIMEOUT' });
        }
        await new Promise(r => setTimeout(r, 300 * Math.pow(2, i)));
      }
    }
    
    if (error || !data.user) {
      console.log('❌ Auth failed: Invalid token or no user', error?.message);
      return res.status(401).json({ success: false, error: 'Invalid token', code: 'INVALID_TOKEN' });
    }

    let userProfile = null;
    try {
      const result = await withTimeout(
        supabase.from('user_profiles').select('role, is_admin, is_tutor, is_student').eq('id', data.user.id).single(),
        2000
      );
      userProfile = result.data;
    } catch (e) {}

    const userRole = userProfile?.role || data.user.user_metadata?.role || 'user';

    req.user = {
      id: data.user.id,
      email: data.user.email,
      role: userRole,
      isAdmin: userProfile?.is_admin || userRole === 'admin',
      isTutor: userProfile?.is_tutor || userRole === 'tutor',
      isStudent: userProfile?.is_student || userRole === 'student',
      metadata: data.user.user_metadata
    };

    console.log('✅ Auth success:', { email: req.user.email, role: req.user.role, isAdmin: req.user.isAdmin });
    next();
  } catch (error) {
    console.log('❌ Auth error:', error.message);
    return res.status(500).json({ success: false, error: 'Auth error', code: 'ERROR' });
  }
};

const requireAdmin = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }
  if (!req.user.isAdmin) {
    return res.status(403).json({ success: false, error: 'Admin access required' });
  }
  next();
};

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

    const { data, error } = await withTimeout(supabase.auth.getUser(token), 2000);
    if (error || !data.user) {
      req.user = null;
      return next();
    }

    let userProfile = null;
    try {
      const result = await withTimeout(
        supabase.from('user_profiles').select('role, is_admin, is_tutor, is_student').eq('id', data.user.id).single(),
        1500
      );
      userProfile = result.data;
    } catch (e) {}

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
    req.user = null;
    next();
  }
};

module.exports = {
  authenticate,
  requireAdmin,
  optionalAuth
};