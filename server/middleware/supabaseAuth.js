const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Middleware to verify Supabase JWT and user role
const requireAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ success: false, message: 'No token provided' });
    const token = authHeader.replace('Bearer ', '');

    // Verify JWT and get user
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return res.status(401).json({ success: false, message: 'Invalid token' });

    // Fetch user record from users table
    const { data: userRecord, error: userErr } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();
    if (userErr || !userRecord) return res.status(403).json({ success: false, message: 'User not found' });

    // Check role
    if (userRecord.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin privileges required' });
    }
    req.user = userRecord;
    next();
  } catch (err) {
    res.status(500).json({ success: false, message: 'Auth error', error: err.message });
  }
};

module.exports = { requireAdmin };
