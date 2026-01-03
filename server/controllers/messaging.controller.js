const messagingService = require('../services/messaging.service');
const forumService = require('../services/forums.service');
const logger = require('../utils/logger');
const supabase = require('../supabaseClient'); 

// ==========================================
// MESSAGING CONTROLLER
// ==========================================

// 1. Start or Get Conversation
exports.startConversation = async (req, res) => {
  try {
    let { otherUserId, centerId } = req.body;
    const userId = req.user.id;

    if (!otherUserId) {
      return res.status(400).json({ success: false, error: 'Recipient ID or Email is required' });
    }

    // Handle Email Input: Find UUID if email is provided
    if (otherUserId.includes('@')) {
      const { data: user, error: userError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('email', otherUserId)
        .single();

      if (userError || !user) {
        logger.warn(`Start conversation failed: User with email ${otherUserId} not found`);
        return res.status(404).json({ success: false, error: 'User not found with this email' });
      }
      otherUserId = user.id; 
    }

    // Check if conversation already exists
    const { data: existingConvs, error: searchError } = await supabase
      .from('conversations')
      .select('*')
      .or(`and(participant_1_id.eq.${userId},participant_2_id.eq.${otherUserId}),and(participant_1_id.eq.${otherUserId},participant_2_id.eq.${userId})`);

    if (searchError) throw searchError;

    if (existingConvs && existingConvs.length > 0) {
      return res.json({ success: true, conversation: existingConvs[0] });
    }

    // Create new conversation
    const { data: newConv, error: createError } = await supabase
      .from('conversations')
      .insert({
        participant_1_id: userId,
        participant_2_id: otherUserId,
        center_id: centerId || null,
        updated_at: new Date()
      })
      .select()
      .single();

    if (createError) throw createError;

    res.json({ success: true, conversation: newConv });
  } catch (error) {
    logger.error('Start conversation error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// 2. Send Message
exports.sendMessage = async (req, res) => {
  try {
    console.log('📨 SendMessage called with body:', req.body);
    console.log('📨 User ID:', req.user.id);
    
    const { conversationId, messageText, mediaUrl, mediaType } = req.body; 
    let receiverId = req.body.receiverId;
    
    // If receiverId not provided, get it from conversation
    if (!receiverId && conversationId) {
      const { data: conv } = await supabase
        .from('conversations')
        .select('participant_1_id, participant_2_id')
        .eq('id', conversationId)
        .single();
      
      if (conv) {
        receiverId = conv.participant_1_id === req.user.id ? conv.participant_2_id : conv.participant_1_id;
      }
    }
    
    console.log('📨 Parameters:', { conversationId, receiverId, messageText });
    
    const result = await messagingService.sendMessage(
        req.user.id, 
        receiverId, 
        messageText, 
        conversationId,
        []
    );
    
    console.log('📨 SendMessage result:', result);
    res.json(result);
  } catch (error) {
    console.error('📨 SendMessage error:', error);
    logger.error('Send message error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getConversations = async (req, res) => {
  try {
    const result = await messagingService.getConversations(req.user.id);
    res.json(result);
  } catch (error) {
    logger.error('Get conversations error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params; 
    const result = await messagingService.getMessages(req.user.id, conversationId);
    res.json(result);
  } catch (error) {
    logger.error('Get messages error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ==========================================
// ANNOUNCEMENTS
// ==========================================
exports.createAnnouncement = async (req, res) => {
  try {
    const { centerId, title, content, priority, expiresAt } = req.body;
    const result = await messagingService.createAnnouncement(req.user.id, centerId, title, content, priority, expiresAt);
    res.json(result);
  } catch (error) {
    logger.error('Create announcement error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getAnnouncements = async (req, res) => {
  try {
    const { centerId } = req.params;
    const result = await messagingService.getAnnouncements(centerId);
    res.json(result);
  } catch (error) {
    logger.error('Get announcements error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ==========================================
// NOTIFICATIONS
// ==========================================
exports.getNotifications = async (req, res) => {
  try {
    const result = await messagingService.getNotifications(req.user.id);
    res.json(result);
  } catch (error) {
    logger.error('Get notifications error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.markNotificationRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const result = await messagingService.markNotificationRead(notificationId);
    res.json(result);
  } catch (error) {
    logger.error('Mark notification read error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.markAllNotificationsRead = async (req, res) => {
  try {
    const result = await messagingService.markAllNotificationsRead(req.user.id);
    res.json(result);
  } catch (error) {
    logger.error('Mark all notifications read error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ==========================================
// FORUMS
// ==========================================
exports.createTopic = async (req, res) => {
  try {
    const { centerId, title, description, testId } = req.body;
    const result = await forumService.createTopic(req.user.id, centerId, title, description, testId);
    res.json(result);
  } catch (error) {
    logger.error('Create topic error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getTopics = async (req, res) => {
  try {
    const { centerId } = req.params;
    const { testId } = req.query;
    const result = await forumService.getTopics(centerId, testId);
    res.json(result);
  } catch (error) {
    logger.error('Get topics error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getTopic = async (req, res) => {
  try {
    const { topicId } = req.params;
    const result = await forumService.getTopic(topicId);
    res.json(result);
  } catch (error) {
    logger.error('Get topic error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.createPost = async (req, res) => {
  try {
    const { topicId, content, parentPostId } = req.body;
    const result = await forumService.createPost(req.user.id, topicId, content, parentPostId);
    res.json(result);
  } catch (error) {
    logger.error('Create post error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.likePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const result = await forumService.likePost(req.user.id, postId);
    res.json(result);
  } catch (error) {
    logger.error('Like post error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.markAsSolution = async (req, res) => {
  try {
    const { postId, topicId } = req.body;
    const result = await forumService.markAsSolution(postId, topicId);
    res.json(result);
  } catch (error) {
    logger.error('Mark as solution error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = exports;