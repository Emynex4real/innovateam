const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');
const { authenticate } = require('../middleware/authenticate');
require('dotenv').config();

// GET /api/profile/me (get current user's profile)
router.get('/me', authenticate, async (req, res) => {
  try {
    const { data: profile, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.user.id)
      .single();
    if (error || !profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }
    res.json({ success: true, profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/profile (create user profile after auth signUp)
router.post('/', authenticate, async (req, res) => {
  try {
    const { name, phone_number } = req.body;
    // Only allow the authenticated user to create their own profile
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          id: req.user.id,
          email: req.user.email,
          name,
          phone_number,
          role: 'user',
          status: 'active'
        }
      ])
      .select();
    if (error) throw error;
    res.status(201).json({ success: true, profile: data[0] });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;
