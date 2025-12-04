import simpleWalletService from './simpleWallet.service';

class CleanWalletService {
  async fundWallet(amount, paymentMethod = 'card') {
    const currentUser = JSON.parse(localStorage.getItem('confirmedUser') || '{}');
    
    console.log('🔍 Funding wallet - Current user:', currentUser);
    
    if (!currentUser.email) {
      console.error('❌ No email found in localStorage. User object:', currentUser);
      throw new Error('User not authenticated. Please log in again.');
    }

    try {
      const result = await simpleWalletService.addTransaction(
        currentUser.email,
        amount,
        `Wallet Funding via ${paymentMethod}`,
        'credit'
      );

      if (result.success) {
        const newBalance = result.newBalance || 0;
        console.log(`✅ Wallet funded: +₦${amount}, New balance: ₦${newBalance}`);
        return { success: true, balance: newBalance };
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      throw error;
    }
  }

  async deductFromWallet(amount, description) {
    const currentUser = JSON.parse(localStorage.getItem('confirmedUser') || '{}');
    
    console.log('🔍 Deducting from wallet - Current user:', currentUser);
    
    if (!currentUser.email) {
      console.error('❌ No email found in localStorage. User object:', currentUser);
      throw new Error('User not authenticated. Please log in again.');
    }

    try {
      const result = await simpleWalletService.addTransaction(
        currentUser.email,
        amount,
        description,
        'debit'
      );

      if (result.success) {
        const newBalance = result.newBalance || 0;
        return { success: true, balance: newBalance };
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      throw error;
    }
  }

  async getBalance() {
    const currentUser = JSON.parse(localStorage.getItem('confirmedUser') || '{}');

    if (!currentUser.id) {
      throw new Error('User not authenticated');
    }

    try {
      const result = await simpleWalletService.getUserBalance(currentUser.id);
      if (result.success) {
        return result.balance;
      } else {
        throw new Error(result.error || 'Failed to get balance');
      }
    } catch (error) {
      console.error('Failed to get balance from Supabase:', error.message);
      throw error;
    }
  }
}

const cleanWalletService = new CleanWalletService();
export default cleanWalletService;