const supabase = require('../supabaseClient');

class Transaction {
  static async create(transactionData) {
    // Build insert object with all columns
    const fullRow = {
      user_id: transactionData.userId,
      user_email: transactionData.userEmail || null,
      description: transactionData.description || '',
      amount: parseFloat(transactionData.amount),
      type: transactionData.type || 'debit',
      status: transactionData.status || 'successful',
      category: transactionData.category || 'general',
      reference: transactionData.reference || null,
      metadata: transactionData.metadata || {},
      paystack_reference: transactionData.paystackReference || null
    };

    const { data, error } = await supabase
      .from('transactions')
      .insert(fullRow)
      .select()
      .single();

    // If columns don't exist in schema cache, retry with core columns only
    if (error && error.code === 'PGRST204') {
      console.warn('Transaction schema cache stale, retrying with core columns. Run: NOTIFY pgrst, \'reload schema\'; in Supabase SQL Editor.');
      const coreRow = {
        user_id: transactionData.userId,
        user_email: transactionData.userEmail || 'unknown@user.com',
        description: transactionData.description || '',
        amount: parseFloat(transactionData.amount),
        type: transactionData.type || 'debit',
        status: transactionData.status || 'completed'
      };
      if (transactionData.metadata) coreRow.metadata = transactionData.metadata;

      const { data: d2, error: e2 } = await supabase
        .from('transactions')
        .insert(coreRow)
        .select()
        .single();

      if (e2) throw e2;
      return Transaction._toCamel(d2);
    }

    if (error) throw error;
    return Transaction._toCamel(data);
  }

  static async findByUserId(userId, limit = 50) {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data || []).map(Transaction._toCamel);
  }

  static async findById(id) {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return Transaction._toCamel(data);
  }

  static async getAll(limit = 100) {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data || []).map(Transaction._toCamel);
  }

  static async getUserStats(userId) {
    const { data, error } = await supabase
      .from('transactions')
      .select('type, amount, status')
      .eq('user_id', userId);

    if (error) throw error;
    const txns = data || [];

    return {
      totalTransactions: txns.length,
      totalCredits: txns.filter(t => t.type === 'credit').reduce((sum, t) => sum + parseFloat(t.amount), 0),
      totalDebits: txns.filter(t => t.type === 'debit').reduce((sum, t) => sum + parseFloat(t.amount), 0),
      pendingTransactions: txns.filter(t => t.status === 'pending').length,
      completedTransactions: txns.filter(t => t.status === 'completed').length
    };
  }

  static async update(id, updateData) {
    const mapped = {};
    if (updateData.status !== undefined) mapped.status = updateData.status;
    if (updateData.description !== undefined) mapped.description = updateData.description;
    if (updateData.amount !== undefined) mapped.amount = parseFloat(updateData.amount);
    if (updateData.metadata !== undefined) mapped.metadata = updateData.metadata;
    mapped.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('transactions')
      .update(mapped)
      .eq('id', id)
      .select()
      .single();

    if (error) return null;
    return Transaction._toCamel(data);
  }

  static async delete(id) {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    return !error;
  }

  static async findByPaystackReference(reference) {
    try {
      const { data } = await supabase
        .from('transactions')
        .select('id')
        .eq('paystack_reference', reference)
        .limit(1);

      return data && data.length > 0;
    } catch {
      // Column may not exist in schema cache yet
      return false;
    }
  }

  static _toCamel(row) {
    if (!row) return null;
    return {
      id: row.id,
      userId: row.user_id,
      userEmail: row.user_email,
      description: row.description,
      amount: parseFloat(row.amount),
      type: row.type,
      status: row.status,
      category: row.category,
      reference: row.reference,
      metadata: row.metadata,
      paystackReference: row.paystack_reference,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}

module.exports = Transaction;
