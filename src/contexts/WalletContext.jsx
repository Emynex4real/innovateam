import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../App';
import apiService from '../services/api.service';
import WalletService from '../services/wallet.service';
import supabaseWalletService from '../services/supabaseWallet.service';
import cleanWalletService from '../services/cleanWallet.service';

const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [walletBalance, setWalletBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  const fetchWalletData = async () => {
    if (isFetching) return;
    
    try {
      setIsFetching(true);
      setLoading(true);
      
      // Get balance from localStorage (updated by cleanWalletService)
      const balance = await cleanWalletService.getBalance();
      setWalletBalance(balance);
      
      // Get transactions from Supabase for real data
      const currentUser = JSON.parse(localStorage.getItem('confirmedUser') || '{}');
      console.log('🔍 Current user for transactions:', currentUser.email);
      
      if (currentUser.email) {
        const simpleWalletService = (await import('../services/simpleWallet.service')).default;
        const result = await simpleWalletService.getAllTransactions();
        console.log('📊 All transactions:', result.transactions?.length);
        
        if (result.success) {
          // Filter transactions for current user
          const userTransactions = result.transactions
            .filter(t => {
              console.log('Comparing:', t.user_email, 'vs', currentUser.email);
              return t.user_email === currentUser.email;
            })
            .map(t => ({
              id: t.id,
              label: t.description,
              description: t.description,
              amount: t.amount,
              type: t.type,
              category: t.type === 'credit' ? 'funding' : 'service',
              status: 'completed',
              date: t.created_at
            }));
          console.log('👤 User transactions found:', userTransactions.length);
          setTransactions(userTransactions);
          
          // Calculate balance from transactions
          const calculatedBalance = userTransactions.reduce((sum, t) => {
            return t.type === 'credit' ? sum + t.amount : sum - t.amount;
          }, 0);
          console.log('💰 Calculated balance:', calculatedBalance);
          
          // Update localStorage balance to match Supabase
          localStorage.setItem('wallet_balance', calculatedBalance.toString());
          setWalletBalance(calculatedBalance);
        }
      }

    } catch (error) {
      console.error('Failed to fetch wallet data:', error);
      setWalletBalance(0);
      setTransactions([]);
    } finally {
      setLoading(false);
      setIsFetching(false);
    }
  };

  const fundWallet = async (amount, paymentMethod = 'card', reference = null) => {
    const currentUser = JSON.parse(localStorage.getItem('confirmedUser') || '{}');
    
    if (!currentUser.email) {
      throw new Error('User not authenticated');
    }

    try {
      // Use clean wallet service for direct Supabase integration
      const result = await cleanWalletService.fundWallet(amount, paymentMethod);
      
      if (result.success) {
        console.log('✅ Wallet funding successful, updating UI...');
        setWalletBalance(result.balance);
        await fetchWalletData(); // Refresh data from Supabase
        return {
          success: true,
          balance: result.balance
        };
      }
      
      throw new Error('Funding failed');
    } catch (error) {
      console.error('❌ Wallet funding failed:', error.message);
      throw error; // Don't use fallback, ensure Supabase integration works
    }
  };

  const getTransactionStats = async (days = 30) => {
    if (!user?.id) return null;

    try {
      const result = await WalletService.getTransactionStats(user.id, days);
      return result.success ? result.stats : null;
    } catch (error) {
      console.error('Failed to get transaction stats:', error);
      return null;
    }
  };

  const processServicePayment = async (serviceData) => {
    const currentUser = JSON.parse(localStorage.getItem('confirmedUser') || '{}');
    
    if (!currentUser.email) {
      throw new Error('User not authenticated');
    }

    try {
      // Use clean wallet service for service payments
      const result = await cleanWalletService.deductFromWallet(
        serviceData.amount,
        serviceData.description || serviceData.serviceName
      );
      
      if (result.success) {
        setWalletBalance(result.balance);
        await fetchWalletData();
        return result;
      }
      
      
      throw new Error('Service payment failed');
    } catch (error) {
      throw error;
    }
  };

  const addTransaction = async (transactionData) => {
    const currentUser = JSON.parse(localStorage.getItem('confirmedUser') || '{}');
    
    if (!currentUser.email) {
      throw new Error('User not authenticated');
    }

    try {
      if (transactionData.type === 'debit') {
        const result = await cleanWalletService.deductFromWallet(
          transactionData.amount,
          transactionData.description || transactionData.label
        );
        
        if (result.success) {
          await fetchWalletData();
          return { success: true, transaction: transactionData };
        } else {
          throw new Error(result.error || 'Transaction failed');
        }
      } else {
        // For credit transactions, use funding
        const result = await cleanWalletService.fundWallet(
          transactionData.amount,
          'credit'
        );
        
        if (result.success) {
          await fetchWalletData();
          return { success: true, transaction: transactionData };
        } else {
          throw new Error(result.error || 'Transaction failed');
        }
      }
    } catch (error) {
      throw error;
    }
  };

  const getRecentTransactions = (count = 5) => {
    return transactions.slice(0, count);
  };

  const getTransactionsByType = (type) => {
    return transactions.filter(tx => tx.category === type || tx.type === type);
  };

  useEffect(() => {
    fetchWalletData();
  }, [isAuthenticated]);


  
  return (
    <WalletContext.Provider
      value={{
        walletBalance,
        transactions,
        loading,
        fundWallet,
        addTransaction,
        processServicePayment,
        getRecentTransactions,
        getTransactionsByType,
        getTransactionStats,
        fetchWalletData
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useTransactions = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useTransactions must be used within a WalletProvider');
  }
  return context;
};

export const useWallet = () => useTransactions();