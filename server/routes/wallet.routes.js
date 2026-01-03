const express = require('express');
const router = express.Router();
const walletController = require('../controllers/wallet.controller');
const { authenticate } = require('../middleware/authenticate');
const { financialLimiter, userLimiter } = require('../middleware/advancedRateLimiter');

// Apply authentication to all wallet routes
router.use(authenticate);

// Wallet routes with rate limiting
router.get('/balance', userLimiter(100), walletController.getBalance);
router.post('/fund', financialLimiter, walletController.fundWallet);
router.post('/deduct', financialLimiter, walletController.deductFromWallet);
router.get('/transactions', userLimiter(50), walletController.getTransactions);
router.get('/stats', userLimiter(50), walletController.getStats);

module.exports = router;