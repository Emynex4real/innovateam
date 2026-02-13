const https = require('https');
const supabase = require('../supabaseClient');
const { validateAmount } = require('../utils/comprehensiveValidator');
const Transaction = require('../models/Transaction');

// Helper: Paystack API request
function paystackRequest(path, method, body) {
  return new Promise((resolve, reject) => {
    const params = body ? JSON.stringify(body) : '';
    const options = {
      hostname: 'api.paystack.co',
      port: 443,
      path,
      method,
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
        ...(body && { 'Content-Length': Buffer.byteLength(params) })
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch {
          reject(new Error('Invalid Paystack response'));
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(params);
    req.end();
  });
}

// GET /api/wallet/balance
exports.getBalance = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('user_profiles')
      .select('wallet_balance')
      .eq('id', userId)
      .single();

    if (error && error.code === 'PGRST116') {
      return res.json({ success: true, data: { balance: 0 } });
    }

    res.json({
      success: true,
      data: { balance: data?.wallet_balance || 0 }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get balance' });
  }
};

// POST /api/wallet/initialize-payment
exports.initializePayment = async (req, res) => {
  try {
    if (!process.env.PAYSTACK_SECRET_KEY) {
      return res.status(503).json({ success: false, message: 'Payment provider not configured' });
    }

    const userId = req.user.id;
    const { amount } = req.body;

    const validAmount = validateAmount(amount, {
      min: 100,
      max: 1000000,
      allowNegative: false,
      allowDecimals: false,
      fieldName: 'Funding amount'
    });

    const email = req.user.email;
    const callbackUrl = process.env.FRONTEND_URL
      ? `${process.env.FRONTEND_URL}/wallet?funded=true`
      : 'http://localhost:3000/wallet?funded=true';

    const response = await paystackRequest('/transaction/initialize', 'POST', {
      email,
      amount: Math.round(validAmount * 100),
      currency: 'NGN',
      callback_url: callbackUrl,
      metadata: {
        userId,
        type: 'wallet_funding',
        amount: validAmount
      }
    });

    if (!response.status) {
      return res.status(400).json({ success: false, message: response.message || 'Payment initialization failed' });
    }

    res.json({
      success: true,
      data: {
        reference: response.data.reference,
        accessCode: response.data.access_code,
        authorizationUrl: response.data.authorization_url
      }
    });
  } catch (error) {
    console.error('Initialize payment error:', error);
    res.status(500).json({ success: false, message: 'Failed to initialize payment' });
  }
};

// GET /api/wallet/verify-payment/:reference
exports.verifyPayment = async (req, res) => {
  try {
    if (!process.env.PAYSTACK_SECRET_KEY) {
      return res.status(503).json({ success: false, message: 'Payment provider not configured' });
    }

    const { reference } = req.params;
    const userId = req.user.id;

    // Idempotency check
    const alreadyProcessed = await Transaction.findByPaystackReference(reference);
    if (alreadyProcessed) {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('wallet_balance')
        .eq('id', userId)
        .single();

      return res.json({
        success: true,
        message: 'Payment already processed',
        data: { balance: profile?.wallet_balance || 0 }
      });
    }

    // Verify with Paystack
    const response = await paystackRequest(`/transaction/verify/${reference}`, 'GET');

    if (!response.status || response.data.status !== 'success') {
      return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }

    const amountInNaira = response.data.amount / 100;
    const metadata = response.data.metadata || {};

    if (metadata.userId && metadata.userId !== userId) {
      return res.status(403).json({ success: false, message: 'Payment does not belong to this user' });
    }

    // Credit wallet
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('wallet_balance')
      .eq('id', userId)
      .single();

    const newBalance = (profile?.wallet_balance || 0) + amountInNaira;

    await supabase
      .from('user_profiles')
      .update({ wallet_balance: newBalance })
      .eq('id', userId);

    await Transaction.create({
      userId,
      userEmail: req.user.email,
      type: 'credit',
      amount: amountInNaira,
      description: 'Wallet funding via Paystack',
      status: 'successful',
      category: 'wallet_funding',
      reference,
      paystackReference: reference
    });

    res.json({
      success: true,
      message: 'Payment verified and wallet credited',
      data: { balance: newBalance, amount: amountInNaira }
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ success: false, message: 'Failed to verify payment' });
  }
};

// POST /api/wallet/fund (backward compat)
exports.fundWallet = async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount } = req.body;

    const validAmount = validateAmount(amount, {
      min: 1,
      max: 1000000,
      allowNegative: false,
      allowDecimals: true,
      fieldName: 'Funding amount'
    });

    let { data: profile } = await supabase
      .from('user_profiles')
      .select('wallet_balance')
      .eq('id', userId)
      .single();

    const newBalance = (profile?.wallet_balance || 0) + validAmount;

    await supabase
      .from('user_profiles')
      .update({ wallet_balance: newBalance })
      .eq('id', userId);

    res.json({
      success: true,
      data: { newBalance },
      message: 'Wallet funded successfully'
    });
  } catch (error) {
    console.error('Fund wallet error:', error);
    res.status(500).json({ success: false, message: 'Failed to fund wallet' });
  }
};

// POST /api/wallet/deduct
exports.deductFromWallet = async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount } = req.body;

    const validAmount = validateAmount(amount, {
      min: 1,
      max: 1000000,
      allowNegative: false,
      allowDecimals: true,
      fieldName: 'Deduction amount'
    });

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('wallet_balance')
      .eq('id', userId)
      .single();

    const currentBalance = profile?.wallet_balance || 0;

    if (currentBalance < validAmount) {
      return res.status(400).json({ success: false, message: 'Insufficient balance' });
    }

    const newBalance = currentBalance - validAmount;

    await supabase
      .from('user_profiles')
      .update({ wallet_balance: newBalance })
      .eq('id', userId);

    res.json({
      success: true,
      data: { newBalance },
      message: 'Payment processed successfully'
    });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to process payment' });
  }
};

// GET /api/wallet/transactions
exports.getTransactions = async (req, res) => {
  try {
    const userId = req.user.id;
    const transactions = await Transaction.findByUserId(userId, 50);
    res.json({ success: true, data: transactions });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get transactions' });
  }
};

// GET /api/wallet/stats
exports.getStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('wallet_balance')
      .eq('id', userId)
      .single();

    const stats = await Transaction.getUserStats(userId);

    res.json({
      success: true,
      data: {
        balance: profile?.wallet_balance || 0,
        ...stats
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get stats' });
  }
};

// GET /api/wallet/usage
exports.getUsageStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const usageService = require('../services/usage.service');
    const stats = await usageService.getUsageStats(userId);
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get usage stats' });
  }
};
