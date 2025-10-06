import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './SupabaseAuthContext';
import walletService from '../services/wallet.service';

const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [walletBalance, setWalletBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      const [balance, userTransactions] = await Promise.all([
        walletService.getBalance(),
        walletService.getTransactions()
      ]);
      
      console.log('WalletContext: Setting balance to:', balance);
      console.log('WalletContext: Setting transactions to:', userTransactions);
      
      setWalletBalance(balance);
      setTransactions(userTransactions);
    } catch (error) {
      console.error('Failed to fetch wallet data:', error);
      // Set defaults on error
      setWalletBalance(0);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const fundWallet = async (amount, paymentMethod = 'card') => {
    try {
      const result = await walletService.fundWallet(amount, paymentMethod);
      await fetchWalletData(); // Refresh data
      return result;
    } catch (error) {
      throw error;
    }
  };

  const addTransaction = async (transactionData) => {
    try {
      let result;
      if (transactionData.type === 'credit') {
        result = await walletService.fundWallet(
          transactionData.amount, 
          'card'
        );
      } else {
        result = await walletService.deductFromWallet(
          transactionData.amount, 
          transactionData.description || transactionData.label
        );
      }
      await fetchWalletData(); // Refresh data
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

  console.log('WalletContext: Current balance in provider:', walletBalance);
  
  return (
    <WalletContext.Provider
      value={{
        walletBalance,
        transactions,
        loading,
        fundWallet,
        addTransaction,
        getRecentTransactions,
        getTransactionsByType,
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