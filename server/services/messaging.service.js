const supabase = require('../supabaseClient');
const { logger } = require('../utils/logger');
const notificationHelper = require('./notificationHelper');

const messagingService = {
  // 1. Send message (FIXED: Auto-detects receiver if missing)
  async sendMessage(senderId, receiverId, messageText, conversationId = null, attachments = []) {
    try {
      // FIX: If we have a conversationId but NO receiverId, find the receiver from the DB
      if (conversationId && !receiverId) {
        const { data: conv, error: convError } = await supabase
            .from('conversations')
            .select('participant_1_id, participant_2_id')
            .eq('id', conversationId)
            .single();
        
        if (!convError && conv) {
            // The receiver is the participant who is NOT the sender
            receiverId = (conv.participant_1_id === senderId) 
                ? conv.participant_2_id 
                : conv.participant_1_id;
        }
      }

      // 2. If still no conversationId, try to find one by participants or create new
      if (!conversationId) {
         if (!receiverId) throw new Error("Cannot send message: Receiver ID missing");
         
         // Check for existing conversation
         const { data: existingConv } = await supabase
            .from('conversations')
            .select('id')
            .or(`and(participant_1_id.eq.${senderId},participant_2_id.eq.${receiverId}),and(participant_1_id.eq.${receiverId},participant_2_id.eq.${senderId})`)
            .maybeSingle();
         
         if (existingConv) {
             conversationId = existingConv.id;
         } else {
             // Create new conversation
             const { data: newConv, error: createError } = await supabase
                .from('conversations')
                .insert({
                    participant_1_id: senderId,
                    participant_2_id: receiverId,
                    updated_at: new Date()
                })
                .select()
                .single();
                
             if (createError) throw createError;
             conversationId = newConv.id;
         }
      }

      // Safety check: We must have both IDs now
      if (!conversationId || !receiverId) {
          throw new Error("Failed to resolve conversation or receiver.");
      }

      // 3. Insert Message
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: senderId,
          receiver_id: receiverId,
          message_text: messageText,
          created_at: new Date()
        })
        .select()
        .single();

      if (error) throw error;

      // 4. Update Conversation Metadata
      await supabase
        .from('conversations')
        .update({
            last_message: messageText,
            last_message_at: new Date(),
            updated_at: new Date()
        })
        .eq('id', conversationId);

      // 5. Create Notification
      await notificationHelper.notifyNewMessage(receiverId, senderId, messageText);

      return { success: true, message: data };
    } catch (error) {
      logger.error('Service sendMessage error:', error);
      throw error;
    }
  },

  // 2. Get conversations
  async getConversations(userId) {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        p1:user_profiles!participant_1_id(id, full_name, avatar_url), 
        p2:user_profiles!participant_2_id(id, full_name, avatar_url)
      `)
      .or(`participant_1_id.eq.${userId},participant_2_id.eq.${userId}`)
      .order('updated_at', { ascending: false });

    if (error) throw error;

    const formattedConversations = data.map(conv => {
        const isP1 = conv.participant_1_id === userId;
        const otherUser = isP1 ? conv.p2 : conv.p1;
        
        return {
            id: conv.id,
            partnerId: otherUser?.id,
            partnerName: otherUser?.full_name || 'Unknown User',
            partnerAvatar: otherUser?.avatar_url || null, 
            lastMessage: conv.last_message,
            lastMessageTime: conv.last_message_at,
            unreadCount: isP1 ? conv.participant_1_unread : conv.participant_2_unread,
            other_user: otherUser // Raw object for frontend flexbility
        };
    });

    return { success: true, conversations: formattedConversations };
  },

  // 3. Get messages
  async getMessages(userId, conversationId, limit = 50) {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:user_profiles!sender_id(full_name, avatar_url)
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false }) // ensure correct column name
      .limit(limit);

    if (error) throw error;

    // Mark as read
    await supabase
      .from('messages')
      .update({ read: true, read_at: new Date() })
      .eq('conversation_id', conversationId)
      .eq('receiver_id', userId)
      .eq('read', false);

    return { success: true, messages: data.reverse() };
  },

  // 4. Create Announcement
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

    // Notify students
    const { data: students } = await supabase
      .from('tc_enrollments')
      .select('student_id')
      .eq('center_id', centerId);

    if (students && students.length > 0) {
        const notifications = students.map(s => ({
          user_id: s.student_id,
          type: 'announcement',
          title: `New Announcement: ${title}`,
          content: content.substring(0, 100),
          action_url: `/announcements/${data.id}`
        }));
        await supabase.from('notifications').insert(notifications);
    }

    return { success: true, announcement: data };
  },

  // 5. Get Announcements
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

  // 6. Get Notifications
  async getNotifications(userId, limit = 20) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    const unreadCount = data ? data.filter(n => !n.read).length : 0;
    return { success: true, notifications: data || [], unreadCount };
  },

  // 7. Mark Notification Read
  async markNotificationRead(notificationId) {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true, read_at: new Date() })
      .eq('id', notificationId);

    if (error) throw error;
    return { success: true };
  },

  // 8. Mark All Notifications Read
  async markAllNotificationsRead(userId) {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true, read_at: new Date() })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) throw error;
    return { success: true };
  }
};

module.exports = messagingService;