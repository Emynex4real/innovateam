const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhook.controller');

// Paystack webhook - no auth, no CSRF (verified by signature)
router.post('/paystack', webhookController.handlePaystack);

module.exports = router;
