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
    const localBalance = parseFloat(localStorage.getItem('wallet_balance') || '0');

    // 🛑 SAFETY CHECK: Supabase will crash if we send it "confirmed-..."
    // We only query Supabase if the ID looks like a real UUID (contains dashes, long length)
    const hasValidUUID = currentUser.id && currentUser.id.includes('-') && currentUser.id.length > 30;

    if (!hasValidUUID) {
      console.warn('⚠️ User ID is not a valid Supabase UUID. Using localStorage balance to prevent crash.');
      return localBalance;
    }

    try {
      const result = await simpleWalletService.getUserBalance(currentUser.id);
      if (result.success) {
        localStorage.setItem('wallet_balance', result.balance.toString());
        return result.balance;
      }
    } catch (error) {
      console.warn('Failed to get real balance, using localStorage:', error.message);
    }
    
    return localBalance;
  }
}

const cleanWalletService = new CleanWalletService();
export default cleanWalletService;