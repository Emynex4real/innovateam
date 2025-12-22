import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../App';
import cleanWalletService from '../services/cleanWallet.service';
import simpleWalletService from '../services/simpleWallet.service'; // Static import is better

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
      // Only show global loading on first fetch if needed, 
      // otherwise we just update in background
      if (transactions.length === 0) setLoading(true);
      
      const currentUser = JSON.parse(localStorage.getItem('confirmedUser') || '{}');
      
      if (!currentUser.id) {
        // console.warn('No user ID found during wallet fetch');
        return;
      }
      
      // Get user balance from Supabase user_profiles table
      const balanceResult = await simpleWalletService.getUserBalance(currentUser.id);
      if (balanceResult.success) {
        setWalletBalance(balanceResult.balance);
      }
      
      // Get user transactions from Supabase
      const result = await simpleWalletService.getAllTransactions();
      
      if (result.success) {
        // Filter transactions for current user by user_id
        const userTransactions = result.transactions
          .filter(t => t.user_id === currentUser.id)
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
        
        setTransactions(userTransactions);
        console.log('✅ Loaded', userTransactions.length, 'transactions from Supabase');
      }

    } catch (error) {
      console.error('Failed to fetch wallet data:', error);
      // Don't zero out data on error, keep previous state if available
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
      throw error;
    }
  };

  const getTransactionStats = async (days = 30) => {
    if (!user?.id) return null;

    try {
      // Simple stats calculation from existing transactions
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      const recentTransactions = transactions.filter(
        tx => new Date(tx.date) >= cutoffDate
      );
      
      const stats = {
        totalTransactions: recentTransactions.length,
        totalCredits: recentTransactions
          .filter(tx => tx.type === 'credit')
          .reduce((sum, tx) => sum + tx.amount, 0),
        totalDebits: recentTransactions
          .filter(tx => tx.type === 'debit')
          .reduce((sum, tx) => sum + tx.amount, 0)
      };
      
      return stats;
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

  // Fetch data when authentication state changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchWalletData();
    }
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