import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTransactions } from '../../contexts/TransactionContext';
import { FiCreditCard, FiDollarSign, FiClock, FiArrowUp, FiArrowDown, FiX, FiClipboard, FiCheck } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { useDarkMode } from '../../contexts/DarkModeContext';

const Wallet = () => {
  const [showInput, setShowInput] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [showPaymentPreview, setShowPaymentPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [copiedAccount, setCopiedAccount] = useState(null);
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  const { user } = useAuth();
  const { walletBalance, fundWallet, getRecentTransactions } = useTransactions();
  const transactions = getRecentTransactions(5);
  const transactionCharge = 50.0;
  const { isDarkMode } = useDarkMode();

  const handlePayment = () => {
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid amount greater than zero.');
      return;
    }
    setError('');
    setShowPaymentPreview(true);
  };

  const copyToClipboard = async (text, accountIndex) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAccount(accountIndex);
      setTimeout(() => setCopiedAccount(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const confirmPayment = async () => {
    setIsLoading(true);
    const amount = parseFloat(paymentAmount);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      fundWallet(amount, 'card');
      setPaymentAmount('');
      setShowInput(false);
      setShowPaymentPreview(false);
      setSuccessMessage('Payment successful! Your wallet has been credited.');
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      setError('Payment failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className={`min-h-screen p-6 transition-colors duration-200 ${
      isDarkMode ? 'bg-dark-surface text-dark-text-primary' : 'bg-gray-50 text-gray-800'
    }`}>
      <div className="mx-auto max-w-6xl space-y-6">
        <AnimatePresence>
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`px-6 py-4 rounded-xl mb-6 flex items-center justify-between shadow-lg ${
                isDarkMode 
                  ? 'bg-dark-surface-secondary border border-dark-border text-green-400' 
                  : 'bg-green-50 border border-green-200/50 text-green-700'
              }`}
            >
              <div className="flex items-center">
                <FiCheck className="w-5 h-5 mr-2" />
                {successMessage}
              </div>
              <button
                onClick={() => setSuccessMessage('')}
                className={`text-${isDarkMode ? 'dark-text-secondary' : 'green-700'} hover:text-${isDarkMode ? 'primary-400' : 'green-900'}`}
              >
                <FiX className="w-5 h-5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div variants={cardVariants} className={`p-6 rounded-xl shadow-md ${
            isDarkMode ? 'bg-dark-surface-secondary border border-dark-border' : 'bg-white'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-xl font-semibold flex items-center ${
                isDarkMode ? 'text-dark-text-primary' : 'text-gray-800'
              }`}>
                <FiDollarSign className="w-6 h-6 mr-2 text-green-500" />
                Wallet Details
              </h2>
            </div>
            <div className="space-y-6">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className={`relative overflow-hidden p-8 rounded-2xl text-white shadow-lg border ${
                  isDarkMode 
                    ? 'bg-gradient-to-r from-green-600 to-green-700 border-green-600' 
                    : 'bg-gradient-to-r from-green-500 to-green-600 border-green-400/20'
                }`}
              >
                <div className="absolute top-0 right-0 w-32 h-32 transform translate-x-16 -translate-y-16">
                  <div className="absolute inset-0 bg-white/10 rounded-full blur-3xl"></div>
                </div>
                <div className="relative z-10">
                  <p className="text-green-100 text-sm font-medium uppercase tracking-wider mb-2">Available Balance</p>
                  <p className="text-5xl font-bold mb-6 tracking-tight">₦{(walletBalance || 0).toLocaleString()}</p>
                  <div className="flex items-center text-green-100 text-sm bg-white/10 w-fit px-3 py-1.5 rounded-full">
                    <FiClock className="w-4 h-4 mr-2" />
                    Last updated: {new Date().toLocaleTimeString()}
                  </div>
                </div>
              </motion.div>

              <div className="space-y-4">
                <motion.button
                  whileHover={{ scale: 1.02, backgroundColor: '#16a34a' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowInput(!showInput)}
                  className={`w-full py-3.5 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2.5 ${showInput ? 'bg-gray-600 hover:bg-gray-700 text-white' : 'bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/25'}`}
                >
                  {showInput ? (
                    <>
                      <FiX className="w-4 h-4" />
                      Cancel Payment
                    </>
                  ) : (
                    <>
                      <FiCreditCard className="w-4 h-4" />
                      Add Money to Wallet
                    </>
                  )}
                </motion.button>

                {showInput && (
                  <div className="space-y-3">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <span className={`text-gray-500 ${
                          isDarkMode ? 'text-dark-text-secondary' : ''
                        }`}>₦</span>
                      </div>
                      <input
                        type="number"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        placeholder="0.00"
                        className={`w-full pl-8 pr-4 py-3 rounded-xl border ${
                          error ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50'
                        } focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200 text-lg font-medium ${
                          isDarkMode ? 'bg-dark-surface border-dark-border text-dark-text-primary' : ''
                        }`}
                        min="1"
                        disabled={isLoading}
                      />
                    </div>
                    {error && <p className="text-red-500 text-xs">{error}</p>}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handlePayment}
                      className="w-full bg-green-500 text-white py-3 rounded-lg text-sm font-medium hover:bg-green-600 transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Processing...
                        </div>
                      ) : (
                        <>
                          <FiCreditCard className="w-4 h-4" />
                          Submit Payment
                        </>
                      )}
                    </motion.button>
                  </div>
                )}
              </div>

              <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-100/50 rounded-xl p-4 backdrop-blur-sm">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <FiCreditCard className="w-4 h-4 text-yellow-700" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-yellow-800 font-medium mb-1">Transaction Fee Notice</p>
                    <p className="text-sm text-yellow-700/90">
                      A service charge of <strong className="text-yellow-900">₦{transactionCharge.toFixed(2)}</strong> will be applied to bank transfers.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  { name: 'Mic', number: '7324484567', bank: 'Werna Bank' },
                  { name: 'Mic', number: '5025249620', bank: 'Sterling Bank' },
                ].map((account, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.01 }}
                    className={`p-5 rounded-xl relative group shadow-sm hover:shadow-md transition-all duration-200 ${
                      isDarkMode 
                        ? 'bg-dark-surface border border-dark-border hover:bg-dark-surface-tertiary' 
                        : 'bg-white border border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className={`font-medium ${
                          isDarkMode ? 'text-dark-text-primary' : 'text-gray-700'
                        }`}>{account.bank}</p>
                        <p className={`text-sm mt-1 ${
                          isDarkMode ? 'text-dark-text-secondary' : 'text-gray-600'
                        }`}><strong>Name:</strong> {account.name}</p>
                        <p className={`text-sm ${
                          isDarkMode ? 'text-dark-text-secondary' : 'text-gray-600'
                        }`}><strong>Number:</strong> {account.number}</p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(account.number, index)}
                        className={`transition-colors ${
                          isDarkMode 
                            ? 'text-dark-text-secondary hover:text-primary-400' 
                            : 'text-green-500 hover:text-green-600'
                        }`}
                        title="Copy account number"
                      >
                        {copiedAccount === index ? (
                          <FiCheck className="w-5 h-5" />
                        ) : (
                          <FiClipboard className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div variants={cardVariants} className={`p-6 rounded-xl shadow-md ${
            isDarkMode ? 'bg-dark-surface-secondary border border-dark-border' : 'bg-white'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-xl font-semibold flex items-center ${
                isDarkMode ? 'text-dark-text-primary' : 'text-gray-800'
              }`}>
                <FiClock className="w-6 h-6 mr-2 text-green-500" />
                Recent Transactions
              </h2>
            </div>
            <div className="space-y-6">
              <div className={`p-5 rounded-xl border ${
                isDarkMode 
                  ? 'bg-dark-surface border-dark-border' 
                  : 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200/50'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Last Transaction</p>
                    <p className="text-3xl font-bold text-green-500 mt-1">
                      ₦{transactions[0]?.amount.toFixed(2) || '0.00'}
                    </p>
                  </div>
                  <div className={`p-3 rounded-xl ${transactions[0]?.type === 'credit' ? 'bg-green-100' : 'bg-red-100'}`}>
                    {transactions[0]?.type === 'credit' ? (
                      <FiArrowDown className="w-6 h-6 text-green-600" />
                    ) : (
                      <FiArrowUp className="w-6 h-6 text-red-600" />
                    )}
                  </div>
                </div>
                {transactions[0] && (
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(transactions[0].date).toLocaleDateString('en-US', { 
                      month: 'long', 
                      day: 'numeric', 
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                {transactions.map((transaction) => (
                  <motion.div
                    key={transaction.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    whileHover={{ scale: 1.01 }}
                    className={`flex justify-between items-center p-4 rounded-xl transition-all duration-200 border shadow-sm hover:shadow-md ${
                      isDarkMode 
                        ? 'bg-dark-surface border-dark-border hover:bg-dark-surface-tertiary' 
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mr-4 ${
                        transaction.type === 'credit' 
                          ? isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-600'
                          : isDarkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-600'
                      }`}>
                        {transaction.type === 'credit' ? (
                          <FiArrowDown className="w-5 h-5" />
                        ) : (
                          <FiArrowUp className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <p className={`font-medium ${
                          isDarkMode ? 'text-dark-text-primary' : 'text-gray-700'
                        }`}>{transaction.label}</p>
                        <p className={`text-xs ${
                          isDarkMode ? 'text-dark-text-secondary' : 'text-gray-500'
                        }`}>{new Date(transaction.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <p className={`text-sm font-semibold ${
                      transaction.type === 'credit'
                        ? isDarkMode ? 'text-green-400' : 'text-green-600'
                        : isDarkMode ? 'text-red-400' : 'text-red-600'
                    }`}>
                      {transaction.type === 'credit' ? '+' : '-'} ₦{Math.abs(transaction.amount).toFixed(2)}
                    </p>
                  </motion.div>
                ))}
                {transactions.length === 0 && (
                  <p className={`text-center text-sm ${
                    isDarkMode ? 'text-dark-text-secondary' : 'text-gray-500'
                  }`}>No recent transactions</p>
                )}
              </div>

              <motion.button
                whileHover={{ scale: 1.02, backgroundColor: '#16a34a' }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowAllTransactions(!showAllTransactions)}
                className="w-full bg-green-500 text-white py-3.5 rounded-xl text-sm font-medium hover:bg-green-600 transition-all duration-200 flex items-center justify-center gap-2.5 shadow-lg shadow-green-500/25"
              >
                <FiClock className="w-4 h-4" />
                {showAllTransactions ? 'Show Less' : 'View All Transactions'}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>

        <AnimatePresence>
          {showPaymentPreview && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50`}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className={`w-full max-w-md rounded-2xl p-8 shadow-2xl border ${
                  isDarkMode 
                    ? 'bg-dark-surface border-dark-border text-dark-text-primary' 
                    : 'bg-white border-gray-200/50'
                }`}
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className={`text-2xl font-bold mb-1 ${
                      isDarkMode ? 'text-dark-text-primary' : 'text-gray-800'
                    }`}>
                      Payment Details
                    </h2>
                    <p className={`text-sm ${
                      isDarkMode ? 'text-dark-text-secondary' : 'text-gray-500'
                    }`}>Review your transaction details</p>
                  </div>
                  <button
                    onClick={() => setShowPaymentPreview(false)}
                    className={`p-2 rounded-full transition-colors ${
                      isDarkMode 
                        ? 'text-dark-text-secondary hover:bg-dark-border' 
                        : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className={`p-6 rounded-xl border ${
                    isDarkMode 
                      ? 'bg-dark-surface border-dark-border' 
                      : 'bg-gradient-to-r from-green-50 to-green-100/50 border-green-100'
                  }`}>
                    <div className="flex items-center justify-between mb-4">
                      <p className={`text-sm font-medium ${
                        isDarkMode ? 'text-dark-text-primary' : 'text-green-800'
                      }`}>Amount to Pay</p>
                      <div className={`px-4 py-2 rounded-lg shadow-sm border ${
                        isDarkMode 
                          ? 'bg-dark-surface-secondary border-dark-border' 
                          : 'bg-white border-green-200'
                      }`}>
                        <p className={`text-lg font-bold ${
                          isDarkMode ? 'text-dark-text-primary' : 'text-green-600'
                        }`}>₦{parseFloat(paymentAmount || 0).toFixed(2)}</p>
                      </div>
                    </div>
                    
                    <div className={`flex items-center justify-between text-sm ${
                      isDarkMode ? 'text-dark-text-secondary' : 'text-green-700'
                    }`}>
                      <p>Service Charge</p>
                      <p className="font-medium">₦{transactionCharge.toFixed(2)}</p>
                    </div>
                    
                    <div className={`h-px my-3 ${
                      isDarkMode ? 'bg-dark-border' : 'bg-green-200'
                    }`}></div>
                    
                    <div className="flex items-center justify-between">
                      <p className={`text-sm font-medium ${
                        isDarkMode ? 'text-dark-text-primary' : 'text-green-800'
                      }`}>Total Amount</p>
                      <p className={`text-lg font-bold ${
                        isDarkMode ? 'text-dark-text-primary' : 'text-green-600'
                      }`}>₦{(parseFloat(paymentAmount || 0) + transactionCharge).toFixed(2)}</p>
                    </div>
                  </div>

                  <div className={`p-4 rounded-xl space-y-3 border ${
                    isDarkMode 
                      ? 'bg-dark-surface border-dark-border' 
                      : 'bg-gray-50 border-gray-100'
                  }`}>
                    <div className="flex justify-between">
                      <p className={`text-sm ${
                        isDarkMode ? 'text-dark-text-secondary' : 'text-gray-500'
                      }`}>Transaction ID</p>
                      <p className={`text-sm font-medium ${
                        isDarkMode ? 'text-dark-text-primary' : 'text-gray-900'
                      }`}>AG-{Date.now()}-HAW1M</p>
                    </div>
                    <div className="flex justify-between">
                      <p className={`text-sm ${
                        isDarkMode ? 'text-dark-text-secondary' : 'text-gray-500'
                      }`}>Date</p>
                      <p className={`text-sm font-medium ${
                        isDarkMode ? 'text-dark-text-primary' : 'text-gray-900'
                      }`}>{new Date().toLocaleString()}</p>
                    </div>
                    <div className="flex justify-between">
                      <p className={`text-sm ${
                        isDarkMode ? 'text-dark-text-secondary' : 'text-gray-500'
                      }`}>Payment Method</p>
                      <div className="flex items-center gap-1.5">
                        <FiCreditCard className={`w-4 h-4 ${
                          isDarkMode ? 'text-dark-text-secondary' : 'text-gray-600'
                        }`} />
                        <p className={`text-sm font-medium ${
                          isDarkMode ? 'text-dark-text-primary' : 'text-gray-900'
                        }`}>Card Payment</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex gap-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowPaymentPreview(false)}
                    className={`flex-1 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                      isDarkMode 
                        ? 'bg-dark-surface text-dark-text-primary hover:bg-dark-border' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    disabled={isLoading}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={confirmPayment}
                    className={`flex-1 bg-green-500 text-white py-3.5 rounded-xl text-sm font-medium hover:bg-green-600 transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-green-500/25`}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Processing...
                      </div>
                    ) : (
                      'Confirm Payment'
                    )}
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Wallet;