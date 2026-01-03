/**
 * Phase 2 Routes - Messaging, Forums, Study Groups, Peer Tutoring
 */

const express = require('express');
const router = express.Router();

// Import Services
const messagingService = require('../services/messaging.service');
const forumsService = require('../services/forums.service'); // ✅ FIXED: Using correct service
const studyGroupsService = require('../services/studyGroupsService');
const peerTutoringService = require('../services/peerTutoringService');
const { NotificationsService, GamificationService } = require('../services/notificationsGamificationService');

const { authenticate } = require('../middleware/auth'); // Check if your middleware is named 'authenticate' or 'authenticateToken'

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
  const result = await messagingService.getMessages(req.user.id, conversationId); // Adjusted arg order if needed
  res.json(result);
});

// Send message
router.post('/messaging/messages', authenticate, async (req, res) => {
  const { conversationId, receiverId, messageText, mediaUrl, mediaType } = req.body;
  // Passing 4th arg conversationId correctly
  const result = await messagingService.sendMessage(req.user.id, receiverId, messageText, conversationId, []); 
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

// ============================================
// FORUMS ROUTES (ENHANCED)
// ============================================

// Get categories
router.get('/forums/categories/:centerId', authenticate, async (req, res) => {
  try {
    const { centerId } = req.params;
    if (!centerId || centerId === 'undefined') {
      return res.status(400).json({ success: false, error: 'Invalid center ID' });
    }
    const result = await forumsService.getCategories(centerId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get user's center for forum access
router.get('/forums/user-center', authenticate, async (req, res) => {
  try {
    const result = await forumsService.getUserCenter(req.user.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get threads in category
router.get('/forums/categories/:categoryId/threads', authenticate, async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const result = await forumsService.getThreads(
      categoryId, 
      parseInt(page), 
      Math.min(parseInt(limit), 50) // Max 50 per page
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get thread with posts
router.get('/forums/threads/:threadId', authenticate, async (req, res) => {
  try {
    const { threadId } = req.params;
    const result = await forumsService.getThread(threadId, req.user.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create thread
router.post('/forums/threads', authenticate, async (req, res) => {
  try {
    const { categoryId, centerId, title, description, tags } = req.body;
    
    console.log('📝 Create thread request:', { categoryId, centerId, title: title?.substring(0, 50), description: description?.substring(0, 50), userId: req.user.id });
    
    // Validation
    if (!title?.trim() || title.length < 10) {
      console.log('❌ Title validation failed');
      return res.status(400).json({ 
        success: false, 
        error: 'Title must be at least 10 characters' 
      });
    }
    if (!description?.trim() || description.length < 20) {
      console.log('❌ Description validation failed');
      return res.status(400).json({ 
        success: false, 
        error: 'Description must be at least 20 characters' 
      });
    }
    
    const result = await forumsService.createThread(
      categoryId, 
      centerId, 
      req.user.id, 
      title, 
      description,
      tags
    );
    
    console.log('✅ Thread creation result:', result.success);
    res.json(result);
  } catch (error) {
    console.error('❌ Thread creation error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create post in thread
router.post('/forums/threads/:threadId/posts', authenticate, async (req, res) => {
  try {
    const { threadId } = req.params;
    const { content, parentPostId } = req.body;
    
    if (!content?.trim() || content.length < 5) {
      return res.status(400).json({ 
        success: false, 
        error: 'Post must be at least 5 characters' 
      });
    }
    
    const result = await forumsService.createPost(threadId, req.user.id, content, parentPostId);
    
    if (!result.success) {
      console.error('❌ Post creation failed:', result.error);
      return res.status(500).json(result);
    }
    
    res.json(result);
  } catch (error) {
    console.error('❌ Post creation exception:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Vote on post
router.post('/forums/posts/:postId/vote', authenticate, async (req, res) => {
  try {
    const { postId } = req.params;
    const { voteType } = req.body;
    
    if (!['upvote', 'downvote'].includes(voteType)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid vote type' 
      });
    }
    
    const result = await forumsService.votePost(postId, req.user.id, voteType);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Mark post as answer
router.post('/forums/posts/:postId/mark-answer', authenticate, async (req, res) => {
  try {
    const { postId } = req.params;
    const { threadId } = req.body;
    const result = await forumsService.markAsAnswer(postId, threadId, req.user.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Search threads
router.get('/forums/search/:centerId', authenticate, async (req, res) => {
  try {
    const { centerId } = req.params;
    const { q, page = 1, limit = 20 } = req.query;
    
    if (!q?.trim()) {
      return res.status(400).json({ 
        success: false, 
        error: 'Search query is required' 
      });
    }
    
    const result = await forumsService.searchThreads(
      centerId, 
      q, 
      parseInt(page), 
      Math.min(parseInt(limit), 50)
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Follow/Unfollow thread (NEW FEATURE)
router.post('/forums/threads/:threadId/follow', authenticate, async (req, res) => {
  try {
    const { threadId } = req.params;
    const result = await forumsService.followThread(threadId, req.user.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/forums/threads/:threadId/unfollow', authenticate, async (req, res) => {
  try {
    const { threadId } = req.params;
    const result = await forumsService.unfollowThread(threadId, req.user.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// STUDY GROUPS ROUTES (Updated for your Service)
// ============================================

// IMPORTANT: Specific routes MUST come before parameterized routes

// 1a. Get ALL groups (Explore Tab - no center filter)
router.get('/study-groups/all/explore', authenticate, async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  console.log('🔍 Explore: Fetching ALL groups');
  const result = await studyGroupsService.getGroups(null, req.user.id, parseInt(page), parseInt(limit));
  console.log('🔍 Explore: Result:', result);
  res.json(result);
});

// 2. Get user's groups (My Groups Tab)
router.get('/study-groups/user/my-groups', authenticate, async (req, res) => {
  const result = await studyGroupsService.getUserGroups(req.user.id);
  res.json(result);
});

// 3. Search groups
router.get('/study-groups/search/:centerId', authenticate, async (req, res) => {
  const { centerId } = req.params;
  const { q, page = 1, limit = 20 } = req.query;
  const result = await studyGroupsService.searchGroups(centerId, q, parseInt(page), parseInt(limit));
  res.json(result);
});

// 4. Get group detail
router.get('/study-groups/:groupId/detail', authenticate, async (req, res) => {
  const { groupId } = req.params;
  const result = await studyGroupsService.getGroupDetail(groupId, req.user.id);
  res.json(result);
});

// 1b. Get groups by center (Explore Tab - with center filter) - MUST be last
router.get('/study-groups/:centerId', authenticate, async (req, res) => {
  const { centerId } = req.params;
  const { page = 1, limit = 20 } = req.query;
  console.log('🔍 Explore: Fetching groups for centerId:', centerId);
  const result = await studyGroupsService.getGroups(centerId, req.user.id, parseInt(page), parseInt(limit));
  console.log('🔍 Explore: Result:', result);
  res.json(result);
});

// 5. Create group
router.post('/study-groups', authenticate, async (req, res) => {
  console.log('🔵 Backend received create group request');
  console.log('🔵 User from auth:', req.user);
  console.log('🔵 Request body:', req.body);
  
  const { centerId, name, description, topic, subject, imageUrl } = req.body;
  
  console.log('🔵 Extracted values:', { centerId, name, description, topic, subject, imageUrl });
  
  const result = await studyGroupsService.createGroup(centerId, req.user.id, name, description, topic, subject, imageUrl);
  
  console.log('🔵 Service result:', result);
  
  res.json(result);
});

// 6. Join group
router.post('/study-groups/:groupId/join', authenticate, async (req, res) => {
  const { groupId } = req.params;
  const result = await studyGroupsService.joinGroup(groupId, req.user.id);
  res.json(result);
});

// 7. Leave group
router.post('/study-groups/:groupId/leave', authenticate, async (req, res) => {
  const { groupId } = req.params;
  const result = await studyGroupsService.leaveGroup(groupId, req.user.id);
  res.json(result);
});

// 8. Post in group
router.post('/study-groups/:groupId/posts', authenticate, async (req, res) => {
  const { groupId } = req.params;
  const { content, attachmentUrl, resourceType = 'discussion' } = req.body;
  const result = await studyGroupsService.postInGroup(groupId, req.user.id, content, attachmentUrl, resourceType);
  res.json(result);
});

// 9. Delete group
router.delete('/study-groups/:groupId', authenticate, async (req, res) => {
  const { groupId } = req.params;
  const result = await studyGroupsService.deleteGroup(groupId, req.user.id);
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

// ============================================
// TEST ROUTE - Remove in production
// ============================================
router.post('/test-notification', authenticate, async (req, res) => {
  try {
    const notificationHelper = require('../services/notificationHelper');
    console.log('🧪 Creating test notification for user:', req.user.id);
    
    await notificationHelper.create(
      req.user.id,
      'info',
      'Test Notification',
      'This is a test notification to verify the system is working',
      '/dashboard'
    );
    
    console.log('✅ Test notification created successfully');
    res.json({ success: true, message: 'Test notification created' });
  } catch (error) {
    console.error('❌ Error creating test notification:', error);
    res.json({ success: false, error: error.message });
  }
});

module.exports = router;

// ============================================
// NEW FORUM ENDPOINTS - Industry Standard Features
// ============================================

// Edit post
router.put('/forums/posts/:postId', authenticate, async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    if (!content?.trim() || content.length < 5) {
      return res.status(400).json({ success: false, error: 'Post must be at least 5 characters' });
    }

    const { data: post } = await require('../supabaseClient')
      .from('forum_posts')
      .select('author_id')
      .eq('id', postId)
      .single();

    if (!post || post.author_id !== userId) {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    const { data, error } = await require('../supabaseClient')
      .from('forum_posts')
      .update({ content, is_edited: true, edited_at: new Date().toISOString() })
      .eq('id', postId)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete post
router.delete('/forums/posts/:postId', authenticate, async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    const { data: post } = await require('../supabaseClient')
      .from('forum_posts')
      .select('author_id')
      .eq('id', postId)
      .single();

    if (!post || (post.author_id !== userId && !req.user.isAdmin)) {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    const { error } = await require('../supabaseClient')
      .from('forum_posts')
      .update({ is_deleted: true })
      .eq('id', postId);

    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete thread
router.delete('/forums/threads/:threadId', authenticate, async (req, res) => {
  try {
    const { threadId } = req.params;
    const userId = req.user.id;

    const { data: thread } = await require('../supabaseClient')
      .from('forum_threads')
      .select('creator_id')
      .eq('id', threadId)
      .single();

    if (!thread || (thread.creator_id !== userId && !req.user.isAdmin)) {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    const { error } = await require('../supabaseClient')
      .from('forum_threads')
      .delete()
      .eq('id', threadId);

    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Bookmark post
router.post('/forums/posts/:postId/bookmark', authenticate, async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;
    const supabase = require('../supabaseClient');

    const { data: existing } = await supabase
      .from('forum_post_bookmarks')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single();

    if (existing) {
      await supabase.from('forum_post_bookmarks').delete().eq('id', existing.id);
      return res.json({ success: true, bookmarked: false });
    }

    await supabase.from('forum_post_bookmarks').insert({ post_id: postId, user_id: userId });
    res.json({ success: true, bookmarked: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Report post
router.post('/forums/posts/:postId/report', authenticate, async (req, res) => {
  try {
    const { postId } = req.params;
    const { reason } = req.body;
    const userId = req.user.id;

    if (!reason?.trim()) {
      return res.status(400).json({ success: false, error: 'Reason is required' });
    }

    const { data, error } = await require('../supabaseClient')
      .from('forum_post_reports')
      .insert({ post_id: postId, reporter_id: userId, reason })
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get leaderboard
router.get('/forums/leaderboard', authenticate, async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const result = await forumsService.getLeaderboard(parseInt(limit));
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get user badges
router.get('/forums/badges/:userId', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await forumsService.getUserBadges(userId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get user stats (XP, level, rank)
router.get('/forums/stats/:userId', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await forumsService.getUserStats(userId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
