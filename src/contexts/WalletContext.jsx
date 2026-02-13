import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../App';
import supabase from '../config/supabase';
import cleanWalletService from '../services/cleanWallet.service';
import simpleWalletService from '../services/simpleWallet.service';

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
      if (transactions.length === 0) setLoading(true);
      
      // Get authenticated user from Supabase
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !authUser) {
        console.warn('No authenticated user found');
        return;
      }
      
      // Get user balance from Supabase (RLS ensures user can only access own data)
      const balanceResult = await simpleWalletService.getUserBalance(authUser.id);
      if (balanceResult.success) {
        setWalletBalance(balanceResult.balance);
      } else {
        console.error('Failed to fetch balance:', balanceResult.error);
      }
      
      // Get user transactions from Supabase (RLS filters to user's own transactions)
      const result = await simpleWalletService.getAllTransactions();
      
      if (result.success) {
        const userTransactions = result.transactions.map(t => ({
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
      }

    } catch (error) {
      console.error('Failed to fetch wallet data:', error);
      // Don't zero out data on error, keep previous state if available
    } finally {
      setLoading(false);
      setIsFetching(false);
    }
  };

  // Wallet funding is handled via Paystack (PaymentModal or wallet page).
  // This method only refreshes the local balance after a verified payment.
  const fundWallet = async () => {
    await fetchWalletData();
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
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !authUser) {
      throw new Error('User not authenticated');
    }

    try {
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
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !authUser) {
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
        // Credit transactions must go through Paystack payment flow
        throw new Error('Wallet funding must go through the payment modal');
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
    if (isAuthenticated && user?.id) {
      fetchWalletData();
    }
  }, [isAuthenticated, user?.id]);
  
  // No longer need localStorage initialization
  
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