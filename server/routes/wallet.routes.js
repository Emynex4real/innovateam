const express = require('express');
const router = express.Router();
const walletController = require('../controllers/wallet.controller');
const { authenticate } = require('../middleware/authenticate');

// Apply authentication to all wallet routes
router.use(authenticate);

// Wallet routes
router.get('/balance', walletController.getBalance);
router.post('/fund', walletController.fundWallet);
router.post('/deduct', walletController.deductFromWallet);
router.get('/transactions', walletController.getTransactions);
router.get('/stats', walletController.getStats);

module.exports = router;