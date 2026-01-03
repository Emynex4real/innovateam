const supabase = require('../supabaseClient');
const { validateAmount } = require('../utils/comprehensiveValidator');

// GET /api/wallet/balance
exports.getBalance = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const { data, error } = await supabase
      .from('users')
      .select('wallet_balance')
      .eq('id', userId)
      .single();

    if (error && error.code === 'PGRST116') {
      // User doesn't exist, create with 0 balance
      await supabase
        .from('users')
        .insert({ id: userId, wallet_balance: 0 });
      return res.json({ success: true, data: { balance: 0 } });
    }

    res.json({
      success: true,
      data: { balance: data?.wallet_balance || 0 }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get balance'
    });
  }
};

// POST /api/wallet/fund
exports.fundWallet = async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount } = req.body;

    // Validate amount with strict rules
    const validAmount = validateAmount(amount, {
      min: 1,
      max: 1000000,
      allowNegative: false,
      allowDecimals: true,
      fieldName: 'Funding amount'
    });

    // Get current balance
    let { data: user } = await supabase
      .from('users')
      .select('wallet_balance')
      .eq('id', userId)
      .single();

    if (!user) {
      // Create user if doesn't exist
      await supabase
        .from('users')
        .insert({ id: userId, wallet_balance: 0 });
      user = { wallet_balance: 0 };
    }

    const newBalance = (user.wallet_balance || 0) + validAmount;

    // Update balance
    await supabase
      .from('users')
      .update({ wallet_balance: newBalance })
      .eq('id', userId);

    res.json({
      success: true,
      data: { newBalance },
      message: 'Wallet funded successfully'
    });
  } catch (error) {
    console.error('Fund wallet error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fund wallet'
    });
  }
};

// GET /api/wallet/transactions
exports.getTransactions = async (req, res) => {
  try {
    res.json({
      success: true,
      data: []
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get transactions'
    });
  }
};

// POST /api/wallet/deduct
exports.deductFromWallet = async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount } = req.body;

    // Validate amount with strict rules
    const validAmount = validateAmount(amount, {
      min: 1,
      max: 1000000,
      allowNegative: false,
      allowDecimals: true,
      fieldName: 'Deduction amount'
    });

    // Get current balance
    const { data: user } = await supabase
      .from('users')
      .select('wallet_balance')
      .eq('id', userId)
      .single();

    const currentBalance = user?.wallet_balance || 0;

    if (currentBalance < validAmount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient balance'
      });
    }

    const newBalance = currentBalance - validAmount;

    // Update balance
    await supabase
      .from('users')
      .update({ wallet_balance: newBalance })
      .eq('id', userId);

    res.json({
      success: true,
      data: { newBalance },
      message: 'Payment processed successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to process payment'
    });
  }
};

// GET /api/wallet/stats
exports.getStats = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const { data } = await supabase
      .from('users')
      .select('wallet_balance')
      .eq('id', userId)
      .single();

    res.json({
      success: true,
      data: {
        balance: data?.wallet_balance || 0,
        totalTransactions: 0,
        totalCredits: 0,
        totalDebits: 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get stats'
    });
  }
};