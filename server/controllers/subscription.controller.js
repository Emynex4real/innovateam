const subscriptionService = require('../services/subscription.service');
const paymentService = require('../services/payment.service');
const logger = require('../utils/logger');

exports.getPlans = async (req, res) => {
  try {
    const result = await subscriptionService.getPlans();
    res.json(result);
  } catch (error) {
    logger.error('Get plans error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getMySubscription = async (req, res) => {
  try {
    const result = await subscriptionService.getTutorSubscription(req.user.id);
    res.json(result);
  } catch (error) {
    logger.error('Get subscription error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.createCheckout = async (req, res) => {
  try {
    const { planId } = req.body;
    const callbackUrl = `${process.env.FRONTEND_URL}/tutor/subscription/success`;
    
    const result = await paymentService.createSubscriptionPayment(
      req.user.id,
      planId,
      callbackUrl
    );
    res.json(result);
  } catch (error) {
    logger.error('Create payment error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.cancelSubscription = async (req, res) => {
  try {
    const result = await subscriptionService.cancelSubscription(req.user.id);
    res.json(result);
  } catch (error) {
    logger.error('Cancel subscription error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.checkLimits = async (req, res) => {
  try {
    const result = await subscriptionService.checkLimits(req.user.id);
    res.json(result);
  } catch (error) {
    logger.error('Check limits error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getEarnings = async (req, res) => {
  try {
    const result = await paymentService.getTutorEarnings(req.user.id);
    res.json(result);
  } catch (error) {
    logger.error('Get earnings error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { reference } = req.params;
    const result = await paymentService.verifyPayment(reference);
    res.json(result);
  } catch (error) {
    logger.error('Payment verification error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = exports;
