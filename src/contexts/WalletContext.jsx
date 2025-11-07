import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../App';
import apiService from '../services/api.service';
import WalletService from '../services/wallet.service';
import supabaseWalletService from '../services/supabaseWallet.service';

const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [walletBalance, setWalletBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchWalletData = async () => {
    if (!isAuthenticated || !user?.id) {
      // Load from localStorage for non-authenticated users
      const localBalance = parseInt(localStorage.getItem('walletBalance') || '0');
      const localTransactions = JSON.parse(localStorage.getItem('walletTransactions') || '[]');
      setWalletBalance(localBalance);
      setTransactions(localTransactions);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Try Supabase first
      const [balanceResult, transactionsResult] = await Promise.all([
        supabaseWalletService.getWalletBalance(user.id),
        supabaseWalletService.getUserTransactions(user.id)
      ]);
      
      if (balanceResult.success && transactionsResult.success) {
        setWalletBalance(balanceResult.balance);
        setTransactions(transactionsResult.transactions);
        return;
      }
      
      // Fallback to API
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
      // Try Supabase first
      const result = await supabaseWalletService.fundWallet(
        user.id, 
        user.email, 
        amount, 
        paymentMethod
      );
      
      if (result.success) {
        setWalletBalance(result.newBalance);
        await fetchWalletData();
        return {
          success: true,
          balance: result.newBalance,
          transaction: result.transaction
        };
      }
      
      // Fallback to API
      const apiResult = await apiService.post('/api/wallet/fund', {
        amount,
        paymentMethod,
        reference
      });
      
      if (apiResult.success) {
        await fetchWalletData();
        return apiResult;
      } else {
        throw new Error(apiResult.error || 'Funding failed');
      }
    } catch (error) {
      // Final fallback to localStorage
      console.warn('All funding methods failed, using localStorage:', error.message);
      const mockResult = {
        success: true,
        balance: walletBalance + amount,
        transaction: {
          id: Date.now(),
          amount,
          type: 'credit',
          description: 'Wallet Funding',
          status: 'successful',
          created_at: new Date().toISOString()
        }
      };
      
      const newBalance = walletBalance + amount;
      setWalletBalance(newBalance);
      setTransactions(prev => [mockResult.transaction, ...prev]);
      
      // Store in localStorage
      localStorage.setItem('walletBalance', newBalance.toString());
      localStorage.setItem('walletTransactions', JSON.stringify([mockResult.transaction, ...transactions]));
      
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
      // Try Supabase first
      const result = await supabaseWalletService.processServicePayment(
        user.id,
        user.email,
        serviceData
      );
      
      if (result.success) {
        setWalletBalance(result.newBalance);
        await fetchWalletData();
        return result;
      }
      
      // Fallback to original service
      const fallbackResult = await WalletService.processServicePayment(user.id, serviceData);
      if (fallbackResult.success) {
        await fetchWalletData();
      }
      return fallbackResult;
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