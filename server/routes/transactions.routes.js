const express = require('express');
const router = express.Router();
const transactionsController = require('../controllers/transactions.controller');
const { requireAuth } = require('../middleware/supabaseAuth');

// Apply authentication middleware to all routes
router.use(requireAuth);

// User transaction routes
router.get('/', transactionsController.getUserTransactions);
router.post('/', transactionsController.createTransaction);
router.get('/stats', transactionsController.getTransactionStats);
router.get('/:id', transactionsController.getTransaction);
router.put('/:id', transactionsController.updateTransaction);
router.delete('/:id', transactionsController.deleteTransaction);

module.exports = router;