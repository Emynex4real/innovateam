const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authenticate');
const messagingController = require('../controllers/messaging.controller');

router.use(authenticate);

// Messages
router.post('/send', messagingController.sendMessage);
router.get('/conversations', messagingController.getConversations);
router.get('/:partnerId', messagingController.getMessages);

// Announcements
router.post('/announcements', messagingController.createAnnouncement);
router.get('/announcements/:centerId', messagingController.getAnnouncements);

// Notifications
router.get('/notifications', messagingController.getNotifications);
router.put('/notifications/:notificationId/read', messagingController.markNotificationRead);
router.put('/notifications/read-all', messagingController.markAllNotificationsRead);

// Forums
router.post('/forums/topics', messagingController.createTopic);
router.get('/forums/topics/:centerId', messagingController.getTopics);
router.get('/forums/topic/:topicId', messagingController.getTopic);
router.post('/forums/posts', messagingController.createPost);
router.post('/forums/posts/:postId/like', messagingController.likePost);
router.post('/forums/posts/solution', messagingController.markAsSolution);

module.exports = router;
