/**
 * Notification Helper - Centralized notification creation
 */

const supabase = require('../supabaseClient');
const { logger } = require('../utils/logger');

class NotificationHelper {
  
  /**
   * Create a notification for a user
   */
  async create(userId, type, title, message, actionUrl = null) {
    try {
      console.log('🔔 NotificationHelper.create called:', { userId, type, title });
      
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          type,
          title,
          message,
          action_url: actionUrl,
          read: false
        });

      if (error) {
        console.error('❌ Notification insert error:', error);
        throw error;
      }
      
      console.log('✅ Notification created successfully for user', userId);
      logger.info(`Notification created for user ${userId}: ${type}`);
    } catch (error) {
      console.error('❌ Error in NotificationHelper.create:', error);
      logger.error('Error creating notification:', error);
    }
  }

  /**
   * Notify all group members about a new post
   */
  async notifyGroupPost(groupId, authorId, groupName, content) {
    try {
      // Get all group members except the author
      const { data: members } = await supabase
        .from('study_group_members')
        .select('user_id')
        .eq('group_id', groupId)
        .neq('user_id', authorId);

      if (!members || members.length === 0) return;

      // Get author name
      const { data: author } = await supabase
        .from('user_profiles')
        .select('full_name')
        .eq('id', authorId)
        .single();

      const authorName = author?.full_name || 'Someone';
      const preview = content.length > 50 ? content.substring(0, 50) + '...' : content;

      // Create notifications for all members
      const notifications = members.map(member => ({
        user_id: member.user_id,
        type: 'info',
        title: `New post in ${groupName}`,
        message: `${authorName}: ${preview}`,
        action_url: `/student/study-groups?group=${groupId}`,
        read: false
      }));

      await supabase.from('notifications').insert(notifications);
      logger.info(`Notified ${members.length} members about new post in group ${groupId}`);
    } catch (error) {
      logger.error('Error notifying group members:', error);
    }
  }

  /**
   * Notify group creator when someone joins
   */
  async notifyGroupJoin(groupId, joinerId, groupName) {
    try {
      // Get group creator
      const { data: group } = await supabase
        .from('study_groups')
        .select('creator_id, name')
        .eq('id', groupId)
        .single();

      if (!group || group.creator_id === joinerId) return;

      // Get joiner name
      const { data: joiner } = await supabase
        .from('user_profiles')
        .select('full_name')
        .eq('id', joinerId)
        .single();

      const joinerName = joiner?.full_name || 'Someone';

      await this.create(
        group.creator_id,
        'info',
        'New member joined your group',
        `${joinerName} joined "${groupName}"`,
        `/student/study-groups?group=${groupId}`
      );
    } catch (error) {
      logger.error('Error notifying group join:', error);
    }
  }

  /**
   * Notify user about a new direct message
   */
  async notifyNewMessage(recipientId, senderId, messagePreview) {
    try {
      // Get sender name
      const { data: sender } = await supabase
        .from('user_profiles')
        .select('full_name')
        .eq('id', senderId)
        .single();

      const senderName = sender?.full_name || 'Someone';
      const preview = messagePreview.length > 50 ? messagePreview.substring(0, 50) + '...' : messagePreview;

      await this.create(
        recipientId,
        'info',
        `New message from ${senderName}`,
        preview,
        `/student/messages?user=${senderId}`
      );
    } catch (error) {
      logger.error('Error notifying new message:', error);
    }
  }

  /**
   * Notify user about badge earned
   */
  async notifyBadgeEarned(userId, badgeName, badgeDescription) {
    try {
      await this.create(
        userId,
        'success',
        'Badge Earned! 🏆',
        `You earned the "${badgeName}" badge! ${badgeDescription}`,
        '/student/achievements'
      );
    } catch (error) {
      logger.error('Error notifying badge earned:', error);
    }
  }

  /**
   * Notify multiple users at once
   */
  async notifyBulk(notifications) {
    try {
      const notificationData = notifications.map(n => ({
        user_id: n.userId,
        type: n.type,
        title: n.title,
        message: n.content,
        action_url: n.actionUrl || null,
        read: false
      }));

      await supabase.from('notifications').insert(notificationData);
      logger.info(`Bulk notification sent to ${notifications.length} users`);
    } catch (error) {
      logger.error('Error sending bulk notifications:', error);
    }
  }
}

module.exports = new NotificationHelper();
