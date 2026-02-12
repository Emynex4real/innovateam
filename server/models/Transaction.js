const supabase = require('../supabaseClient');

class Transaction {
  static async create(transactionData) {
    const { data, error } = await supabase
      .from('transactions')
      .insert({
        user_id: transactionData.userId,
        user_email: transactionData.userEmail || null,
        description: transactionData.description || '',
        amount: parseFloat(transactionData.amount),
        type: transactionData.type || 'debit',
        status: transactionData.status || 'completed',
        category: transactionData.category || 'general',
        reference: transactionData.reference || null,
        metadata: transactionData.metadata || {},
        paystack_reference: transactionData.paystackReference || null
      })
      .select()
      .single();

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
    const { data } = await supabase
      .from('transactions')
      .select('id')
      .eq('paystack_reference', reference)
      .limit(1);

    return data && data.length > 0;
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
