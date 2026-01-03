import supabase from '../config/supabase';
import logger from '../utils/logger';

class PracticeSessionService {
  /**
   * Save practice session using atomic database function
   * SENIOR-LEVEL: No race conditions, centralized logic
   */
  async savePracticeSession(sessionData) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Rate limiting check
      const { data: rateLimitOk } = await supabase.rpc('check_rate_limit', {
        p_user_id: user.id,
        p_action: 'PRACTICE_SUBMIT',
        p_max_attempts: 20,
        p_window_minutes: 5
      });

      if (!rateLimitOk) {
        throw new Error('Too many attempts. Please wait a few minutes.');
      }

      // Atomic save with database function (prevents race conditions)
      const { data, error } = await supabase.rpc('save_practice_session', {
        p_user_id: user.id,
        p_bank_id: sessionData.bankId,
        p_bank_name: sessionData.bankName,
        p_subject: sessionData.subject,
        p_total_questions: sessionData.totalQuestions,
        p_correct_answers: sessionData.correctAnswers,
        p_time_spent: sessionData.timeSpent,
        p_percentage: sessionData.percentage,
        p_difficulty: sessionData.difficulty || 'medium'
      });

      if (error) throw error;

      const result = data[0];
      
      logger.info('Practice session saved', { 
        sessionId: result.session_id,
        isFirstAttempt: result.is_first_attempt,
        pointsAwarded: result.points_awarded
      });

      return {
        success: true,
        data: result,
        isFirstAttempt: result.is_first_attempt,
        pointsAwarded: result.points_awarded,
        message: result.is_first_attempt
          ? `🎉 Great! You earned ${result.points_awarded} points!`
          : '📝 Practice completed! (No points for retakes)'
      };
    } catch (error) {
      logger.error('Failed to save practice session', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get leaderboard with caching
   */
  async getLeaderboard(timeframe = 'all', limit = 100) {
    try {
      const viewName = {
        'week': 'leaderboard_weekly',
        'month': 'leaderboard_monthly',
        'all': 'leaderboard_stats'
      }[timeframe] || 'leaderboard_stats';

      const { data, error } = await supabase
        .from(viewName)
        .select('*')
        .order('points', { ascending: false })
        .limit(limit);

      if (error) throw error;

      const { data: { user } } = await supabase.auth.getUser();
      
      const enhancedData = data.map((userData, index) => ({
        ...userData,
        rank: index + 1,
        isCurrentUser: user?.id === userData.user_id
      }));

      return { success: true, data: enhancedData };
    } catch (error) {
      logger.error('Failed to get leaderboard', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get suspicious activities for admin review
   */
  async getSuspiciousActivities(unreviewed = true) {
    try {
      let query = supabase
        .from('suspicious_activities')
        .select(`
          *,
          user_profiles!inner(full_name, email),
          practice_sessions!inner(bank_name, percentage, time_spent)
        `)
        .order('created_at', { ascending: false });

      if (unreviewed) {
        query = query.eq('reviewed', false);
      }

      const { data, error } = await query;
      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      logger.error('Failed to get suspicious activities', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get user history
   */
  async getUserHistory(userId = null, limit = 50) {
    try {
      let targetUserId = userId;
      
      if (!targetUserId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');
        targetUserId = user.id;
      }

      const { data, error } = await supabase
        .from('practice_sessions')
        .select('*')
        .eq('user_id', targetUserId)
        .order('completed_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      logger.error('Failed to get user history', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get student progress
   */
  async getStudentProgress(userId) {
    try {
      const { data: history, error } = await supabase
        .from('practice_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('completed_at', { ascending: false });

      if (error) throw error;

      if (!history || history.length === 0) {
        return { 
          success: true, 
          stats: { 
            totalSessions: 0, 
            averageScore: 0, 
            totalQuestions: 0, 
            chartData: [] 
          } 
        };
      }

      const totalSessions = history.length;
      const totalQuestions = history.reduce((sum, s) => sum + (s.total_questions || 0), 0);
      const avgScore = Math.round(
        history.reduce((sum, s) => sum + (s.percentage || 0), 0) / totalSessions
      );

      // Chart data (last 7 days)
      const chartData = [];
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toDateString();
        const daySessions = history.filter(h => 
          new Date(h.completed_at).toDateString() === dateStr
        );
        
        const dayAvg = daySessions.length > 0
          ? Math.round(
              daySessions.reduce((sum, s) => sum + (s.percentage || 0), 0) / daySessions.length
            )
          : 0;

        chartData.push({
          day: days[d.getDay()],
          score: dayAvg
        });
      }

      return {
        success: true,
        stats: {
          totalSessions,
          averageScore: avgScore,
          totalQuestions,
          chartData
        }
      };
    } catch (error) {
      logger.error('Failed to get student progress', error);
      return { success: false, error: error.message };
    }
  }
}

export default new PracticeSessionService();
