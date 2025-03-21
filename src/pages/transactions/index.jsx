import React, { useState } from 'react';
import { motion } from 'framer-motion';

const Transactions = () => {
  const [transactions] = useState([
    { id: 1, description: 'Olevel upload Slot', quantity: 2, amount: 800.00, date: '2025-02-12', status: 'Successful', details: 'Uploaded WAEC results' },
    { id: 2, description: 'e-Wallet Topup', quantity: 1, amount: 800.00, date: '2025-02-12', status: 'Successful', details: 'Card payment' },
    { id: 3, description: 'Caps printing Slot', quantity: 1, amount: 300.00, date: '2025-02-10', status: 'Successful', details: 'Printed JAMB CAPS' },
    { id: 4, description: 'e-Wallet Topup', quantity: 1, amount: 300.00, date: '2025-02-10', status: 'Successful', details: 'Bank transfer' },
    { id: 5, description: 'Olevel upload Slot', quantity: 2, amount: 800.00, date: '2025-02-06', status: 'Successful', details: 'Uploaded NECO results' },
    { id: 6, description: 'e-Wallet Topup', quantity: 1, amount: 800.00, date: '2025-02-06', status: 'Successful', details: 'Card payment' },
    { id: 7, description: 'Olevel upload Slot', quantity: 1, amount: 400.00, date: '2025-01-07', status: 'Successful', details: 'Uploaded WAEC results' },
    { id: 8, description: 'e-Wallet Topup', quantity: 1, amount: 400.00, date: '2025-01-07', status: 'Successful', details: 'Bank transfer' },
  ]);

  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const itemsPerPage = 5;

  // Filter transactions
  const filteredTransactions = transactions.filter((t) =>
    filter === 'all' ? true : t.description.toLowerCase().includes(filter.toLowerCase())
  );

  // Pagination
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

  // Animation variants
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
          <h1 className="text-2xl md:text-3xl font-bold text-text-color mb-6">Transactions</h1>

          {/* Filter */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center">
            <select
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full sm:w-64 p-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-color transition-all duration-200 text-sm"
            >
              <option value="all">All Transactions</option>
              <option value="Olevel upload">O-Level Upload</option>
              <option value="e-Wallet Topup">e-Wallet Topup</option>
              <option value="Caps printing">Caps Printing</option>
            </select>
          </div>

          {/* Transactions Table */}
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
                  <th className="py-3 px-4 text-left text-sm font-semibold">Description</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold">Quantity</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold">Amount</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold">Date</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold">Status</th>
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
                  paginatedTransactions.map((transaction) => (
                    <motion.tr
                      key={transaction.id}
                      variants={rowVariants}
                      className="border-b border-gray-200 hover:bg-gray-50 transition-all duration-200"
                    >
                      <td className="py-3 px-4 text-gray-700">{transaction.id}</td>
                      <td className="py-3 px-4 text-gray-700">{transaction.description}</td>
                      <td className="py-3 px-4 text-gray-700">{transaction.quantity}</td>
                      <td className="py-3 px-4 text-gray-700">₦{transaction.amount.toFixed(2)}</td>
                      <td className="py-3 px-4 text-gray-700">{transaction.date}</td>
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
                          className="bg-primary-color text-white px-3 py-1 rounded-md text-sm font-medium hover:bg-green-600 transition-all duration-200"
                        >
                          View
                        </button>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Pagination */}
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

      {/* Transaction Details Modal */}
      {selectedTransaction && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedTransaction(null)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold text-text-color mb-4">Transaction Details</h2>
            <div className="space-y-3 text-sm text-gray-700">
              <p><strong>ID:</strong> {selectedTransaction.id}</p>
              <p><strong>Description:</strong> {selectedTransaction.description}</p>
              <p><strong>Quantity:</strong> {selectedTransaction.quantity}</p>
              <p><strong>Amount:</strong> ₦{selectedTransaction.amount.toFixed(2)}</p>
              <p><strong>Date:</strong> {selectedTransaction.date}</p>
              <p><strong>Status:</strong> {selectedTransaction.status}</p>
              <p><strong>Details:</strong> {selectedTransaction.details}</p>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedTransaction(null)}
                className="bg-primary-color text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-600 transition-all duration-200"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Transactions;