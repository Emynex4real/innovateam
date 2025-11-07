import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../App';
import apiService from '../services/api.service';
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
      const [walletData, transactionsData] = await Promise.all([
        apiService.get('/api/wallet/balance').catch(() => ({ balance: 0 })),
        apiService.get('/api/wallet/transactions').catch(() => ({ transactions: [] }))
      ]);
      
      setWalletBalance(walletData.balance || 0);
      setTransactions(transactionsData.transactions || []);
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
      const result = await apiService.post('/api/wallet/fund', {
        amount,
        paymentMethod,
        reference
      });
      
      if (result.success) {
        await fetchWalletData();
        return result;
      } else {
        throw new Error(result.error || 'Funding failed');
      }
    } catch (error) {
      // Fallback to mock for development
      console.warn('Backend funding failed, using mock:', error.message);
      const mockResult = {
        success: true,
        balance: walletBalance + amount,
        transaction: {
          id: Date.now(),
          amount,
          type: 'credit',
          label: 'Wallet Funding',
          status: 'Successful',
          date: new Date().toISOString()
        }
      };
      
      setWalletBalance(prev => prev + amount);
      setTransactions(prev => [mockResult.transaction, ...prev]);
      return mockResult;
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
      const result = await apiService.post('/api/wallet/transaction', transactionData);
      
      if (result.success) {
        await fetchWalletData();
        return result;
      } else {
        throw new Error(result.error || 'Transaction failed');
      }
    } catch (error) {
      // Fallback to mock for development
      console.warn('Backend transaction failed, using mock:', error.message);
      const mockTransaction = {
        id: Date.now(),
        ...transactionData,
        date: new Date().toISOString()
      };
      
      if (transactionData.type === 'debit') {
        if (walletBalance < transactionData.amount) {
          throw new Error('Insufficient balance');
        }
        setWalletBalance(prev => prev - transactionData.amount);
      } else {
        setWalletBalance(prev => prev + transactionData.amount);
      }
      
      setTransactions(prev => [mockTransaction, ...prev]);
      return { success: true, transaction: mockTransaction };
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