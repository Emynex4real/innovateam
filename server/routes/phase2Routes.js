/**
 * Phase 2 Routes - Messaging, Forums, Study Groups, Peer Tutoring
 */

const express = require('express');
const router = express.Router();
const messagingService = require('../services/messagingService');
const forumsService = require('../services/forumsService');
const studyGroupsService = require('../services/studyGroupsService');
const peerTutoringService = require('../services/peerTutoringService');
const { NotificationsService, GamificationService } = require('../services/notificationsGamificationService');
const { authenticate } = require('../middleware/auth');
const { logger } = require('../utils/logger');

// ============================================
// MESSAGING ROUTES
// ============================================

// Get conversations
router.get('/messaging/conversations', authenticate, async (req, res) => {
  const result = await messagingService.getConversations(req.user.id);
  res.json(result);
});

// Get messages from conversation
router.get('/messaging/conversations/:conversationId', authenticate, async (req, res) => {
  const { conversationId } = req.params;
  const { limit = 50, offset = 0 } = req.query;
  const result = await messagingService.getMessages(conversationId, req.user.id, parseInt(limit), parseInt(offset));
  res.json(result);
});

// Send message
router.post('/messaging/messages', authenticate, async (req, res) => {
  const { conversationId, receiverId, messageText, mediaUrl, mediaType } = req.body;
  const result = await messagingService.sendMessage(conversationId, req.user.id, receiverId, messageText, mediaUrl, mediaType);
  res.json(result);
});

// Mark messages as read
router.post('/messaging/messages/read/:conversationId', authenticate, async (req, res) => {
  const { conversationId } = req.params;
  const result = await messagingService.markMessagesAsRead(conversationId, req.user.id);
  res.json(result);
});

// Delete message
router.delete('/messaging/messages/:messageId', authenticate, async (req, res) => {
  const { messageId } = req.params;
  const result = await messagingService.deleteMessage(messageId, req.user.id);
  res.json(result);
});

// Start conversation
router.post('/messaging/conversations', authenticate, async (req, res) => {
  const { otherUserId, centerId } = req.body;
  const result = await messagingService.startConversation(req.user.id, otherUserId, centerId);
  res.json(result);
});

// ============================================
// FORUMS ROUTES
// ============================================

// Get categories
router.get('/forums/categories/:centerId', authenticate, async (req, res) => {
  const { centerId } = req.params;
  const result = await forumsService.getCategories(centerId);
  res.json(result);
});

// Get threads in category
router.get('/forums/categories/:categoryId/threads', authenticate, async (req, res) => {
  const { categoryId } = req.params;
  const { page = 1, limit = 20 } = req.query;
  const result = await forumsService.getThreads(categoryId, parseInt(page), parseInt(limit));
  res.json(result);
});

// Get thread with posts
router.get('/forums/threads/:threadId', authenticate, async (req, res) => {
  const { threadId } = req.params;
  const result = await forumsService.getThread(threadId, req.user.id);
  res.json(result);
});

// Create thread
router.post('/forums/threads', authenticate, async (req, res) => {
  const { categoryId, centerId, title, description } = req.body;
  const result = await forumsService.createThread(categoryId, centerId, req.user.id, title, description);
  res.json(result);
});

// Create post in thread
router.post('/forums/threads/:threadId/posts', authenticate, async (req, res) => {
  const { threadId } = req.params;
  const { content, parentPostId } = req.body;
  const result = await forumsService.createPost(threadId, req.user.id, content, parentPostId);
  res.json(result);
});

// Vote on post
router.post('/forums/posts/:postId/vote', authenticate, async (req, res) => {
  const { postId } = req.params;
  const { voteType } = req.body;
  const result = await forumsService.votePost(postId, req.user.id, voteType);
  res.json(result);
});

// Mark post as answer
router.post('/forums/posts/:postId/mark-answer', authenticate, async (req, res) => {
  const { postId } = req.params;
  const { threadId } = req.body;
  const result = await forumsService.markAsAnswer(postId, threadId, req.user.id);
  res.json(result);
});

// Search threads
router.get('/forums/search/:centerId', authenticate, async (req, res) => {
  const { centerId } = req.params;
  const { query, page = 1, limit = 20 } = req.query;
  const result = await forumsService.searchThreads(centerId, query, parseInt(page), parseInt(limit));
  res.json(result);
});

// ============================================
// STUDY GROUPS ROUTES
// ============================================

// Get groups
router.get('/study-groups/:centerId', authenticate, async (req, res) => {
  const { centerId } = req.params;
  const { page = 1, limit = 20 } = req.query;
  const result = await studyGroupsService.getGroups(centerId, req.user.id, parseInt(page), parseInt(limit));
  res.json(result);
});

// Get user's groups
router.get('/study-groups/user/my-groups', authenticate, async (req, res) => {
  const result = await studyGroupsService.getUserGroups(req.user.id);
  res.json(result);
});

// Get group detail
router.get('/study-groups/:groupId/detail', authenticate, async (req, res) => {
  const { groupId } = req.params;
  const result = await studyGroupsService.getGroupDetail(groupId, req.user.id);
  res.json(result);
});

// Create group
router.post('/study-groups', authenticate, async (req, res) => {
  const { centerId, name, description, topic, subject, imageUrl } = req.body;
  const result = await studyGroupsService.createGroup(centerId, req.user.id, name, description, topic, subject, imageUrl);
  res.json(result);
});

// Join group
router.post('/study-groups/:groupId/join', authenticate, async (req, res) => {
  const { groupId } = req.params;
  const result = await studyGroupsService.joinGroup(groupId, req.user.id);
  res.json(result);
});

