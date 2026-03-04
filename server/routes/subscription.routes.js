const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/authenticate");
const { cacheMiddleware } = require("../middleware/cache");
const subscriptionController = require("../controllers/subscription.controller");

// Public routes
router.get(
  "/plans",
  cacheMiddleware(600, true),
  subscriptionController.getPlans,
); // Shared cache 10min - plans rarely change
router.get("/verify/:reference", subscriptionController.verifyPayment);

// Protected routes
router.use(authenticate);
router.get(
  "/my-subscription",
  cacheMiddleware(60),
  subscriptionController.getMySubscription,
); // Cache 60s
router.post("/checkout", subscriptionController.createCheckout);
router.post("/cancel", subscriptionController.cancelSubscription);
router.get("/limits", cacheMiddleware(60), subscriptionController.checkLimits); // Cache 60s
router.get("/earnings", subscriptionController.getEarnings);
router.post("/toggle-auto-renew", subscriptionController.toggleAutoRenew);

module.exports = router;
