/**
 * Notifications & Gamification Service - Handle notifications, badges, and leaderboards
 */

const supabase = require('../supabaseClient');
const { logger } = require('../utils/logger');
const notificationHelper = require('./notificationHelper');

class NotificationsService {
  // Get user notifications
  async getNotifications(userId, unreadOnly = false, limit = 20) {
    try {
      let query = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId);

      if (unreadOnly) {
        query = query.eq('read', false);
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return { success: true, data: data || [] };
    } catch (error) {
      logger.error('Error getting notifications:', error);
      return { success: false, error: error.message, data: [] };
    }
  }

  // Get unread count
  async getUnreadCount(userId) {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('read', false);

      if (error) throw error;

      return { success: true, data: count || 0 };
    } catch (error) {
      logger.error('Error getting unread count:', error);
      return { success: false, error: error.message, data: 0 };
    }
  }

  // Mark notification as read
  async markAsRead(notificationId) {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ 
          read: true,
          read_at: new Date()
        })
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
        .update({ 
          read: true,
          read_at: new Date()
        })
        .eq('user_id', userId)
        .eq('read', false);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      logger.error('Error marking all as read:', error);
      return { success: false, error: error.message };
    }
  }

  // Create notification
  async createNotification(userId, type, title, content, actionUrl = null) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          type,
          title,
          content,
          action_url: actionUrl
        })
        .select()
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      logger.error('Error creating notification:', error);
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
        .select(`
          *,
          badge:badges(name, description, icon_url, points)
        `)
        .eq('user_id', userId)
        .eq('center_id', centerId)
        .order('earned_at', { ascending: false });

      if (error) throw error;

      return { success: true, data: data || [] };
    } catch (error) {
      logger.error('Error getting user badges:', error);
      return { success: false, error: error.message, data: [] };
    }
  }

  // Get leaderboard
  async getLeaderboard(centerId, period = 'global', limit = 20) {
    try {
      let query = supabase
        .from('user_points')
        .select(`
          user_id,
          total_points,
          user:user_profiles!user_id(full_name, avatar_url)
        `)
        .eq('center_id', centerId);

      // Apply period filter if needed
      if (period !== 'global') {
        const now = new Date();
        let startDate;
        
        switch (period) {
          case 'weekly':
            startDate = new Date(now.setDate(now.getDate() - 7));
            break;
          case 'monthly':
            startDate = new Date(now.setMonth(now.getMonth() - 1));
            break;
          default:
            startDate = null;
        }

        if (startDate) {
          query = query.gte('updated_at', startDate.toISOString());
        }
      }

      const { data, error } = await query
        .order('total_points', { ascending: false })
        .limit(limit);

      if (error) throw error;

      // Add rank
      const leaderboard = data?.map((entry, index) => ({
        rank: index + 1,
        user_id: entry.user_id,
        name: entry.user?.full_name || 'Unknown',
        avatar: entry.user?.avatar_url,
        points: entry.total_points
      })) || [];

      return { success: true, data: leaderboard };
    } catch (error) {
      logger.error('Error getting leaderboard:', error);
      return { success: false, error: error.message, data: [] };
    }
  }

  // Get user rank
  async getUserRank(userId, centerId, period = 'global') {
    try {
      // Get user's points
      const { data: userPoints, error: userError } = await supabase
        .from('user_points')
        .select('total_points')
        .eq('user_id', userId)
        .eq('center_id', centerId)
        .single();

      if (userError) throw userError;

      // Count users with higher points
      const { count, error: countError } = await supabase
        .from('user_points')
        .select('*', { count: 'exact', head: true })
        .eq('center_id', centerId)
        .gt('total_points', userPoints.total_points);

      if (countError) throw countError;

      const rank = (count || 0) + 1;

      return { 
        success: true, 
        data: { 
          rank, 
          points: userPoints.total_points 
        } 
      };
    } catch (error) {
      logger.error('Error getting user rank:', error);
      return { success: false, error: error.message, data: null };
    }
  }

  // Get achievements summary
  async getAchievementsSummary(userId, centerId) {
    try {
      // Get total badges
      const { count: badgeCount } = await supabase
        .from('user_badges')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('center_id', centerId);

      // Get total points
      const { data: pointsData } = await supabase
        .from('user_points')
        .select('total_points')
        .eq('user_id', userId)
        .eq('center_id', centerId)
        .single();

      // Get recent achievements
      const { data: recentBadges } = await supabase
        .from('user_badges')
        .select(`
          *,
          badge:badges(name, description, icon_url)
        `)
        .eq('user_id', userId)
        .eq('center_id', centerId)
        .order('earned_at', { ascending: false })
        .limit(5);

      return {
        success: true,
        data: {
          total_badges: badgeCount || 0,
          total_points: pointsData?.total_points || 0,
          recent_badges: recentBadges || []
        }
      };
    } catch (error) {
      logger.error('Error getting achievements summary:', error);
      return { success: false, error: error.message, data: null };
    }
  }

  // Award badge
  async awardBadge(userId, centerId, badgeId, reason = null) {
    try {
      // Check if already earned
      const { data: existing } = await supabase
        .from('user_badges')
        .select('id')
        .eq('user_id', userId)
        .eq('badge_id', badgeId)
        .single();

      if (existing) {
        return { success: false, error: 'Badge already earned' };
      }

      // Award badge
      const { data: userBadge, error } = await supabase
        .from('user_badges')
        .insert({
          user_id: userId,
          center_id: centerId,
          badge_id: badgeId,
          reason
        })
        .select(`
          *,
          badge:badges(name, description, points)
        `)
        .single();

      if (error) throw error;

      // Add points
      if (userBadge.badge.points > 0) {
        await this.addPoints(userId, centerId, userBadge.badge.points, 'badge_earned');
      }

      // Create notification using helper
      await notificationHelper.notifyBadgeEarned(
        userId,
        userBadge.badge.name,
        userBadge.badge.description
      );

      logger.info(`Badge awarded: ${badgeId} to user ${userId}`);
      return { success: true, data: userBadge };
    } catch (error) {
      logger.error('Error awarding badge:', error);
      return { success: false, error: error.message };
    }
  }

  // Add points
  async addPoints(userId, centerId, points, reason = null) {
    try {
      // Upsert user points
      const { error } = await supabase
        .from('user_points')
        .upsert({
          user_id: userId,
          center_id: centerId,
          total_points: supabase.raw(`COALESCE(total_points, 0) + ${points}`)
        });

      if (error) throw error;

      // Log point transaction
      await supabase
        .from('point_transactions')
        .insert({
          user_id: userId,
          center_id: centerId,
          points,
          reason,
          type: 'earned'
        });

      logger.info(`Points added: ${points} to user ${userId}`);
      return { success: true };
    } catch (error) {
      logger.error('Error adding points:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = {
  NotificationsService: new NotificationsService(),
  GamificationService: new GamificationService()
};