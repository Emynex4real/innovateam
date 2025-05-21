import React, { createContext, useState, useContext } from 'react';

const TransactionContext = createContext();

export const TransactionProvider = ({ children }) => {
  const [transactions, setTransactions] = useState([]);

  const addTransaction = (transaction) => {
    setTransactions(prev => [
      {
        id: Date.now(),
        ...transaction,
        date: new Date().toISOString().split('T')[0]
      },
      ...prev
    ]);
  };

  const getTransactionHistory = () => transactions;

  return (
    <TransactionContext.Provider value={{ transactions, addTransaction, getTransactionHistory }}>
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransactions = () => {
  const context = useContext(TransactionContext);
  if (context === undefined) {
    throw new Error('useTransactions must be used within a TransactionProvider');
  }
  return context;
};
