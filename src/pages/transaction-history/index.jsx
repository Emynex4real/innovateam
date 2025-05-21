import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiSearch, FiFilter } from 'react-icons/fi';
import { useTransactions } from '../../contexts/TransactionContext';

const TransactionHistory = () => {
  const { transactions } = useTransactions();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = ['all', 'education', 'wallet', 'data'];

  // Filter transactions
  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = tx.label.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || tx.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-6">Transaction History</h1>

      {/* Search and Filter Bar */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-color"
            />
            <FiSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-color"
        >
          {categories.map(category => (
            <option key={category} value={category}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Transaction List */}
      <div className="space-y-4">
        {filteredTransactions.map((transaction) => (
          <div
            key={transaction.id}
            className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">{transaction.label}</h3>
                <p className="text-gray-600 text-sm mt-1">
                  {transaction.date.split('T')[0]}
                </p>
                <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                  <span className="bg-gray-100 px-2 py-1 rounded-full">
                    {transaction.category.charAt(0).toUpperCase() + transaction.category.slice(1)}
                  </span>
                  <span>{transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}</span>
                </div>
              </div>
              <div className="text-right">
                <span className={`font-semibold text-lg ${
                  transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.amount}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredTransactions.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No transactions found</p>
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;
