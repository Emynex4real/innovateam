import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTransactions } from '../../contexts/TransactionContext';
import { FiCreditCard, FiDollarSign, FiClock, FiArrowUp, FiArrowDown, FiX, FiClipboard, FiCheck } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { useDarkMode } from '../../contexts/DarkModeContext';
import Card, { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/card';
import Button from '../../components/ui/button';
import Input from '../../components/ui/input';

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
      setSuccessMessage(`Payment successful! Your wallet has been credited with ₦${amount.toLocaleString()}.`);
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
              className={`px-6 py-4 rounded-xl mb-6 flex items-center justify-between ${
                isDarkMode 
                  ? 'bg-green-900/30 border border-green-800 text-green-400' 
                  : 'bg-green-50 border border-green-200/50 text-green-700'
              }`}
            >
              <div className="flex items-center">
                <FiCheck className="w-5 h-5 mr-2" />
                {successMessage}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSuccessMessage('')}
                className={isDarkMode ? 'hover:bg-green-800/30' : 'hover:bg-green-100'}
              >
                <FiX className="w-5 h-5" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className={isDarkMode ? 'bg-dark-surface-secondary border-dark-border' : ''}>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FiDollarSign className="w-6 h-6 mr-2 text-green-500" />
                Wallet Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
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
                <Button
                  variant={showInput ? "outline" : "success"}
                  className="w-full"
                  onClick={() => setShowInput(!showInput)}
                >
                  {showInput ? (
                    <>
                      <FiX className="w-4 h-4 mr-2" />
                      Cancel Payment
                    </>
                  ) : (
                    <>
                      <FiCreditCard className="w-4 h-4 mr-2" />
                      Add Money to Wallet
                    </>
                  )}
                </Button>

                {showInput && (
                  <div className="space-y-3">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <span className={`text-gray-500 ${
                          isDarkMode ? 'text-dark-text-secondary' : ''
                        }`}>₦</span>
                      </div>
                      <Input
                        type="number"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        placeholder="0.00"
                        className={`pl-8 text-lg font-medium ${
                          error 
                            ? isDarkMode
                              ? 'border-red-500 bg-red-900/20 text-red-400'
                              : 'border-red-500 bg-red-50 text-red-900'
                            : isDarkMode
                              ? 'border-gray-700 bg-gray-800 text-gray-100 placeholder-gray-500'
                              : ''
                        }`}
                        min="1"
                        disabled={isLoading}
                      />
                    </div>
                    {error && (
                      <p className={`text-xs ${
                        isDarkMode ? 'text-red-400' : 'text-red-500'
                      }`}>{error}</p>
                    )}
                    <Button
                      variant="success"
                      className="w-full"
                      onClick={handlePayment}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Processing...
                        </div>
                      ) : (
                        <>
                          <FiCreditCard className="w-4 h-4 mr-2" />
                          Submit Payment
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>

              <Card className={`${
                isDarkMode 
                  ? 'bg-yellow-900/30 border-yellow-800 text-yellow-400' 
                  : 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-100/50'
              }`}>
                <CardContent className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${
                    isDarkMode ? 'bg-yellow-800' : 'bg-yellow-100'
                  }`}>
                    <FiCreditCard className={`w-4 h-4 ${
                      isDarkMode ? 'text-yellow-400' : 'text-yellow-700'
                    }`} />
                  </div>
                  <div>
                    <p className={`text-sm font-medium mb-1 ${
                      isDarkMode ? 'text-yellow-400' : 'text-yellow-800'
                    }`}>Transaction Fee Notice</p>
                    <p className={`text-sm ${
                      isDarkMode ? 'text-yellow-500' : 'text-yellow-700/90'
                    }`}>
                      A service charge of <strong className={
                        isDarkMode ? 'text-yellow-400' : 'text-yellow-900'
                      }>₦{transactionCharge.toFixed(2)}</strong> will be applied to bank transfers.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-4">
                {[
                  { name: 'Mic', number: '7324484567', bank: 'Werna Bank' },
                  { name: 'Mic', number: '5025249620', bank: 'Sterling Bank' },
                ].map((account, index) => (
                  <Card
                    key={index}
                    className={`transition-all duration-200 ${
                      isDarkMode 
                        ? 'bg-dark-surface border-dark-border hover:bg-dark-surface-tertiary' 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <CardContent className="flex justify-between items-start">
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
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(account.number, index)}
                        className={
                          isDarkMode 
                            ? 'text-dark-text-secondary hover:text-primary-400' 
                            : 'text-green-500 hover:text-green-600'
                        }
                        title="Copy account number"
                      >
                        {copiedAccount === index ? (
                          <FiCheck className="w-5 h-5" />
                        ) : (
                          <FiClipboard className="w-5 h-5" />
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className={isDarkMode ? 'bg-dark-surface-secondary border-dark-border' : ''}>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FiClock className="w-6 h-6 mr-2 text-green-500" />
                Recent Transactions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Card className={isDarkMode ? 'bg-dark-surface border-dark-border' : 'bg-gray-50'}>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm font-medium ${
                        isDarkMode ? 'text-dark-text-secondary' : 'text-gray-600'
                      }`}>Last Transaction</p>
                      <p className="text-3xl font-bold text-green-500 mt-1">
                        ₦{transactions[0]?.amount.toFixed(2) || '0.00'}
                      </p>
                    </div>
                    <div className={`p-3 rounded-xl ${
                      transactions[0]?.type === 'credit' 
                        ? isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100'
                        : isDarkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100'
                    }`}>
                      {transactions[0]?.type === 'credit' ? (
                        <FiArrowDown className="w-6 h-6" />
                      ) : (
                        <FiArrowUp className="w-6 h-6" />
                      )}
                    </div>
                  </div>
                  {transactions[0] && (
                    <p className={`text-xs mt-2 ${
                      isDarkMode ? 'text-dark-text-secondary' : 'text-gray-500'
                    }`}>
                      {new Date(transactions[0].date).toLocaleDateString('en-US', { 
                        month: 'long', 
                        day: 'numeric', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  )}
                </CardContent>
              </Card>

              <div className="space-y-3">
                {transactions.map((transaction) => (
                  <Card
                    key={transaction.id}
                    className={`transition-all duration-200 ${
                      isDarkMode 
                        ? 'bg-dark-surface border-dark-border hover:bg-dark-surface-tertiary' 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <CardContent className="flex justify-between items-center">
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
                    </CardContent>
                  </Card>
                ))}
                {transactions.length === 0 && (
                  <p className={`text-center text-sm ${
                    isDarkMode ? 'text-dark-text-secondary' : 'text-gray-500'
                  }`}>No recent transactions</p>
                )}
              </div>

              <Button
                variant="success"
                className="w-full"
                onClick={() => setShowAllTransactions(!showAllTransactions)}
              >
                <FiClock className="w-4 h-4 mr-2" />
                {showAllTransactions ? 'Show Less' : 'View All Transactions'}
              </Button>
            </CardContent>
          </Card>
        </div>

        <AnimatePresence>
          {showPaymentPreview && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
              onClick={() => setShowPaymentPreview(false)}
            >
              <Card
                className={`w-full max-w-md ${
                  isDarkMode ? 'bg-dark-surface border-dark-border' : ''
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                <CardHeader>
                  <CardTitle>Payment Details</CardTitle>
                  <CardDescription>Review your transaction details</CardDescription>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-4 right-4"
                    onClick={() => setShowPaymentPreview(false)}
                  >
                    <FiX className="w-5 h-5" />
                  </Button>
                </CardHeader>

                <CardContent className="space-y-6">
                  <Card className={isDarkMode ? 'bg-dark-surface border-dark-border' : 'bg-gray-50'}>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <p className={`text-sm font-medium ${
                          isDarkMode ? 'text-dark-text-primary' : 'text-green-800'
                        }`}>Amount to Deposit</p>
                        <div className={`px-4 py-2 rounded-lg ${
                          isDarkMode 
                            ? 'bg-dark-surface-secondary border border-dark-border' 
                            : 'bg-white border border-green-200'
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
                      
                      <div className={`h-px ${
                        isDarkMode ? 'bg-dark-border' : 'bg-green-200'
                      }`}></div>
                      
                      <div className="flex items-center justify-between">
                        <p className={`text-sm font-medium ${
                          isDarkMode ? 'text-dark-text-primary' : 'text-green-800'
                        }`}>Total Amount to Pay</p>
                        <p className={`text-lg font-bold ${
                          isDarkMode ? 'text-dark-text-primary' : 'text-green-600'
                        }`}>₦{(parseFloat(paymentAmount || 0) + transactionCharge).toFixed(2)}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className={isDarkMode ? 'bg-dark-surface border-dark-border' : 'bg-gray-50'}>
                    <CardContent className="space-y-3">
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
                    </CardContent>
                  </Card>
                </CardContent>

                <CardFooter className="flex gap-4">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowPaymentPreview(false)}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="success"
                    className="flex-1"
                    onClick={confirmPayment}
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
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Wallet;