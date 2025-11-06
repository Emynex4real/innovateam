import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import WalletService from '../services/wallet.service';

const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [walletBalance, setWalletBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchWalletData = async () => {
    if (!isAuthenticated || !user?.id) {
      setWalletBalance(0);
      setTransactions([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [balanceResult, transactionsResult] = await Promise.all([
        WalletService.getBalance(user.id),
        WalletService.getTransactions(user.id)
      ]);
      
      setWalletBalance(balanceResult.success ? balanceResult.balance : 0);
      setTransactions(transactionsResult.success ? transactionsResult.transactions : []);
    } catch (error) {
      console.error('Failed to fetch wallet data:', error);
      setWalletBalance(0);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const fundWallet = async (amount, paymentMethod = 'card', reference = null) => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    try {
      const result = await WalletService.fundWallet(user.id, amount, paymentMethod, reference);
      if (result.success) {
        await fetchWalletData(); // Refresh data
      }
      return result;
    } catch (error) {
      throw error;
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
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    try {
      const result = await WalletService.processServicePayment(user.id, serviceData);
      if (result.success) {
        await fetchWalletData(); // Refresh data
      }
      return result;
    } catch (error) {
      throw error;
    }
  };

  const addTransaction = async (transactionData) => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    try {
      let result;
      if (transactionData.type === 'credit') {
        result = await WalletService.fundWallet(
          user.id,
          transactionData.amount, 
          'manual'
        );
      } else {
        result = await WalletService.deductFromWallet(
          user.id,
          transactionData.amount, 
          transactionData.description || transactionData.label
        );
      }
      if (result.success) {
        await fetchWalletData(); // Refresh data
      }
      return result;
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
    if (isAuthenticated) {
      fetchWalletData();
    }
  }, [isAuthenticated]);

  // Also fetch on mount regardless of auth status for localStorage data
  useEffect(() => {
    fetchWalletData();
  }, []);


  
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