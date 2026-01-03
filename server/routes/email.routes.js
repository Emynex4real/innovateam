const express = require('express');
const router = express.Router();
const emailService = require('../services/email.service');
const { authenticate } = require('../middleware/authenticate');

// Send welcome email
router.post('/welcome', authenticate, async (req, res) => {
  try {
    const { userEmail, userName } = req.body;
    
    if (!userEmail || !userName) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email and name are required' 
      });
    }

    const result = await emailService.sendWelcomeEmail(userEmail, userName);
    res.json(result);
  } catch (error) {
    console.error('Welcome email route error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to send welcome email' 
    });
  }
});

// Send transaction email
router.post('/transaction', authenticate, async (req, res) => {
  try {
    const { userEmail, userName, transaction } = req.body;
    
    if (!userEmail || !userName || !transaction) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email, name, and transaction details are required' 
      });
    }

    const result = await emailService.sendTransactionEmail(userEmail, userName, transaction);
    res.json(result);
  } catch (error) {
    console.error('Transaction email route error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to send transaction email' 
    });
  }
});

// Send credit approval email
router.post('/credit-approval', authenticate, async (req, res) => {
  try {
    const { userEmail, userName, amount, approved } = req.body;
    
    if (!userEmail || !userName || amount === undefined || approved === undefined) {
      return res.status(400).json({ 
        success: false, 
        error: 'All fields are required' 
      });
    }

    const result = await emailService.sendCreditApprovalEmail(userEmail, userName, amount, approved);
    res.json(result);
  } catch (error) {
    console.error('Credit approval email route error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to send credit approval email' 
    });
  }
});

// Send password reset email
router.post('/password-reset', async (req, res) => {
  try {
    const { userEmail, resetLink } = req.body;
    
    if (!userEmail || !resetLink) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email and reset link are required' 
      });
    }

    const result = await emailService.sendPasswordResetEmail(userEmail, resetLink);
    res.json(result);
  } catch (error) {
    console.error('Password reset email route error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to send password reset email' 
    });
  }
});

// Send low balance alert
router.post('/low-balance', authenticate, async (req, res) => {
  try {
    const { userEmail, userName, balance } = req.body;
    
    if (!userEmail || !userName || balance === undefined) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email, name, and balance are required' 
      });
    }

    const result = await emailService.sendLowBalanceAlert(userEmail, userName, balance);
    res.json(result);
  } catch (error) {
    console.error('Low balance email route error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to send low balance alert' 
    });
  }
});

module.exports = router;