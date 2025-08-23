const Transaction = require('../models/Transaction');
const supabase = require('../supabaseClient');

// GET /api/transactions - Get user's transactions
exports.getUserTransactions = async (req, res) => {
  try {
    const userId = req.user.id;
    const transactions = await Transaction.findByUserId(userId);
    
    res.json({
      success: true,
      data: transactions,
      count: transactions.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// POST /api/transactions - Create new transaction
exports.createTransaction = async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount, type, description, metadata } = req.body;

    if (!amount || !type) {
      return res.status(400).json({
        success: false,
        message: 'Amount and type are required'
      });
    }

    const transaction = await Transaction.create({
      amount,
      type,
      description,
      metadata,
      status: 'pending'
    }, userId);

    res.status(201).json({
      success: true,
      data: transaction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// GET /api/transactions/:id - Get specific transaction
exports.getTransaction = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    
    const transaction = await Transaction.findById(id);
    
    if (!transaction || transaction.userId !== userId) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    res.json({
      success: true,
      data: transaction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// PUT /api/transactions/:id - Update transaction
exports.updateTransaction = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const updateData = req.body;

    const transaction = await Transaction.update(id, updateData, userId);
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    res.json({
      success: true,
      data: transaction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// DELETE /api/transactions/:id - Delete transaction
exports.deleteTransaction = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const deleted = await Transaction.delete(id, userId);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    res.json({
      success: true,
      message: 'Transaction deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// GET /api/transactions/stats - Get user's transaction stats
exports.getTransactionStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const transactions = await Transaction.findByUserId(userId);
    
    const stats = {
      total: transactions.length,
      completed: transactions.filter(t => t.status === 'completed').length,
      pending: transactions.filter(t => t.status === 'pending').length,
      failed: transactions.filter(t => t.status === 'failed').length,
      totalAmount: transactions
        .filter(t => t.status === 'completed')
        .reduce((sum, t) => sum + t.amount, 0),
      thisMonth: transactions.filter(t => {
        const transactionDate = new Date(t.createdAt);
        const now = new Date();
        return transactionDate.getMonth() === now.getMonth() && 
               transactionDate.getFullYear() === now.getFullYear();
      }).length
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};