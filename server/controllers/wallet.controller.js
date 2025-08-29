const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const TransactionService = require('../services/transaction.service');

// GET /api/wallet/balance
exports.getBalance = async (req, res) => {
  try {
    const userId = req.user.id;
    const balance = await Wallet.getBalance(userId);
    
    res.json({
      success: true,
      data: { balance }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// POST /api/wallet/fund
exports.fundWallet = async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount, paymentMethod = 'card' } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid amount'
      });
    }

    // Simplified funding - just add to balance
    const currentBalance = await Wallet.getBalance(userId);
    const newBalance = currentBalance + parseFloat(amount);
    await Wallet.updateBalance(userId, newBalance);

    // Create simple transaction record
    const transaction = {
      id: Date.now().toString(),
      amount: parseFloat(amount),
      type: 'credit',
      description: `Wallet funded via ${paymentMethod}`,
      status: 'completed',
      createdAt: new Date().toISOString()
    };

    res.json({
      success: true,
      data: {
        newBalance,
        transaction
      },
      message: 'Wallet funded successfully'
    });
  } catch (error) {
    console.error('Wallet funding error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fund wallet'
    });
  }
};

// POST /api/wallet/deduct
exports.deductFromWallet = async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount, description = 'Payment' } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid amount'
      });
    }

    const result = await Wallet.deductFunds(userId, parseFloat(amount), description);

    // Record transaction
    await TransactionService.recordTransaction(userId, {
      type: 'debit',
      amount: parseFloat(amount),
      description,
      status: 'completed',
      category: 'payment'
    });

    res.json({
      success: true,
      data: {
        newBalance: result.newBalance,
        transaction: result.transaction
      },
      message: 'Payment processed successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// GET /api/wallet/transactions
exports.getTransactions = async (req, res) => {
  try {
    const userId = req.user.id;
    const transactions = await Transaction.findByUserId(userId);
    
    res.json({
      success: true,
      data: transactions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// GET /api/wallet/stats
exports.getStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const [balance, stats] = await Promise.all([
      Wallet.getBalance(userId),
      Transaction.getUserStats(userId)
    ]);
    
    res.json({
      success: true,
      data: {
        balance,
        ...stats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};