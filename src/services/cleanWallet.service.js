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
        // Update local balance
        const currentBalance = parseFloat(localStorage.getItem('wallet_balance') || '0');
        const newBalance = currentBalance + amount;
        localStorage.setItem('wallet_balance', newBalance.toString());
        
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

    const currentBalance = parseFloat(localStorage.getItem('wallet_balance') || '0');
    if (currentBalance < amount) {
      throw new Error(`Insufficient balance. Available: ₦${currentBalance.toLocaleString()}`);
    }

    try {
      const result = await simpleWalletService.addTransaction(
        currentUser.email,
        amount,
        description,
        'debit'
      );

      if (result.success) {
        // Update local balance
        const newBalance = currentBalance - amount;
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
    return parseFloat(localStorage.getItem('wallet_balance') || '0');
  }
}

const cleanWalletService = new CleanWalletService();
export default cleanWalletService;