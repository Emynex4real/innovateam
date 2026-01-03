const supabase = require('../supabaseClient');

// Get leaderboard by timeframe
exports.getLeaderboard = async (req, res) => {
  try {
    const { timeframe = 'all', limit = 100 } = req.query;
    
    let viewName = 'leaderboard_stats';
    if (timeframe === 'daily') viewName = 'leaderboard_daily';
    else if (timeframe === 'week') viewName = 'leaderboard_weekly';
    else if (timeframe === 'month') viewName = 'leaderboard_monthly';
    else if (timeframe === 'year') viewName = 'leaderboard_yearly';

    const { data, error } = await supabase
      .from(viewName)
      .select('*')
      .order('points', { ascending: false })
      .limit(parseInt(limit));

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Get leaderboard analytics
exports.getLeaderboardAnalytics = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('admin_leaderboard_analytics')
      .select('*')
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Get all users performance
exports.getUsersPerformance = async (req, res) => {
  try {
    const { limit = 100, offset = 0 } = req.query;

    const { data, error } = await supabase
      .from('admin_user_performance')
      .select('*')
      .range(offset, offset + limit - 1);

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    console.error('Get users performance error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Create leaderboard snapshot
exports.createSnapshot = async (req, res) => {
  try {
    const { snapshotType } = req.body; // 'daily', 'weekly', 'monthly', 'yearly'

    if (!['daily', 'weekly', 'monthly', 'yearly'].includes(snapshotType)) {
      return res.status(400).json({ success: false, message: 'Invalid snapshot type' });
    }

    const { data, error } = await supabase
      .rpc('create_leaderboard_snapshot', { p_snapshot_type: snapshotType });

    if (error) throw error;

    res.json({ 
      success: true, 
      message: `Snapshot created for ${snapshotType}`,
      count: data 
    });
  } catch (error) {
    console.error('Create snapshot error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Award top performers
exports.awardTopPerformers = async (req, res) => {
  try {
    const { periodType, topCount = 3 } = req.body;

    if (!['daily', 'weekly', 'monthly', 'yearly'].includes(periodType)) {
      return res.status(400).json({ success: false, message: 'Invalid period type' });
    }

    const { data, error } = await supabase
      .rpc('award_top_performers', { 
        p_period_type: periodType,
        p_top_count: topCount 
      });

    if (error) throw error;

    res.json({ 
      success: true, 
      message: `Awarded top ${topCount} performers for ${periodType}`,
      awards: data 
    });
  } catch (error) {
    console.error('Award performers error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Manual reward user
exports.rewardUser = async (req, res) => {
  try {
    const { 
      userId, 
      rewardType, 
      rewardTitle, 
      rewardDescription, 
      pointsBonus = 0,
      badgeIcon 
    } = req.body;

    if (!userId || !rewardTitle) {
      return res.status(400).json({ success: false, message: 'User ID and reward title are required' });
    }

    const { data, error } = await supabase
      .from('user_rewards')
      .insert([{
        user_id: userId,
        reward_type: rewardType || 'achievement',
        reward_title: rewardTitle,
        reward_description: rewardDescription,
        points_bonus: pointsBonus,
        badge_icon: badgeIcon,
        awarded_by: req.user.id
      }])
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data, message: 'Reward granted successfully' });
  } catch (error) {
    console.error('Reward user error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Get user rewards
exports.getUserRewards = async (req, res) => {
  try {
    const { userId } = req.params;

    const { data, error } = await supabase
      .from('user_rewards')
      .select('*')
      .eq('user_id', userId)
      .order('awarded_at', { ascending: false });

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    console.error('Get user rewards error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Get leaderboard history
exports.getLeaderboardHistory = async (req, res) => {
  try {
    const { snapshotType, limit = 30 } = req.query;

    let query = supabase
      .from('leaderboard_snapshots')
      .select('*')
      .order('snapshot_date', { ascending: false })
      .limit(parseInt(limit));

    if (snapshotType) {
      query = query.eq('snapshot_type', snapshotType);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Get top performers for period
exports.getTopPerformers = async (req, res) => {
  try {
    const { period = 'weekly', limit = 10 } = req.query;

    let viewName = 'leaderboard_weekly';
    if (period === 'daily') viewName = 'leaderboard_daily';
    else if (period === 'monthly') viewName = 'leaderboard_monthly';
    else if (period === 'yearly') viewName = 'leaderboard_yearly';
    else if (period === 'all') viewName = 'leaderboard_stats';

    const { data, error } = await supabase
      .from(viewName)
      .select('*')
      .order('points', { ascending: false })
      .limit(parseInt(limit));

    if (error) throw error;

    res.json({ success: true, data, period });
  } catch (error) {
    console.error('Get top performers error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Bulk award users
exports.bulkAwardUsers = async (req, res) => {
  try {
    const { userIds, rewardTitle, rewardDescription, pointsBonus = 0 } = req.body;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ success: false, message: 'User IDs array is required' });
    }

    const rewards = userIds.map(userId => ({
      user_id: userId,
      reward_type: 'achievement',
      reward_title: rewardTitle,
      reward_description: rewardDescription,
      points_bonus: pointsBonus,
      awarded_by: req.user.id
    }));

    const { data, error } = await supabase
      .from('user_rewards')
      .insert(rewards)
      .select();

    if (error) throw error;

    res.json({ 
      success: true, 
      data, 
      message: `Rewarded ${userIds.length} users successfully` 
    });
  } catch (error) {
    console.error('Bulk award error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = exports;
