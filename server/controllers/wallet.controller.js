const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');

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

    const result = await Wallet.addFunds(
      userId, 
      parseFloat(amount), 
      `Wallet funded via ${paymentMethod}`
    );

    res.json({
      success: true,
      data: {
        newBalance: result.newBalance,
        transaction: result.transaction
      },
      message: 'Wallet funded successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
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