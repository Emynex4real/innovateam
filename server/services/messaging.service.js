const supabase = require('../supabaseClient');

const messagingService = {
  // Send message
  async sendMessage(senderId, receiverId, messageText, centerId = null, attachments = []) {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        sender_id: senderId,
        receiver_id: receiverId,
        center_id: centerId,
        message_text: messageText,
        attachments
      })
      .select()
      .single();

    if (error) throw error;

    // Create notification for receiver
    await supabase.from('notifications').insert({
      user_id: receiverId,
      type: 'message',
      title: 'New Message',
      content: `You have a new message`,
      action_url: `/messages/${senderId}`
    });

    return { success: true, message: data };
  },

  // Get conversations
  async getConversations(userId) {
    const { data, error } = await supabase
      .from('messages')
      .select('sender_id, receiver_id, message_text, sent_at, is_read')
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('sent_at', { ascending: false });

    if (error) throw error;

    // Group by conversation partner
    const conversations = {};
    data.forEach(msg => {
      const partnerId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id;
      if (!conversations[partnerId]) {
        conversations[partnerId] = {
          partnerId,
          lastMessage: msg.message_text,
          lastMessageTime: msg.sent_at,
          unreadCount: 0
        };
      }
      if (msg.receiver_id === userId && !msg.is_read) {
        conversations[partnerId].unreadCount++;
      }
    });

    return { success: true, conversations: Object.values(conversations) };
  },

  // Get messages with specific user
  async getMessages(userId, partnerId, limit = 50) {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${userId},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${userId})`)
      .order('sent_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    // Mark as read
    await supabase
      .from('messages')
      .update({ is_read: true, read_at: new Date() })
      .eq('receiver_id', userId)
      .eq('sender_id', partnerId)
      .eq('is_read', false);

    return { success: true, messages: data.reverse() };
  },

  // Create announcement
  async createAnnouncement(tutorId, centerId, title, content, priority = 'medium', expiresAt = null) {
    const { data, error } = await supabase
      .from('announcements')
      .insert({
        tutor_id: tutorId,
        center_id: centerId,
        title,
        content,
        priority,
        expires_at: expiresAt
      })
      .select()
      .single();

    if (error) throw error;

    // Get all students in center
    const { data: students } = await supabase
      .from('tc_enrollments')
      .select('student_id')
      .eq('center_id', centerId);

    // Create notifications for all students
    const notifications = students.map(s => ({
      user_id: s.student_id,
      type: 'announcement',
      title: `New Announcement: ${title}`,
      content: content.substring(0, 100),
      action_url: `/announcements/${data.id}`
    }));

    await supabase.from('notifications').insert(notifications);

    return { success: true, announcement: data };
  },

  // Get announcements
  async getAnnouncements(centerId) {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .eq('center_id', centerId)
      .eq('is_active', true)
      .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, announcements: data };
  },

  // Get notifications
  async getNotifications(userId, limit = 20) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    const unreadCount = data.filter(n => !n.is_read).length;
    return { success: true, notifications: data, unreadCount };
  },

  // Mark notification as read
  async markNotificationRead(notificationId) {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date() })
      .eq('id', notificationId);

    if (error) throw error;
    return { success: true };
  },

  // Mark all notifications as read
  async markAllNotificationsRead(userId) {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date() })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) throw error;
    return { success: true };
  }
};

module.exports = messagingService;
