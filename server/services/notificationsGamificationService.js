/**
 * Notifications & Gamification Service
 */

const supabase = require('../supabaseClient');
const { logger } = require('../utils/logger');

class NotificationsService {
  // Get user notifications
  async getNotifications(userId, unreadOnly = false, limit = 20) {
    try {
      let query = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId);

      if (unreadOnly) {
        query = query.eq('is_read', false);
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return { success: true, notifications: data };
    } catch (error) {
      logger.error('Error getting notifications:', error);
      return { success: false, error: error.message };
    }
  }

  // Mark notification as read
  async markAsRead(notificationId) {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date() })
        .eq('id', notificationId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      logger.error('Error marking notification as read:', error);
      return { success: false, error: error.message };
    }
  }

  // Mark all notifications as read
  async markAllAsRead(userId) {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date() })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      logger.error('Error marking all as read:', error);
      return { success: false, error: error.message };
    }
  }

  // Get unread count
  async getUnreadCount(userId) {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) throw error;

      return { success: true, unread_count: count };
    } catch (error) {
      logger.error('Error getting unread count:', error);
      return { success: false, error: error.message };
    }
  }
}

class GamificationService {
  // Get user badges
  async getUserBadges(userId, centerId) {
    try {
      const { data, error } = await supabase
        .from('user_badges')
        .select('*, badges(*)')
        .eq('user_id', userId)
        .eq('center_id', centerId);

      if (error) throw error;

      return { success: true, badges: data };
    } catch (error) {
      logger.error('Error getting user badges:', error);
      return { success: false, error: error.message };
    }
  }

  // Award badge to user
  async awardBadge(userId, badgeId, centerId) {
    try {
      // Check if already awarded
      const { data: existing } = await supabase
        .from('user_badges')
        .select('id')
        .eq('user_id', userId)
        .eq('badge_id', badgeId)
        .eq('center_id', centerId)
        .single();

      if (existing) {
        return { success: false, error: 'Badge already awarded' };
      }

      // Award badge
      const { data: badge, error: badgeError } = await supabase
        .from('user_badges')
        .insert({
          user_id: userId,
          badge_id: badgeId,
          center_id: centerId
        })
        .select()
        .single();

      if (badgeError) throw badgeError;

      // Get badge details
      const { data: badgeDetails } = await supabase
        .from('badges')
        .select('name, icon_url')
        .eq('id', badgeId)
        .single();

      // Create notification
      await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          type: 'achievement',
          title: 'New Badge Unlocked!',
          description: `You earned the "${badgeDetails.name}" badge!`,
          priority: 'high'
        });

      logger.info(`Badge awarded: ${userId} -> ${badgeId}`);
      return { success: true, badge };
    } catch (error) {
      logger.error('Error awarding badge:', error);
      return { success: false, error: error.message };
    }
  }

  // Get leaderboard
  async getLeaderboard(centerId, period = 'global', limit = 20) {
    try {
      const { data, error } = await supabase
        .from('leaderboard_entries')
        .select('*')
        .eq('center_id', centerId)
        .eq('period', period)
        .order('rank', { ascending: true })
        .limit(limit);

      if (error) throw error;

      // Enrich with user info
      const enrichedLeaderboard = await Promise.all(
        data.map(async (entry) => {
          const { data: user } = await supabase
            .from('user_profiles')
            .select('id, name, avatar_url')
            .eq('id', entry.user_id)
            .single();

          return { ...entry, user };
        })
      );

      return { success: true, leaderboard: enrichedLeaderboard };
    } catch (error) {
      logger.error('Error getting leaderboard:', error);
      return { success: false, error: error.message };
    }
  }

  // Get user rank
  async getUserRank(userId, centerId, period = 'global') {
    try {
      const { data, error } = await supabase
        .from('leaderboard_entries')
        .select('*')
        .eq('user_id', userId)
        .eq('center_id', centerId)
        .eq('period', period)
        .single();

      if (error) throw error;

      const { data: user } = await supabase
        .from('user_profiles')
        .select('id, name, avatar_url')
        .eq('id', userId)
        .single();

      return { success: true, rank: { ...data, user } };
    } catch (error) {
      logger.error('Error getting user rank:', error);
      return { success: false, error: error.message };
    }
  }

  // Update leaderboard points
  async updatePoints(userId, centerId, testPoints = 0, contributionPoints = 0, tutoringPoints = 0, period = 'global') {
    try {
      const totalPoints = testPoints + contributionPoints + tutoringPoints;

      const { data: existing } = await supabase
        .from('leaderboard_entries')
        .select('id, points')
        .eq('user_id', userId)
        .eq('center_id', centerId)
        .eq('period', period)
        .single();

      if (existing) {
        const { error } = await supabase
          .from('leaderboard_entries')
          .update({
            points: existing.points + totalPoints,
            test_points: supabase.raw('test_points + ?', [testPoints]),
            contribution_points: supabase.raw('contribution_points + ?', [contributionPoints]),
            tutoring_points: supabase.raw('tutoring_points + ?', [tutoringPoints]),
            updated_at: new Date()
          })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('leaderboard_entries')
          .insert({
            user_id: userId,
            center_id: centerId,
            period,
            points: totalPoints,
            test_points: testPoints,
            contribution_points: contributionPoints,
            tutoring_points: tutoringPoints
          });

        if (error) throw error;
      }

      // Update ranks
      await this.recalculateRanks(centerId, period);

      return { success: true };
    } catch (error) {
      logger.error('Error updating points:', error);
      return { success: false, error: error.message };
    }
  }

  // Recalculate leaderboard ranks
  async recalculateRanks(centerId, period) {
    try {
      // Get all entries ordered by points
      const { data: entries } = await supabase
        .from('leaderboard_entries')
        .select('id, points')
        .eq('center_id', centerId)
        .eq('period', period)
        .order('points', { ascending: false });

      // Update ranks
      for (let i = 0; i < entries.length; i++) {
        await supabase
          .from('leaderboard_entries')
          .update({ rank: i + 1 })
          .eq('id', entries[i].id);
      }

      return { success: true };
    } catch (error) {
      logger.error('Error recalculating ranks:', error);
      return { success: false, error: error.message };
    }
  }

  // Get achievements summary
  async getAchievementsSummary(userId, centerId) {
    try {
      // Get badges count
      const { count: badgesCount } = await supabase
        .from('user_badges')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('center_id', centerId);

      // Get rank
      const { data: rankData } = await supabase
        .from('leaderboard_entries')
        .select('rank, points')
        .eq('user_id', userId)
        .eq('center_id', centerId)
        .eq('period', 'global')
        .single();

      // Get badges
      const { data: badges } = await supabase
        .from('user_badges')
        .select('badges(name, icon_url)')
        .eq('user_id', userId)
        .eq('center_id', centerId)
        .limit(5);

      return {
        success: true,
        summary: {
          badges_earned: badgesCount || 0,
          current_rank: rankData?.rank || 0,
          total_points: rankData?.points || 0,
          recent_badges: badges || []
        }
      };
    } catch (error) {
      logger.error('Error getting achievements summary:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = {
  NotificationsService: new NotificationsService(),
  GamificationService: new GamificationService()
};
