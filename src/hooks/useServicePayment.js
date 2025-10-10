import { useState } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { SERVICE_PRICES } from '../services/wallet.service.enhanced';
import toast from 'react-hot-toast';

export const useServicePayment = () => {
  const [loading, setLoading] = useState(false);
  const { walletBalance, addTransaction } = useWallet();

  const processPayment = async (serviceKey, customAmount = null) => {
    setLoading(true);
    
    try {
      // Get service price
      const amount = customAmount || SERVICE_PRICES[serviceKey];
      
      if (!amount || amount <= 0) {
        throw new Error('Invalid service amount');
      }

      // Check balance
      if (walletBalance < amount) {
        throw new Error(`Insufficient balance. You need ₦${amount.toLocaleString()} but have ₦${walletBalance.toLocaleString()}`);
      }

      // Process payment
      const result = await addTransaction({
        amount,
        type: 'debit',
        label: getServiceName(serviceKey),
        description: `Payment for ${getServiceName(serviceKey)}`,
        category: getServiceCategory(serviceKey)
      });

      if (result.success) {
        toast.success(`Payment successful! ₦${amount.toLocaleString()} deducted from wallet`);
        return { success: true, transaction: result.transaction, newBalance: result.balance };
      } else {
        throw new Error('Payment processing failed');
      }
    } catch (error) {
      toast.error(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const checkBalance = (serviceKey, customAmount = null) => {
    const amount = customAmount || SERVICE_PRICES[serviceKey];
    return walletBalance >= amount;
  };

  const getRequiredAmount = (serviceKey, customAmount = null) => {
    return customAmount || SERVICE_PRICES[serviceKey];
  };

  return {
    processPayment,
    checkBalance,
    getRequiredAmount,
    loading,
    walletBalance
  };
};

// Helper functions
const getServiceName = (serviceKey) => {
  const serviceNames = {
    'waec-result-checker': 'WAEC Result Checker',
    'neco-result-checker': 'NECO Result Checker',
    'nabteb-result-checker': 'NABTEB Result Checker',
    'nbais-result-checker': 'NBAIS Result Checker',
    'waec-gce': 'WAEC GCE Result Checker',
    'olevel-upload': 'O-Level Result Upload',
    'original-result': 'Original Result Service',
    'pin-vending': 'JAMB PIN Vending',
    'reprinting': 'Result Reprinting',
    'admission-letter': 'Admission Letter Service',
    'ai-examiner': 'AI Examiner',
    'course-advisor': 'Course Advisor',
    'airtime-topup': 'Airtime Top-up',
    'data-subscription': 'Data Subscription'
  };
  
  return serviceNames[serviceKey] || 'Unknown Service';
};

const getServiceCategory = (serviceKey) => {
  if (['airtime-topup', 'data-subscription'].includes(serviceKey)) {
    return 'communication';
  }
  return 'education';
};