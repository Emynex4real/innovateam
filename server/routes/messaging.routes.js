const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/authenticate");
const { cacheMiddleware } = require("../middleware/cache");
const messagingController = require("../controllers/messaging.controller");

// Apply authentication middleware to all routes
router.use(authenticate);

// ==========================================
// MESSAGING ROUTES
// ==========================================

// 1. Start a new conversation
router.post("/conversations", messagingController.startConversation);

// 2. Get all conversations list (cached 15s to reduce polling load)
router.get(
  "/conversations",
  cacheMiddleware(15),
  messagingController.getConversations,
);

// 3. Get messages for a specific conversation
router.get("/conversations/:conversationId", messagingController.getMessages);

// 4. Send a message
router.post("/send", messagingController.sendMessage);

// 5. Direct access fallback removed due to route conflict with /unread-count

// ==========================================
// ANNOUNCEMENT ROUTES
// ==========================================
router.post("/announcements", messagingController.createAnnouncement);
router.get("/announcements/:centerId", messagingController.getAnnouncements);

// ==========================================
// NOTIFICATION ROUTES
// ==========================================
router.get(
  "/notifications",
  cacheMiddleware(30),
  messagingController.getNotifications,
);
router.put(
  "/notifications/:notificationId/read",
  messagingController.markNotificationRead,
);
router.put(
  "/notifications/read-all",
  messagingController.markAllNotificationsRead,
);

// ==========================================
// FORUM ROUTES
// ==========================================
router.post("/forums/topics", messagingController.createTopic);
router.get("/forums/topics/:centerId", messagingController.getTopics);
router.get("/forums/topic/:topicId", messagingController.getTopic);
router.post("/forums/posts", messagingController.createPost);
router.post("/forums/posts/:postId/like", messagingController.likePost);
router.post("/forums/posts/solution", messagingController.markAsSolution);

module.exports = router;
