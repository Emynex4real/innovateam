const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authenticate');
const subscriptionController = require('../controllers/subscription.controller');

// Public routes
router.get('/plans', subscriptionController.getPlans);
router.get('/verify/:reference', subscriptionController.verifyPayment);

// Protected routes
router.use(authenticate);
router.get('/my-subscription', subscriptionController.getMySubscription);
router.post('/checkout', subscriptionController.createCheckout);
router.post('/cancel', subscriptionController.cancelSubscription);
router.get('/limits', subscriptionController.checkLimits);
router.get('/earnings', subscriptionController.getEarnings);

module.exports = router;
