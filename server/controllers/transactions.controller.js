const fs = require('fs').promises;
const path = require('path');
const { logger } = require('../utils/logger');

const transactionsFile = path.join(__dirname, '../data/transactions.json');

/**
 * Get all transactions (admin only)
 * @route GET /api/admin/transactions
 * @access Private/Admin
 */
exports.getTransactions = async (req, res) => {
  try {
    // Verify user is authenticated and is admin
    if (!req.user || req.user.role !== 'admin') {
      logger.warn('Unauthorized access to transactions', { 
        userId: req.user?.id,
        role: req.user?.role,
        path: req.path 
      });
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Admin privileges required.' 
      });
    }

    logger.info('Fetching transactions', { 
      userId: req.user.id,
      email: req.user.email 
    });

    // Read transactions from file
    const data = await fs.readFile(transactionsFile, 'utf8');
    const transactions = JSON.parse(data);

    // Log success (without exposing sensitive data)
    logger.info('Successfully retrieved transactions', { 
      count: transactions.length,
      userId: req.user.id
    });

    // Return transactions
    res.json({ 
      success: true, 
      transactions 
    });

  } catch (error) {
    logger.error('Error fetching transactions:', {
      error: error.message,
      stack: error.stack,
      userId: req.user?.id
    });
    
    // If file doesn't exist, return empty array instead of error
    if (error.code === 'ENOENT') {
      logger.warn('Transactions file not found, returning empty array');
      return res.json({ success: true, transactions: [] });
    }
    
    // For other errors, return 500
    res.status(500).json({ 
      success: false, 
      message: 'Failed to retrieve transactions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
