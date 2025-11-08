import simpleWalletService from './simpleWallet.service';

class CleanWalletService {
  async fundWallet(amount, paymentMethod = 'card') {
    const currentUser = JSON.parse(localStorage.getItem('confirmedUser') || '{}');
    
    if (!currentUser.email) {
      throw new Error('No user logged in');
    }

    try {
      const result = await simpleWalletService.addTransaction(
        currentUser.email,
        amount,
        `Wallet Funding via ${paymentMethod}`,
        'credit'
      );

      if (result.success) {
        // Update local balance with the new balance from Supabase
        const newBalance = result.newBalance || 0;
        localStorage.setItem('wallet_balance', newBalance.toString());
        
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
    
    if (!currentUser.email) {
      throw new Error('No user logged in');
    }

    try {
      const result = await simpleWalletService.addTransaction(
        currentUser.email,
        amount,
        description,
        'debit'
      );

      if (result.success) {
        // Update local balance with the new balance from Supabase
        const newBalance = result.newBalance || 0;
        localStorage.setItem('wallet_balance', newBalance.toString());
        
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
      return parseFloat(localStorage.getItem('wallet_balance') || '0');
    }

    try {
      // Get real balance from Supabase
      const result = await simpleWalletService.getUserBalance(currentUser.id);
      if (result.success) {
        // Update localStorage with real balance
        localStorage.setItem('wallet_balance', result.balance.toString());
        return result.balance;
      }
    } catch (error) {
      console.warn('Failed to get real balance, using localStorage:', error);
    }
    
    return parseFloat(localStorage.getItem('wallet_balance') || '0');
  }
}

const cleanWalletService = new CleanWalletService();
export default cleanWalletService;