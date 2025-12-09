import supabase from '../config/supabase';
import logger from '../utils/logger';

class PracticeSessionService {
  /**
   * Save a completed practice session
   */
  async savePracticeSession(sessionData) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Check if this is the first attempt for this bank
      const { data: existingSessions, error: checkError } = await supabase
        .from('practice_sessions')
        .select('id')
        .eq('user_id', user.id)
        .eq('bank_id', sessionData.bankId)
        .limit(1);

      if (checkError) throw checkError;

      const isFirstAttempt = !existingSessions || existingSessions.length === 0;
      
      // Calculate points ONLY for first attempt
      const pointsAwarded = isFirstAttempt 
        ? (sessionData.correctAnswers * 10) + 50 + (sessionData.percentage * 2)
        : 0;

      const { data, error } = await supabase
        .from('practice_sessions')
        .insert([{
          user_id: user.id,
          bank_id: sessionData.bankId,
          bank_name: sessionData.bankName,
          subject: sessionData.subject,
          total_questions: sessionData.totalQuestions,
          correct_answers: sessionData.correctAnswers,
          time_spent: sessionData.timeSpent,
          percentage: sessionData.percentage,
          is_first_attempt: isFirstAttempt,
          points_awarded: pointsAwarded
        }])
        .select()
        .single();

      if (error) throw error;

      logger.info('Practice session saved', { 
        sessionId: data.id, 
        isFirstAttempt, 
        pointsAwarded 
      });
      
      return { 
        success: true, 
        data,
        isFirstAttempt,
        pointsAwarded,
        message: isFirstAttempt 
          ? `Great! You earned ${pointsAwarded} points!` 
          : 'Practice completed! (No points for retakes)'
      };
    } catch (error) {
      logger.error('Failed to save practice session', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get leaderboard data
   */
  async getLeaderboard(timeframe = 'all', limit = 100) {
    try {
      let viewName = 'leaderboard_stats';
      
      if (timeframe === 'week') {
        viewName = 'leaderboard_weekly';
      } else if (timeframe === 'month') {
        viewName = 'leaderboard_monthly';
      }

      const { data, error } = await supabase
        .from(viewName)
        .select('*')
        .order('points', { ascending: false })
        .limit(limit);

      if (error) throw error;

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      // Calculate streaks for top users (expensive operation, limit to top 50)
      const topUsers = data.slice(0, 50);
      const streaksPromises = topUsers.map(async (userData) => {
        const { data: streakData } = await supabase
          .rpc('calculate_user_streak', { p_user_id: userData.user_id });
        return { user_id: userData.user_id, streak: streakData || 0 };
      });

      const streaks = await Promise.all(streaksPromises);
      const streakMap = Object.fromEntries(streaks.map(s => [s.user_id, s.streak]));

      // Enhance data with streaks and current user flag
      const enhancedData = data.map((userData, index) => ({
        ...userData,
        rank: index + 1,
        streak: streakMap[userData.user_id] || 0,
        isCurrentUser: user?.id === userData.user_id
      }));

      return { success: true, data: enhancedData };
    } catch (error) {
      logger.error('Failed to get leaderboard', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get user's practice history
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
   * Get user stats
   */
  async getUserStats(userId = null) {
    try {
      let targetUserId = userId;
      
      if (!targetUserId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');
        targetUserId = user.id;
      }

      const { data, error } = await supabase
        .from('leaderboard_stats')
        .select('*')
        .eq('user_id', targetUserId)
        .single();

      if (error) throw error;

      // Get streak
      const { data: streak } = await supabase
        .rpc('calculate_user_streak', { p_user_id: targetUserId });

      return { 
        success: true, 
        data: {
          ...data,
          streak: streak || 0
        }
      };
    } catch (error) {
      logger.error('Failed to get user stats', error);
      return { success: false, error: error.message };
    }
  }
}

export default new PracticeSessionService();
