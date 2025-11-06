const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authenticate');
const TransactionService = require('../services/transaction.service');

// Require authentication for all service routes
router.use(authenticate);

// JAMB Services
router.post('/jamb/purchase', async (req, res) => {
  try {
    const { serviceType, amount } = req.body;
    
    await TransactionService.recordServicePurchase(req.user.id, {
      serviceName: 'JAMB Service',
      amount: parseFloat(amount),
      category: 'jamb_services',
      serviceType,
      description: `JAMB ${serviceType} purchase`
    });
    
    res.json({ success: true, message: 'Service purchased successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// O-Level Services
router.post('/olevel/purchase', async (req, res) => {
  try {
    const { serviceType, amount } = req.body;
    
    await TransactionService.recordServicePurchase(req.user.id, {
      serviceName: 'O-Level Service',
      amount: parseFloat(amount),
      category: 'olevel_services',
      serviceType,
      description: `O-Level ${serviceType} purchase`
    });
    
    res.json({ success: true, message: 'Service purchased successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// AI Examiner Services
router.post('/ai-examiner/purchase', async (req, res) => {
  try {
    const { serviceType, amount } = req.body;
    
    await TransactionService.recordServicePurchase(req.user.id, {
      serviceName: 'AI Examiner',
      amount: parseFloat(amount),
      category: 'ai_services',
      serviceType,
      description: `AI Examiner ${serviceType} purchase`
    });
    
    res.json({ success: true, message: 'Service purchased successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;