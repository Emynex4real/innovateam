// src/contexts/TransactionContext.js
import React, { createContext, useContext, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

const TransactionContext = createContext();

export const TransactionProvider = ({ children }) => {
  const [transactions, setTransactions] = useState([]);
  const [walletBalance, setWalletBalance] = useState(0);

  const fundWallet = (amount, paymentMethod) => {
    const charge = 50.0;
    const newTransaction = {
      id: uuidv4(),
      label: 'e-Wallet Topup',
      description: `Funded wallet via ${paymentMethod}`,
      amount: amount,
      type: 'credit',
      category: 'wallet',
      date: new Date().toISOString(),
      status: 'Successful',
      paymentMethod,
    };
    const chargeTransaction = {
      id: uuidv4(),
      label: 'Transaction Charge',
      description: `Charge for wallet funding`,
      amount: charge,
      type: 'debit',
      category: 'wallet',
      date: new Date().toISOString(),
      status: 'Successful',
    };

    setTransactions((prev) => [newTransaction, chargeTransaction, ...prev]);
    setWalletBalance((prev) => prev + amount - charge);
  };

  const addTransaction = (transaction) => {
    const newTransaction = {
      id: uuidv4(),
      label: transaction.label || 'Transaction',
      description: transaction.description || '',
      amount: transaction.amount,
      type: transaction.type || 'debit',
      category: transaction.category || 'general',
      date: new Date().toISOString(),
      status: transaction.status || 'Successful',
      paymentMethod: transaction.paymentMethod,
    };

    setTransactions((prev) => [newTransaction, ...prev]);
    if (transaction.type === 'credit') {
      setWalletBalance((prev) => prev + transaction.amount);
    } else if (transaction.type === 'debit') {
      setWalletBalance((prev) => prev - transaction.amount);
    }
  };

  const getRecentTransactions = (count) => {
    return transactions.slice(0, count);
  };

  const getTransactionsByType = (type) => {
    return transactions.filter((tx) => tx.category === type);
  };

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        walletBalance,
        fundWallet,
        addTransaction,
        getRecentTransactions,
        getTransactionsByType,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransactions = () => useContext(TransactionContext);