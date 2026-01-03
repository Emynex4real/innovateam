/**
 * Messaging Service - Handle real-time messaging between users
 */

const supabase = require('../supabaseClient');
const { logger } = require('../utils/logger');
const notificationHelper = require('./notificationHelper');

class MessagingService {
  // Get all conversations for a user
  async getConversations(userId) {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          id,
          participant_1_id,
          participant_2_id,
          center_id,
          last_message,
          last_message_at,
          participant_1_unread,
          participant_2_unread,
          updated_at
        `)
        .or(`participant_1_id.eq.${userId},participant_2_id.eq.${userId}`)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // Enrich with user data
      const enrichedConversations = await Promise.all(
        data.map(async (conv) => {
          const otherUserId = conv.participant_1_id === userId ? conv.participant_2_id : conv.participant_1_id;
          const { data: otherUser } = await supabase
            .from('user_profiles')
            .select('id, email, full_name, avatar_url')
            .eq('id', otherUserId)
            .single();

          return {
            ...conv,
            other_user: otherUser,
            unread_count: conv.participant_1_id === userId ? conv.participant_1_unread : conv.participant_2_unread
          };
        })
      );

      return { success: true, conversations: enrichedConversations };
    } catch (error) {
      logger.error('Error getting conversations:', error);
      return { success: false, error: error.message };
    }
  }

  // Get messages from a conversation
  async getMessages(conversationId, userId, limit = 50, offset = 0) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      // Enrich with sender info
      const enrichedMessages = await Promise.all(
        data.map(async (msg) => {
          const { data: sender } = await supabase
            .from('user_profiles')
            .select('id, email, full_name, avatar_url')
            .eq('id', msg.sender_id)
            .single();

          return { ...msg, sender };
        })
      );

      // Mark as read if receiver
      await this.markMessagesAsRead(conversationId, userId);

      return { success: true, messages: enrichedMessages };
    } catch (error) {
      logger.error('Error getting messages:', error);
      return { success: false, error: error.message };
    }
  }

  // Send a message
  async sendMessage(conversationId, senderId, receiverId, messageText, mediaUrl = null, mediaType = null) {
    try {
      console.log('📨 MessagingService.sendMessage called with:', {
        conversationId, senderId, receiverId, messageText, mediaUrl, mediaType
      });
      
      // Create message
      const { data: message, error: msgError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: senderId,
          receiver_id: receiverId,
          message_text: messageText,
          media_url: mediaUrl,
          media_type: mediaType,
          read: false
        })
        .select()
        .single();

      if (msgError) throw msgError;

      // Increment unread count for receiver
      const { data: conversation } = await supabase
        .from('conversations')
        .select('participant_1_id, participant_2_id')
        .eq('id', conversationId)
        .single();

      const isParticipant1 = conversation.participant_1_id === receiverId;
      const field = isParticipant1 ? 'participant_1_unread' : 'participant_2_unread';

      await supabase
        .from('conversations')
        .update({
          last_message: messageText,
          last_message_at: new Date(),
          [field]: supabase.raw(`${field} + 1`)
        })
        .eq('id', conversationId);

      // Create notification using helper
      await notificationHelper.notifyNewMessage(receiverId, senderId, messageText);

      logger.info(`Message sent: ${message.id}`);
      return { success: true, message };
    } catch (error) {
      logger.error('Error sending message:', error);
      return { success: false, error: error.message };
    }
  }

  // Mark messages as read
  async markMessagesAsRead(conversationId, userId) {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ read: true, read_at: new Date() })
        .eq('conversation_id', conversationId)
        .eq('receiver_id', userId)
        .eq('read', false);

      if (error) throw error;

      // Reset unread count
      const { data: conversation } = await supabase
        .from('conversations')
        .select('participant_1_id, participant_2_id')
        .eq('id', conversationId)
        .single();

      const isParticipant1 = conversation.participant_1_id === userId;
      const field = isParticipant1 ? 'participant_1_unread' : 'participant_2_unread';

      await supabase
        .from('conversations')
        .update({ [field]: 0 })
        .eq('id', conversationId);

      return { success: true };
    } catch (error) {
      logger.error('Error marking messages as read:', error);
      return { success: false, error: error.message };
    }
  }

  // Delete message (soft delete)
  async deleteMessage(messageId, userId) {
    try {
      const { data: message } = await supabase
        .from('messages')
        .select('sender_id')
        .eq('id', messageId)
        .single();

      if (message.sender_id !== userId) {
        return { success: false, error: 'Not authorized to delete this message' };
      }

      const { error } = await supabase
        .from('messages')
        .update({ is_deleted: true })
        .eq('id', messageId);

      if (error) throw error;

      logger.info(`Message deleted: ${messageId}`);
      return { success: true };
    } catch (error) {
      logger.error('Error deleting message:', error);
      return { success: false, error: error.message };
    }
  }

  // Start conversation (create if not exists)
  async startConversation(userId, otherUserId, centerId = null) {
    try {
      // Check if conversation exists
      let { data: conversation } = await supabase
        .from('conversations')
        .select('id')
        .or(`and(participant_1_id.eq.${userId},participant_2_id.eq.${otherUserId}),and(participant_1_id.eq.${otherUserId},participant_2_id.eq.${userId})`)
        .single();

      if (conversation) {
        return { success: true, conversation_id: conversation.id };
      }

      // Create new conversation
      const { data: newConv, error } = await supabase
        .from('conversations')
        .insert({
          participant_1_id: userId,
          participant_2_id: otherUserId,
          center_id: centerId
        })
        .select()
        .single();

      if (error) throw error;

      logger.info(`Conversation created: ${newConv.id}`);
      return { success: true, conversation_id: newConv.id };
    } catch (error) {
      logger.error('Error starting conversation:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new MessagingService();
