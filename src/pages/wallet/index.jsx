// src/pages/wallet/index.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTransactions } from '../../contexts/TransactionContext';

const Wallet = () => {
  const [showInput, setShowInput] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [showPaymentPreview, setShowPaymentPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { walletBalance, fundWallet, getRecentTransactions } = useTransactions();
  const transactions = getRecentTransactions(5);
  const transactionCharge = 50.0;

  const handlePayment = () => {
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid amount greater than zero.');
      return;
    }
    setError('');
    setShowPaymentPreview(true);
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
    <div className="bg-gray-50 min-h-screen font-nunito p-6">
      <div className="mx-auto max-w-6xl">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div variants={cardVariants} className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Wallet Details</h2>
            <div className="space-y-6">
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-gray-600 text-sm">Available Balance</p>
                <p className="text-3xl font-bold text-green-500">₦{(walletBalance || 0).toLocaleString()}</p>
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => setShowInput(!showInput)}
                  className="w-full bg-green-500 text-white py-2 rounded-md text-sm font-medium hover:bg-green-600 transition-all duration-200"
                >
                  {showInput ? 'Cancel' : 'Pay With Card'}
                </button>

                {showInput && (
                  <div className="space-y-3">
                    <input
                      type="number"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      placeholder="Enter amount (₦)"
                      className={`w-full px-4 py-2 rounded-md border ${
                        error ? 'border-red-500' : 'border-gray-300'
                      } bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200`}
                      min="1"
                      disabled={isLoading}
                    />
                    {error && <p className="text-red-500 text-xs">{error}</p>}
                    <button
                      onClick={handlePayment}
                      className="w-full bg-green-500 text-white py-2 rounded-md text-sm font-medium hover:bg-green-600 transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Processing...' : 'Submit Payment'}
                    </button>
                  </div>
                )}
              </div>

              <p className="text-xs text-gray-500">
                Note: A <strong>₦{transactionCharge.toFixed(2)}</strong> transaction charge applies to bank transfers.
              </p>

              <div className="space-y-4">
                {[
                  { name: 'Mic', number: '7324484567', bank: 'Werna Bank' },
                  { name: 'Mic', number: '5025249620', bank: 'Sterling Bank' },
                ].map((account, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded-md">
                    <p className="text-gray-600 text-sm"><strong>Account Name:</strong> {account.name}</p>
                    <p className="text-gray-600 text-sm"><strong>Account Number:</strong> {account.number}</p>
                    <p className="text-gray-600 text-sm"><strong>Bank:</strong> {account.bank}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div variants={cardVariants} className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Transactions</h2>
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-600 text-sm">Last Recharge</p>
                <p className="text-2xl font-bold text-green-500">
                  ₦{transactions[0]?.amount.toFixed(2) || '0.00'}
                </p>
              </div>

              <div className="space-y-3">
                {transactions.map((transaction) => (
                  <motion.div
                    key={transaction.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-all duration-200"
                  >
                    <div>
                      <p className="text-gray-700 text-sm font-medium">{transaction.label}</p>
                      <p className="text-xs text-gray-400">{transaction.date.split('T')[0]}</p>
                    </div>
                    <p
                      className={`text-sm font-semibold ${
                        transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {transaction.type === 'credit' ? '+' : '-'} ₦{Math.abs(transaction.amount).toFixed(2)}
                    </p>
                  </motion.div>
                ))}
                {transactions.length === 0 && (
                  <p className="text-center text-gray-500 text-sm">No recent transactions</p>
                )}
              </div>

              <button className="w-full bg-green-500 text-white py-2 rounded-md text-sm font-medium hover:bg-green-600 transition-all duration-200">
                View All Transactions
              </button>
            </div>
          </motion.div>
        </motion.div>

        {showPaymentPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Payment Preview</h2>
              <div className="space-y-3 text-sm">
                <p><strong>Transaction:</strong> e-Wallet Topup</p>
                <p><strong>Invoice No:</strong> AG-{Date.now()}-HAW1M</p>
                <p><strong>Date:</strong> {new Date().toLocaleString()}</p>
                <p><strong>Amount:</strong> ₦{parseFloat(paymentAmount || 0).toFixed(2)}</p>
                <p><strong>Transaction Charge:</strong> ₦{transactionCharge.toFixed(2)}</p>
                <p><strong>Total:</strong> ₦{(parseFloat(paymentAmount || 0) + transactionCharge).toFixed(2)}</p>
              </div>
              <div className="mt-6 flex justify-end gap-4">
                <button
                  onClick={() => setShowPaymentPreview(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-600 transition-all duration-200"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmPayment}
                  className="bg-green-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-600 transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                  disabled={isLoading}
                >
                  {isLoading && <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" className="opacity-25" /><path fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" className="opacity-75" /></svg>}
                  {isLoading ? 'Processing...' : 'Confirm'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Wallet;