// Leave group
router.post('/study-groups/:groupId/leave', authenticate, async (req, res) => {
  const { groupId } = req.params;
  const result = await studyGroupsService.leaveGroup(groupId, req.user.id);
  res.json(result);
});

// Post in group
router.post('/study-groups/:groupId/posts', authenticate, async (req, res) => {
  const { groupId } = req.params;
  const { content, attachmentUrl, resourceType = 'discussion' } = req.body;
  const result = await studyGroupsService.postInGroup(groupId, req.user.id, content, attachmentUrl, resourceType);
  res.json(result);
});

// Search groups
router.get('/study-groups/search/:centerId', authenticate, async (req, res) => {
  const { centerId } = req.params;
  const { query, page = 1, limit = 20 } = req.query;
  const result = await studyGroupsService.searchGroups(centerId, query, parseInt(page), parseInt(limit));
  res.json(result);
});

// ============================================
// PEER TUTORING ROUTES
// ============================================

// Get available tutors
router.get('/tutoring/tutors/:centerId', authenticate, async (req, res) => {
  const { centerId } = req.params;
  const { subject, page = 1, limit = 20 } = req.query;
  const result = await peerTutoringService.getTutors(centerId, subject, parseInt(page), parseInt(limit));
  res.json(result);
});

// Get tutor profile
router.get('/tutoring/tutors/:tutorId/profile', authenticate, async (req, res) => {
  const { tutorId } = req.params;
  const result = await peerTutoringService.getTutorProfile(tutorId);
  res.json(result);
});

// Create tutor profile
router.post('/tutoring/profile', authenticate, async (req, res) => {
  const { centerId, bio, hourlyRate, subjects, experienceYears, certificationUrl } = req.body;
  const result = await peerTutoringService.createTutorProfile(req.user.id, centerId, bio, hourlyRate, subjects, experienceYears, certificationUrl);
  res.json(result);
});

// Request tutoring
router.post('/tutoring/requests', authenticate, async (req, res) => {
  const { tutorId, centerId, subject, topic, description, preferredStartDate, preferredTimeSlots, estimatedHours } = req.body;
  const result = await peerTutoringService.requestTutoring(req.user.id, tutorId, centerId, subject, topic, description, preferredStartDate, preferredTimeSlots, estimatedHours);
  res.json(result);
});

// Accept tutoring request
router.post('/tutoring/requests/:requestId/accept', authenticate, async (req, res) => {
  const { requestId } = req.params;
  const result = await peerTutoringService.acceptTutoringRequest(requestId, req.user.id);
  res.json(result);
});

// Decline tutoring request
router.post('/tutoring/requests/:requestId/decline', authenticate, async (req, res) => {
  const { requestId } = req.params;
  const result = await peerTutoringService.declineTutoringRequest(requestId, req.user.id);
  res.json(result);
});

// Schedule session
router.post('/tutoring/sessions', authenticate, async (req, res) => {
  const { requestId, scheduledAt, meetingLink } = req.body;
  const result = await peerTutoringService.scheduleSession(requestId, scheduledAt, meetingLink);
  res.json(result);
});

// Complete session
router.post('/tutoring/sessions/:sessionId/complete', authenticate, async (req, res) => {
  const { sessionId } = req.params;
  const { rating, feedback } = req.body;
  const result = await peerTutoringService.completeSession(sessionId, req.user.id, rating, feedback);
  res.json(result);
});

// Get student sessions
router.get('/tutoring/sessions', authenticate, async (req, res) => {
  const result = await peerTutoringService.getStudentSessions(req.user.id);
  res.json(result);
});

// ============================================
// NOTIFICATIONS ROUTES
// ============================================

// Get notifications
router.get('/notifications', authenticate, async (req, res) => {
  const { unreadOnly = false, limit = 20 } = req.query;
  const result = await NotificationsService.getNotifications(req.user.id, unreadOnly === 'true', parseInt(limit));
  res.json(result);
});

// Get unread count
router.get('/notifications/count', authenticate, async (req, res) => {
  const result = await NotificationsService.getUnreadCount(req.user.id);
  res.json(result);
});

// Mark notification as read
router.post('/notifications/:notificationId/read', authenticate, async (req, res) => {
  const { notificationId } = req.params;
  const result = await NotificationsService.markAsRead(notificationId);
  res.json(result);
});

// Mark all as read
router.post('/notifications/mark-all-read', authenticate, async (req, res) => {
  const result = await NotificationsService.markAllAsRead(req.user.id);
  res.json(result);
});

// ============================================
// GAMIFICATION ROUTES
// ============================================

// Get user badges
router.get('/gamification/badges/:centerId', authenticate, async (req, res) => {
  const { centerId } = req.params;
  const result = await GamificationService.getUserBadges(req.user.id, centerId);
  res.json(result);
});

// Get leaderboard
router.get('/gamification/leaderboard/:centerId', authenticate, async (req, res) => {
  const { centerId } = req.params;
  const { period = 'global', limit = 20 } = req.query;
  const result = await GamificationService.getLeaderboard(centerId, period, parseInt(limit));
  res.json(result);
});

// Get user rank
router.get('/gamification/rank/:centerId', authenticate, async (req, res) => {
  const { centerId } = req.params;
  const { period = 'global' } = req.query;
  const result = await GamificationService.getUserRank(req.user.id, centerId, period);
  res.json(result);
});

// Get achievements summary
router.get('/gamification/achievements/:centerId', authenticate, async (req, res) => {
  const { centerId } = req.params;
  const result = await GamificationService.getAchievementsSummary(req.user.id, centerId);
  res.json(result);
});

module.exports = router;
