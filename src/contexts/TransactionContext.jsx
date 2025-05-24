import React, { createContext, useState, useContext, useEffect } from "react";
import { useAuth } from "./AuthContext";

const TransactionContext = createContext();

export const TransactionProvider = ({ children }) => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem(`transactions_${user?.email}`);
    return saved ? JSON.parse(saved) : [];
  });

  const [walletBalance, setWalletBalance] = useState(() => {
    const saved = localStorage.getItem(`wallet_${user?.email}`);
    return saved ? parseFloat(saved) : 0;
  });

  useEffect(() => {
    if (user?.email) {
      localStorage.setItem(`transactions_${user.email}`, JSON.stringify(transactions));
      localStorage.setItem(`wallet_${user.email}`, walletBalance.toString());
    }
  }, [transactions, walletBalance, user?.email]);

  const addTransaction = (transaction) => {
    const newTransaction = {
      id: Date.now(),
      ...transaction,
      date: new Date().toISOString().split("T")[0],
      status: transaction.status || "success",
      userId: user?.email,
    };

    // Update wallet balance based on transaction type
    if (transaction.type === "credit" || transaction.type === "fund_wallet") {
      setWalletBalance((prev) => prev + parseFloat(transaction.amount));
    } else if (transaction.type === "debit" || transaction.type === "purchase") {
      setWalletBalance((prev) => prev - parseFloat(transaction.amount));
    }

    setTransactions((prev) => [newTransaction, ...prev]);
    return newTransaction;
  };

  const getTransactionsByType = (type) => {
    return transactions.filter((t) => t.type === type);
  };

  const getRecentTransactions = (limit = 5) => {
    return transactions.slice(0, limit);
  };

  const getTransactionById = (id) => {
    return transactions.find((t) => t.id === id);
  };

  const getWalletBalance = () => walletBalance;

  const fundWallet = (amount, paymentMethod) => {
    return addTransaction({
      type: "fund_wallet",
      amount,
      description: `Wallet funded via ${paymentMethod}`,
      paymentMethod,
    });
  };

  const makePayment = (amount, description, category) => {
    if (amount > walletBalance) {
      throw new Error("Insufficient balance");
    }

    return addTransaction({
      type: "purchase",
      amount,
      description,
      category,
    });
  };

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        addTransaction,
        getRecentTransactions,
        getTransactionsByType,
        getTransactionById,
        walletBalance,
        getWalletBalance,
        fundWallet,
        makePayment,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransactions = () => {
  const context = useContext(TransactionContext);
  if (context === undefined) {
    throw new Error("useTransactions must be used within a TransactionProvider");
  }
  return context;
};