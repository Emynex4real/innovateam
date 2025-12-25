const testSchedulerService = require('../services/testScheduler.service');
const { logger } = require('../utils/logger');

// Manual trigger for scheduler (for testing or admin use)
exports.runScheduler = async (req, res) => {
  try {
    const result = await testSchedulerService.runScheduler();
    res.json({ success: true, result });
  } catch (error) {
    logger.error('Scheduler error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get scheduler status
exports.getSchedulerStatus = async (req, res) => {
  try {
    // Get upcoming scheduled tests
    const supabase = require('../supabaseClient');
    const now = new Date().toISOString();
    
    const { data: upcoming, error } = await supabase
      .from('tc_question_sets')
      .select('id, title, scheduled_start, scheduled_end, is_recurring, next_activation_at')
      .or(`scheduled_start.gte.${now},is_recurring.eq.true`)
      .order('scheduled_start', { ascending: true })
      .limit(10);

    if (error) throw error;

    res.json({ 
      success: true, 
      upcoming: upcoming || [],
      timestamp: now
    });
  } catch (error) {
    logger.error('Get scheduler status error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = exports;
