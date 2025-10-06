
import { toast } from 'react-toastify';

export const useJambTransaction = () => {
  // Mock data for now - will be replaced with Supabase data
  const walletBalance = 0;
  const addTransaction = (transaction) => {};

  const processJambTransaction = async (params) => {
    const {
      amount,
      serviceType,
      description,
      quantity = 1,
      profileCode = null,
      fullName = null,
    } = params;

    if (!amount || !serviceType) {
      toast.error('Invalid transaction parameters');
      return { success: false, error: 'Invalid parameters' };
    }

    if (walletBalance < amount) {
      toast.error('Insufficient wallet balance');
      return { success: false, error: 'Insufficient balance' };
    }

    try {
      // Process the transaction
      addTransaction({
        label: `JAMB ${serviceType}`,
        description: description || `${serviceType} - ${quantity} unit(s)${profileCode ? ` - ${profileCode}` : ''}${fullName ? ` for ${fullName}` : ''}`,
        amount: amount,
        type: 'debit',
        category: 'jamb',
        status: 'Successful',
        metadata: {
          serviceType,
          quantity,
          profileCode,
          fullName,
        }
      });

      toast.success('Transaction successful');
      return { success: true };
    } catch (error) {
      console.error('Transaction failed:', error);
      toast.error('Transaction failed. Please try again.');
      return { success: false, error: error.message };
    }
  };

  return { processJambTransaction, walletBalance };
};
