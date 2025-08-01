const supabase = require('../supabaseClient');

/**
 * Log a user/admin action to the activity_logs table.
 * @param {string} userId - UUID of the user performing the action
 * @param {string} action - Description of the action
 * @param {object} metadata - Extra data as JSON
 * @returns {Promise<void>}
 */
async function logActivity(userId, action, metadata = {}) {
  try {
    await supabase.from('activity_logs').insert([
      {
        user_id: userId,
        action,
        metadata
      }
    ]);
  } catch (err) {
    // Log error but do not block main flow
    console.error('Failed to log activity:', err.message);
  }
}

module.exports = { logActivity };
