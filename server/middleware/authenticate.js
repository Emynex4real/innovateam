const supabase = require('../supabaseClient');

// Authentication middleware
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    // 1. Validate Header Presence
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required: No token provided',
        code: 'NO_TOKEN'
      });
    }

    const token = authHeader.split(' ')[1];
    
    // 2. Validate Token Format
    if (!token || token === 'null' || token === 'undefined') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token format',
        code: 'INVALID_TOKEN_FORMAT'
      });
    }

    // 3. Verify Token with Supabase (with retry)
    let data, error;
    let retries = 3;
    
    while (retries > 0) {
      try {
        const result = await supabase.auth.getUser(token);
        data = result.data;
        error = result.error;
        break;
      } catch (fetchError) {
        retries--;
        if (retries === 0) {
          console.error('Auth verification failed after retries:', fetchError.message);
          return res.status(503).json({
            success: false,
            error: 'Authentication service temporarily unavailable',
            code: 'AUTH_SERVICE_UNAVAILABLE'
          });
        }
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    if (error || !data.user) {
      console.error('Auth verification failed:', error?.message);
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token',
        code: 'INVALID_TOKEN'
      });
    }

    // 4. Fetch User Profile (Roles)
    // We try to fetch the profile, but default to basic user info if profile fetch fails
    // to prevent blocking valid auth just because of a DB join issue.
    let userProfile = null;
    try {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role, is_admin, is_tutor, is_student')
        .eq('id', data.user.id)
        .single();
      userProfile = profile;
    } catch (profileError) {
      console.warn('Could not fetch user profile details:', profileError.message);
    }

    const userRole = userProfile?.role || data.user.user_metadata?.role || 'user';

    // 5. Attach user object to request
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
    console.error('Authentication middleware critical error:', error);
    return res.status(500).json({
      success: false,
      error: 'Authentication service error',
      code: 'AUTH_SERVICE_ERROR'
    });
  }
};

// Admin-only middleware
const requireAdmin = async (req, res, next) => {
  // Reuse the logic from authenticate, then check admin status
  // We call authenticate manually to populate req.user first
  await authenticate(req, res, async () => {
    if (!req.user) return; // authenticate already sent a response if failed

    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Admin access required',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }
    
    // If we are here, user is admin
    // We are already inside the "next" of authenticate, so we proceed to the controller
    // However, since we wrapped next(), we need to call the REAL next() now.
    // BUT: The structure above is tricky with async/await nesting. 
    // It is cleaner to duplicate the check or assume authenticate ran before this.
    // Since this function is used as a standalone middleware in some routes, we full implementation:
    
    // NOTE: The implementation below assumes this middleware is used AFTER authenticate
    // Example: router.get('/admin', authenticate, requireAdmin, controller)
    // If used standalone, it needs full logic. Based on your router file, it seems standalone.
    // So I will include the full check logic again for safety.
    
    // Actually, looking at your routes, you use router.use(authenticate) globally in some files.
    // But for safety, here is the full robust version:
    
    if (req.user && req.user.isAdmin) {
        return next();
    } 
    
    // If req.user exists but not admin
    if (req.user && !req.user.isAdmin) {
        return res.status(403).json({ success: false, error: 'Admin access required' });
    }

    // If req.user doesn't exist, we need to authenticate first.
    // To keep code DRY, let's just error out and expect 'authenticate' to be used first.
    // Or we can just copy-paste the auth logic. For robustness given your "don't be lazy" constraint:
    
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) return res.status(401).json({error: 'No token'});
        
        const token = authHeader.split(' ')[1];
        const { data, error } = await supabase.auth.getUser(token);
        
        if (error || !data.user) return res.status(401).json({error: 'Invalid token'});
        
        const { data: userProfile } = await supabase.from('user_profiles').select('*').eq('id', data.user.id).single();
        const isAdmin = userProfile?.is_admin || userProfile?.role === 'admin';
        
        if (!isAdmin) return res.status(403).json({error: 'Admin access required'});
        
        req.user = { id: data.user.id, isAdmin: true, role: 'admin', email: data.user.email };
        next();
    } catch(e) {
        res.status(500).json({error: 'Server error'});
    }
  });
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

    // Try to get detailed profile, but don't fail if missing
    let userProfile = null;
    try {
        const { data: profile } = await supabase
            .from('user_profiles')
            .select('role, is_admin, is_tutor, is_student')
            .eq('id', data.user.id)
            .single();
        userProfile = profile;
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