import supabase from '../config/supabase';

class LeagueService {
  async getMyLeague() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase.rpc('assign_student_to_league', {
        p_student_id: user.id
      });

      if (error) throw error;

      const { data: leagueData, error: leagueError } = await supabase
        .from('league_participants')
        .select(`
          *,
          league:leagues(name, tier)
        `)
        .eq('student_id', user.id)
        .eq('week_start', this.getCurrentWeekStart())
        .single();

      if (leagueError) throw leagueError;

      return { success: true, data: leagueData };
    } catch (error) {
      console.error('Get league error:', error);
      return { success: false, error: error.message };
    }
  }

  async getLeagueParticipants(leagueId) {
    try {
      const { data, error } = await supabase
        .from('league_participants')
        .select(`
          *,
          student:user_profiles(id, name, xp_points, level)
        `)
        .eq('league_id', leagueId)
        .eq('week_start', this.getCurrentWeekStart())
        .order('weekly_xp', { ascending: false })
        .limit(30);

      if (error) throw error;

      const { data: { user } } = await supabase.auth.getUser();
      
      const formatted = data.map((p, idx) => ({
        rank: idx + 1,
        name: p.student?.name || 'Anonymous',
        level: p.student?.level || 1,
        weeklyXP: p.weekly_xp,
        isYou: p.student_id === user?.id
      }));

      return { success: true, data: formatted };
    } catch (error) {
      console.error('Get participants error:', error);
      return { success: false, error: error.message, data: [] };
    }
  }

  async updateWeeklyXP(xpEarned) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.rpc('update_weekly_xp', {
        p_student_id: user.id,
        p_xp_earned: xpEarned
      });

      if (error) throw error;

      await supabase.rpc('calculate_league_ranks');

      return { success: true };
    } catch (error) {
      console.error('Update weekly XP error:', error);
      return { success: false, error: error.message };
    }
  }

  getCurrentWeekStart() {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(now.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday.toISOString().split('T')[0];
  }
}

export default new LeagueService();
