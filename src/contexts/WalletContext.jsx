import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import walletService from '../services/wallet.service';

const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [walletBalance, setWalletBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchWalletData = async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      const [balance, userTransactions] = await Promise.all([
        walletService.getBalance(),
        walletService.getTransactions()
      ]);
      
      setWalletBalance(balance);
      setTransactions(userTransactions);
    } catch (error) {
      console.error('Failed to fetch wallet data:', error);
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
      const result = await walletService.deductFromWallet(
        transactionData.amount, 
        transactionData.description
      );
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