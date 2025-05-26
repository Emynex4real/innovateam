// src/pages/transactions/index.jsx
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTransactions } from '../../contexts/TransactionContext';
import { FaSearch, FaFilter, FaDownload, FaPrint, FaChevronDown, FaChevronUp, FaTimes } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useDarkMode } from '../../contexts/DarkModeContext';
import { FiDownload, FiFilter } from 'react-icons/fi';

const Transactions = () => {
  const { transactions } = useTransactions();
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [showFilters, setShowFilters] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [showExportOptions, setShowExportOptions] = useState(false);
  const itemsPerPage = 10;
  const { isDarkMode } = useDarkMode();

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((t) => {
        const matchesFilter = filter === 'all' ? true : t.label.toLowerCase().includes(filter.toLowerCase());
        const matchesSearch = searchTerm === '' ? true : 
          t.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.amount.toString().includes(searchTerm);
        const matchesDateRange = dateRange.start && dateRange.end ?
          new Date(t.date) >= new Date(dateRange.start) &&
          new Date(t.date) <= new Date(dateRange.end) : true;
        
        return matchesFilter && matchesSearch && matchesDateRange;
      })
      .sort((a, b) => {
        if (sortConfig.key === 'amount') {
          return sortConfig.direction === 'asc' ? a.amount - b.amount : b.amount - a.amount;
        }
        if (sortConfig.key === 'date') {
          return sortConfig.direction === 'asc' 
            ? new Date(a.date) - new Date(b.date)
            : new Date(b.date) - new Date(a.date);
        }
        return sortConfig.direction === 'asc'
          ? a[sortConfig.key].localeCompare(b[sortConfig.key])
          : b[sortConfig.key].localeCompare(a[sortConfig.key]);
      });
  }, [transactions, filter, searchTerm, dateRange, sortConfig]);

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleViewDetails = (transaction) => {
    setSelectedTransaction(transaction);
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleExport = () => {
    const csvContent = filteredTransactions
      .map(t => [
        t.id,
        t.label,
        t.amount,
        t.date.split('T')[0],
        t.status
      ].join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Transactions exported successfully!');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleFilterToggle = () => {
    setShowFilters(prev => !prev);
  };

  const handleDateRangeChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const rowVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className={`min-h-screen p-6 transition-colors duration-200 ${
      isDarkMode ? 'bg-dark-surface text-dark-text-primary' : 'bg-gray-50 text-gray-800'
    }`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`max-w-4xl mx-auto rounded-xl shadow-lg ${
          isDarkMode ? 'bg-dark-surface-secondary border border-dark-border' : 'bg-white'
        }`}
      >
        <div className={`p-6 border-b ${
          isDarkMode ? 'border-dark-border' : 'border-gray-200'
        }`}>
          <div className="flex justify-between items-center">
            <div>
              <h1 className={`text-2xl font-bold ${
                isDarkMode ? 'text-dark-text-primary' : 'text-gray-800'
              }`}>Transactions</h1>
              <p className={`mt-1 ${
                isDarkMode ? 'text-dark-text-secondary' : 'text-gray-600'
              }`}>View and manage your transaction history</p>
            </div>
            <button
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors duration-200 ${
                isDarkMode 
                  ? 'bg-dark-surface text-dark-text-primary hover:bg-dark-border' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FiDownload className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>

          <div className="mt-4 flex gap-2">
            {['all', 'credit', 'debit'].map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  filter === type
                    ? isDarkMode 
                      ? 'bg-primary-600 text-white' 
                      : 'bg-green-500 text-white'
                    : isDarkMode
                      ? 'bg-dark-surface text-dark-text-secondary hover:bg-dark-border'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {filteredTransactions.length === 0 ? (
            <p className={`text-center py-8 ${
              isDarkMode ? 'text-dark-text-secondary' : 'text-gray-600'
            }`}>No transactions found.</p>
          ) : (
            <div className="space-y-4">
              {filteredTransactions.map((transaction) => (
                <motion.div
                  key={transaction.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-lg transition-colors duration-200 ${
                    isDarkMode 
                      ? 'bg-dark-surface border border-dark-border hover:bg-dark-border' 
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className={`font-medium ${
                        isDarkMode ? 'text-dark-text-primary' : 'text-gray-800'
                      }`}>{transaction.label}</h3>
                      <p className={`text-sm ${
                        isDarkMode ? 'text-dark-text-secondary' : 'text-gray-600'
                      }`}>{transaction.description}</p>
                      <p className={`text-xs mt-1 ${
                        isDarkMode ? 'text-dark-text-tertiary' : 'text-gray-500'
                      }`}>{new Date(transaction.date).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium ${
                        transaction.type === 'credit' 
                          ? 'text-green-500' 
                          : isDarkMode ? 'text-red-400' : 'text-red-500'
                      }`}>
                        {transaction.type === 'credit' ? '+' : '-'} ₦{transaction.amount.toFixed(2)}
                      </p>
                      <p className={`text-xs mt-1 ${
                        transaction.status === 'Successful'
                          ? isDarkMode ? 'text-green-400' : 'text-green-500'
                          : isDarkMode ? 'text-red-400' : 'text-red-500'
                      }`}>{transaction.status}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {selectedTransaction && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedTransaction(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`w-full max-w-2xl shadow-xl overflow-hidden rounded-xl ${
                isDarkMode ? 'bg-dark-surface-secondary' : 'bg-white'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={`px-6 py-4 border-b flex justify-between items-center ${
                isDarkMode 
                  ? 'bg-dark-surface border-dark-border' 
                  : 'bg-gray-50 border-gray-200'
              }`}>
                <h2 className={`text-xl font-semibold ${
                  isDarkMode ? 'text-dark-text-primary' : 'text-gray-800'
                }`}>Transaction Details</h2>
                <button
                  onClick={() => setSelectedTransaction(null)}
                  className={`transition-colors duration-200 ${
                    isDarkMode 
                      ? 'text-dark-text-secondary hover:text-dark-text-primary' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <FaTimes size={20} />
                </button>
              </div>
              <div className={`p-6 ${
                isDarkMode ? 'bg-dark-surface' : 'bg-white'
              }`}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Transaction ID</h3>
                      <p className="mt-1 text-sm text-gray-900 font-mono">{selectedTransaction.id}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Description</h3>
                      <p className="mt-1 text-sm text-gray-900">{selectedTransaction.label}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Additional Details</h3>
                      <p className="mt-1 text-sm text-gray-900">{selectedTransaction.description || 'No additional details'}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Amount</h3>
                      <p className={`mt-1 text-lg font-semibold ${selectedTransaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                        {selectedTransaction.type === 'credit' ? '+' : '-'}₦{selectedTransaction.amount.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Date & Time</h3>
                      <div className="mt-1">
                        <p className="text-sm text-gray-900">{new Date(selectedTransaction.date).toLocaleDateString()}</p>
                        <p className="text-sm text-gray-500">{new Date(selectedTransaction.date).toLocaleTimeString()}</p>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Status</h3>
                      <span
                        className={`mt-2 inline-flex px-3 py-1 rounded-full text-xs font-medium ${selectedTransaction.status === 'Successful'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {selectedTransaction.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Payment Method</h3>
                  <div className="flex items-center space-x-2 text-sm text-gray-700">
                    <span className="inline-block px-3 py-1 bg-gray-100 rounded-lg">
                      {selectedTransaction.paymentMethod || 'Not specified'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={() => setSelectedTransaction(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all duration-200"
                >
                  Close
                </button>
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 bg-green-500 text-white rounded-md text-sm font-medium hover:bg-green-600 transition-all duration-200 flex items-center gap-2"
                >
                  <FaPrint size={14} />
                  Print Receipt
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Transactions;