const supabase = require('../supabaseClient');

// GET /api/admin/users
exports.getUsers = async (req, res) => {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/admin/users
exports.createUser = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .insert([req.body])
      .select();
    if (error) throw error;
    res.status(201).json({ success: true, user: data[0] });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// GET /api/admin/users/:id - get user details
exports.getUserById = async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.params.id)
      .is('deleted_at', null)
      .single();
    if (error || !user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/admin/users/:id/activate
exports.activateUser = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({ status: 'active' })
      .eq('id', req.params.id)
      .select();
    if (error) throw error;
    res.json({ success: true, user: data[0] });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// PATCH /api/admin/users/:id/deactivate
exports.deactivateUser = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({ status: 'inactive' })
      .eq('id', req.params.id)
      .select();
    if (error) throw error;
    res.json({ success: true, user: data[0] });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// DELETE /api/admin/users/:id (Soft Delete)
const { logActivity } = require('../utils/activityLogger');
exports.deleteUser = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select();
    if (error) throw error;
    // Log activity
    await logActivity(req.user?.id, 'delete_user', { targetUserId: req.params.id });
    // Send email notification if email exists
    try {
      const { sendEmail } = require('../utils/email');
      if (data && data[0] && data[0].email) {
        await sendEmail({
          to: data[0].email,
          subject: 'Your account has been deactivated',
          text: 'Your account was deactivated by an administrator. If you believe this is a mistake, please contact support.'
        });
      }
    } catch (emailErr) {
      console.error('Failed to send deletion email:', emailErr.message);
    }
    res.json({ success: true, user: data[0] });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// GET /api/admin/users/:id/transactions - get all transactions for a user
exports.getUserTransactions = async (req, res) => {
  try {
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', req.params.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ success: true, data: transactions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/admin/transactions
exports.getTransactions = async (req, res) => {
  try {
    const Transaction = require('../models/Transaction');
    const transactions = await Transaction.getAll();
    
    res.json({ success: true, data: transactions, transactions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/admin/transactions
exports.createTransaction = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .insert([req.body])
      .select();
    if (error) throw error;
    res.status(201).json({ success: true, transaction: data[0] });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// PUT /api/admin/transactions/:id
exports.updateTransaction = async (req, res) => {
  try {
    const Transaction = require('../models/Transaction');
    const { id } = req.params;
    
    const updatedTransaction = await Transaction.update(id, req.body);
    
    if (!updatedTransaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }
    
    res.json({ success: true, transaction: updatedTransaction });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// DELETE /api/admin/transactions/:id
exports.deleteTransaction = async (req, res) => {
  try {
    const Transaction = require('../models/Transaction');
    const { id } = req.params;
    
    const deleted = await Transaction.delete(id);
    
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }
    
    // Log activity if logger is available
    try {
      const { logActivity } = require('../utils/activityLogger');
      await logActivity(req.user?.id, 'delete_transaction', { transactionId: id });
    } catch (logError) {
      console.log('Activity logging failed:', logError.message);
    }
    
    res.json({ success: true, message: 'Transaction deleted successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
