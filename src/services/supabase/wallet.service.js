import { supabase } from '../../lib/supabase'

export class WalletService {
  // Get wallet balance
  static async getBalance(userId) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('wallet_balance')
        .eq('id', userId)
        .single()

      if (error) throw error
      return { success: true, balance: data.wallet_balance || 0 }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // Add funds to wallet
  static async addFunds(userId, amount, reference) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          amount,
          type: 'credit',
          status: 'completed',
          service_type: 'wallet_funding',
          service_name: 'Wallet Funding',
          description: `Wallet funding of ₦${amount}`,
          reference
        })
        .select()
        .single()

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // Debit wallet
  static async debitWallet(userId, amount, serviceType, serviceName, description, reference) {
    try {
      // Check balance first
      const balanceResult = await this.getBalance(userId)
      if (!balanceResult.success) throw new Error(balanceResult.error)
      
      if (balanceResult.balance < amount) {
        throw new Error('Insufficient wallet balance')
      }

      const { data, error } = await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          amount,
          type: 'debit',
          status: 'completed',
          service_type: serviceType,
          service_name: serviceName,
          description,
          reference
        })
        .select()
        .single()

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // Get transaction history
  static async getTransactions(userId, limit = 50, offset = 0) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // Get transaction by reference
  static async getTransactionByReference(reference) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('reference', reference)
        .single()

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }
}

export default WalletService