// src/pages/transactions/index.jsx
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTransactions } from '../../contexts/TransactionContext';
import { FaSearch, FaFilter, FaDownload, FaPrint, FaChevronDown, FaChevronUp, FaCalendar, FaTimes } from 'react-icons/fa';
import toast from 'react-hot-toast';

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
    <div className="min-h-screen bg-gray-50 p-6 font-nunito">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">Transactions</h1>

          <div className="mb-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="relative w-full sm:w-96">
                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200 text-sm"
                />
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={handleFilterToggle}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200"
                >
                  <FaFilter className={`${showFilters ? 'text-green-500' : 'text-gray-500'}`} />
                  <span>Filter</span>
                </button>
                <button
                  onClick={handleExport}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200"
                >
                  <FaDownload className="text-gray-500" />
                  <span>Export</span>
                </button>
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200"
                >
                  <FaPrint className="text-gray-500" />
                  <span>Print</span>
                </button>
              </div>
            </div>

            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 bg-gray-50 rounded-lg space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <select
                        value={filter}
                        onChange={(e) => {
                          setFilter(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="w-full sm:w-64 p-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200 text-sm"
                      >
                        <option value="all">All Transactions</option>
                        <option value="e-Wallet Topup">e-Wallet Topup</option>
                        <option value="Transaction Charge">Transaction Charge</option>
                        <option value="Olevel upload">O-Level Upload</option>
                        <option value="Caps printing">Caps Printing</option>
                      </select>

                      <div className="flex gap-4">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                          <input
                            type="date"
                            name="start"
                            value={dateRange.start}
                            onChange={handleDateRangeChange}
                            className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200 text-sm"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                          <input
                            type="date"
                            name="end"
                            value={dateRange.end}
                            onChange={handleDateRangeChange}
                            className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200 text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="bg-white rounded-xl shadow-md overflow-x-auto"
          >
            <table className="min-w-full">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="py-3 px-4 text-left text-sm font-semibold">#</th>
                  <th 
                    className="py-3 px-4 text-left text-sm font-semibold cursor-pointer hover:bg-gray-200 transition-colors duration-200"
                    onClick={() => handleSort('label')}
                  >
                    <div className="flex items-center gap-2">
                      Description
                      {sortConfig.key === 'label' && (
                        <span className="text-green-500">
                          {sortConfig.direction === 'asc' ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
                        </span>
                      )}
                    </div>
                  </th>
                  <th className="py-3 px-4 text-left text-sm font-semibold">Quantity</th>
                  <th 
                    className="py-3 px-4 text-left text-sm font-semibold cursor-pointer hover:bg-gray-200 transition-colors duration-200"
                    onClick={() => handleSort('amount')}
                  >
                    <div className="flex items-center gap-2">
                      Amount
                      {sortConfig.key === 'amount' && (
                        <span className="text-green-500">
                          {sortConfig.direction === 'asc' ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
                        </span>
                      )}
                    </div>
                  </th>
                  <th 
                    className="py-3 px-4 text-left text-sm font-semibold cursor-pointer hover:bg-gray-200 transition-colors duration-200"
                    onClick={() => handleSort('date')}
                  >
                    <div className="flex items-center gap-2">
                      Date
                      {sortConfig.key === 'date' && (
                        <span className="text-green-500">
                          {sortConfig.direction === 'asc' ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
                        </span>
                      )}
                    </div>
                  </th>
                  <th 
                    className="py-3 px-4 text-left text-sm font-semibold cursor-pointer hover:bg-gray-200 transition-colors duration-200"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center gap-2">
                      Status
                      {sortConfig.key === 'status' && (
                        <span className="text-green-500">
                          {sortConfig.direction === 'asc' ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
                        </span>
                      )}
                    </div>
                  </th>
                  <th className="py-3 px-4 text-left text-sm font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedTransactions.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-4 text-center text-gray-500">
                      No transactions found
                    </td>
                  </tr>
                ) : (
                  paginatedTransactions.map((transaction, index) => (
                    <motion.tr
                      key={transaction.id}
                      variants={rowVariants}
                      className="border-b border-gray-200 hover:bg-gray-50 transition-all duration-200"
                    >
                      <td className="py-3 px-4 text-gray-700">{index + 1 + (currentPage - 1) * itemsPerPage}</td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span className="text-gray-700 font-medium">{transaction.label}</span>
                          {transaction.description && (
                            <span className="text-gray-500 text-sm truncate max-w-xs">{transaction.description}</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-700">{transaction.quantity || 1}</td>
                      <td className="py-3 px-4">
                        <span className={`font-medium ${transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                          {transaction.type === 'credit' ? '+' : '-'}₦{transaction.amount.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span className="text-gray-700">{new Date(transaction.date).toLocaleDateString()}</span>
                          <span className="text-gray-500 text-sm">{new Date(transaction.date).toLocaleTimeString()}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            transaction.status === 'Successful'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {transaction.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleViewDetails(transaction)}
                          className="bg-green-500 text-white px-3 py-1 rounded-md text-sm font-medium hover:bg-green-600 transition-all duration-200"
                        >
                          View
                        </button>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className="flex justify-between items-center py-3 px-4 border-t border-gray-200">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md text-sm hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 transition-all duration-200"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md text-sm hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 transition-all duration-200"
                >
                  Next
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>

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
              className="bg-white rounded-xl w-full max-w-2xl shadow-xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                <h2 className="text-xl font-semibold text-gray-800">Transaction Details</h2>
                <button
                  onClick={() => setSelectedTransaction(null)}
                  className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
                >
                  <FaTimes size={20} />
                </button>
              </div>

              <div className="p-6 space-y-6">
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