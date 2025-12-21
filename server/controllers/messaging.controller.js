const messagingService = require('../services/messaging.service');
const forumService = require('../services/forum.service');
const { logger } = require('../utils/logger');

// Messages
exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, messageText, centerId, attachments } = req.body;
    const result = await messagingService.sendMessage(req.user.id, receiverId, messageText, centerId, attachments);
    res.json(result);
  } catch (error) {
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
    const { partnerId } = req.params;
    const result = await messagingService.getMessages(req.user.id, partnerId);
    res.json(result);
  } catch (error) {
    logger.error('Get messages error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Announcements
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

// Notifications
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

// Forums
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
