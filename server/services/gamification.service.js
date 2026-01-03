const supabase = require('../supabaseClient');
const { logger } = require('../utils/logger');

// Get student's streak
exports.getMyStreak = async (req, res) => {
  try {
    const { centerId } = req.params;
    const studentId = req.user.id;

    const { data, error } = await supabase
      .from('tc_student_streaks')
      .select('*')
      .eq('student_id', studentId)
      .eq('center_id', centerId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    res.json({ 
      success: true, 
      streak: data || { current_streak: 0, longest_streak: 0 }
    });
  } catch (error) {
    logger.error('Get streak error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get student's league and rankings
exports.getMyLeague = async (req, res) => {
  try {
    const { centerId } = req.params;
    const studentId = req.user.id;

    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);

    // Get or create league entry
    const { data: league, error: leagueError } = await supabase
      .from('tc_leagues')
      .select('*')
      .eq('student_id', studentId)
      .eq('center_id', centerId)
      .eq('week_start_date', weekStart.toISOString().split('T')[0])
      .single();

    if (leagueError && leagueError.code === 'PGRST116') {
      // Create new league entry
      const { data: newLeague } = await supabase
        .from('tc_leagues')
        .insert([{
          student_id: studentId,
          center_id: centerId,
          league_tier: 'bronze',
          weekly_points: 0,
          week_start_date: weekStart.toISOString().split('T')[0]
        }])
        .select()
        .single();

      return res.json({ 
        success: true, 
        league: { ...newLeague, rank_in_league: 1 },
        rankings: []
      });
    }

    if (leagueError) throw leagueError;

    // Get rankings
    const { data: rankings } = await supabase
      .from('tc_leagues')
      .select(`
        student_id,
        weekly_points,
        student:student_id(email, raw_user_meta_data)
      `)
      .eq('center_id', centerId)
      .eq('league_tier', league.league_tier)
      .eq('week_start_date', weekStart.toISOString().split('T')[0])
      .order('weekly_points', { ascending: false })
      .limit(50);

    const rank = rankings.findIndex(r => r.student_id === studentId) + 1;

    const formattedRankings = rankings.map(r => ({
      student_name: r.student?.raw_user_meta_data?.name || r.student?.email?.split('@')[0] || 'Unknown',
      weekly_points: r.weekly_points
    }));

    res.json({ 
      success: true, 
      league: { ...league, rank_in_league: rank },
      rankings: formattedRankings
    });
  } catch (error) {
    logger.error('Get league error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Award points (called after test completion)
exports.awardPoints = async (studentId, centerId, points) => {
  try {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from('tc_leagues')
      .select('weekly_points')
      .eq('student_id', studentId)
      .eq('center_id', centerId)
      .eq('week_start_date', weekStart.toISOString().split('T')[0])
      .single();

    if (error && error.code === 'PGRST116') {
      // Create new entry
      await supabase
        .from('tc_leagues')
        .insert([{
          student_id: studentId,
          center_id: centerId,
          league_tier: 'bronze',
          weekly_points: points,
          week_start_date: weekStart.toISOString().split('T')[0]
        }]);
    } else if (!error) {
      // Update existing
      await supabase
        .from('tc_leagues')
        .update({ weekly_points: data.weekly_points + points })
        .eq('student_id', studentId)
        .eq('center_id', centerId)
        .eq('week_start_date', weekStart.toISOString().split('T')[0]);
    }

    logger.info('Points awarded', { studentId, points });
  } catch (error) {
    logger.error('Award points error:', error);
  }
};

module.exports = exports;
