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

      // Rate limiting check
      const { data: rateLimitOk, error: rateLimitError } = await supabase
        .rpc('check_rate_limit', {
          p_user_id: user.id,
          p_action: 'PRACTICE_SUBMIT',
          p_max_attempts: 20,
          p_window_minutes: 5
        });

      if (rateLimitError || !rateLimitOk) {
        throw new Error('Too many attempts. Please wait a few minutes.');
      }

      // Check if this is the first attempt for this specific question bank
      const { data: existingSessions, error: checkError } = await supabase
        .from('practice_sessions')
        .select('id')
        .eq('user_id', user.id)
        .eq('bank_id', sessionData.bankId)
        .limit(1);

      if (checkError) throw checkError;

      const isFirstAttempt = !existingSessions || existingSessions.length === 0;
      
      // Calculate points ONLY for first attempt to prevent farming
      // Formula: (Correct * 10) + 50 Bonus + (Percentage * 2)
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

      // Fetch leaderboard view
      const { data, error } = await supabase
        .from(viewName)
        .select('*')
        .order('points', { ascending: false })
        .limit(limit);

      if (error) throw error;

      // Get current user to flag "YOU"
      const { data: { user } } = await supabase.auth.getUser();
      
      // Calculate streaks for top 50 users (Optimization)
      const topUsers = data.slice(0, 50);
      const streaksPromises = topUsers.map(async (userData) => {
        // Calls a database function to count consecutive days
        const { data: streakData } = await supabase
          .rpc('calculate_user_streak', { p_user_id: userData.user_id });
        return { user_id: userData.user_id, streak: streakData || 0 };
      });

      const streaks = await Promise.all(streaksPromises);
      const streakMap = Object.fromEntries(streaks.map(s => [s.user_id, s.streak]));

      // Merge data
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
   * Get the top performer specifically for the current week
   */
  async getWeeklyChampion() {
    try {
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // Go back to Sunday
      startOfWeek.setHours(0, 0, 0, 0);
  
      // Fetch points earned this week
      const { data, error } = await supabase
        .from('practice_sessions')
        .select(`
          user_id, 
          points_awarded, 
          created_at,
          user_profiles!inner (full_name)
        `) 
        .gte('created_at', startOfWeek.toISOString());
  
      if (error) throw error;
  
      if (!data || data.length === 0) return { success: true, champion: null };

      // Aggregate points
      const userPoints = {};
      data.forEach(session => {
        if (!userPoints[session.user_id]) {
          userPoints[session.user_id] = {
            name: session.user_profiles?.full_name || 'Anonymous',
            points: 0,
            userId: session.user_id
          };
        }
        userPoints[session.user_id].points += (session.points_awarded || 0);
      });
  
      // Sort and pick winner
      const sortedUsers = Object.values(userPoints).sort((a, b) => b.points - a.points);
  
      return { success: true, champion: sortedUsers.length > 0 ? sortedUsers[0] : null };
  
    } catch (error) {
      logger.error('Failed to get weekly champion', error);
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
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      logger.error('Failed to get user history', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get comprehensive student progress (For Dashboard)
   */
  async getStudentProgress(userId) {
    try {
      const { data: history, error } = await supabase
        .from('practice_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!history || history.length === 0) {
        return { 
          success: true, 
          stats: { totalSessions: 0, averageScore: 0, streak: 0, level: 1, progress: 0, totalQuestions: 0, chartData: [], hasPracticedToday: false } 
        };
      }

      const totalSessions = history.length;
      const totalQuestions = history.reduce((sum, session) => sum + (session.total_questions || 0), 0);
      const totalScore = history.reduce((sum, session) => sum + (session.score || 0), 0); // Assuming 'score' is percentage
      const averageScore = Math.round(totalScore / totalSessions);

      const level = Math.floor(totalQuestions / 50) + 1;
      const progress = ((totalQuestions % 50) / 50) * 100;

      // Simple Streak Calculation
      // (For robust streaks, use the database RPC, but this works for simple UI display)
      const uniqueDates = new Set(history.map(h => new Date(h.created_at).toDateString()));
      const today = new Date().toDateString();
      const hasPracticedToday = uniqueDates.has(today);
      
      // Calculate Chart Data (Last 7 Days)
      const chartData = [];
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const now = new Date();

      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        const dateStr = d.toDateString();
        const daySessions = history.filter(h => new Date(h.created_at).toDateString() === dateStr);
        
        let dayAvg = 0;
        if (daySessions.length > 0) {
           const dayTotal = daySessions.reduce((sum, s) => sum + (s.score || s.percentage || 0), 0);
           dayAvg = Math.round(dayTotal / daySessions.length);
        }

        chartData.push({
          day: days[d.getDay()],
          fullDate: dateStr,
          score: dayAvg
        });
      }

      return {
        success: true,
        stats: {
          totalSessions,
          averageScore,
          streak: uniqueDates.size, // Simplified streak for now
          level,
          progress,
          totalQuestions,
          chartData,
          hasPracticedToday
        }
      };
    } catch (error) {
      console.error('Progress Error:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new PracticeSessionService();