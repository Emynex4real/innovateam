const { v4: uuidv4 } = require('uuid');
const supabase = require('../supabaseClient');

class User {
  static async create(userData) {
    const userId = uuidv4();
    const user = {
      id: userId,
      email: userData.email,
      name: userData.name,
      phone_number: userData.phone || '',
      role: userData.role || 'user',
      wallet_balance: 0,
      status: 'active',
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('users')
      .insert([user])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async findById(id) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return data;
  }

  static async findByEmail(email) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error) return null;
    return data;
  }

  static async updateWalletBalance(userId, amount) {
    const { data, error } = await supabase
      .from('users')
      .update({ 
        wallet_balance: amount
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getAll() {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }
}

module.exports = User;