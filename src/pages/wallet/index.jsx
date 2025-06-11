import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTransactions } from '../../contexts/TransactionContext';
import { FiCreditCard, FiDollarSign, FiClock, FiArrowUp, FiArrowDown, FiX, FiClipboard, FiCheck, FiPlus } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { useDarkMode } from '../../contexts/DarkModeContext';
import Card, { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/card';
import Button from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import Label from '../../components/ui/label';
import { Separator } from '../../components/ui/separator';
import { toast } from 'react-hot-toast';
import { cn } from '../../lib/utils';
import { v4 as uuidv4 } from 'uuid';
import { Toaster } from 'react-hot-toast';

const Wallet = () => {
  const [showInput, setShowInput] = useState(false);
  const [amount, setAmount] = useState('');
  const [showPaymentPreview, setShowPaymentPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [copiedAccount, setCopiedAccount] = useState(null);
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  const [showBankDetails, setShowBankDetails] = useState(false);
  const { user } = useAuth();
  const { transactions = [], walletBalance = 0, fundWallet, getRecentTransactions } = useTransactions();
  const transactionCharge = 50.0;
  const { isDarkMode } = useDarkMode();

  const handlePayment = async (method) => {
    if (!amount || !amount.trim()) {
      toast.error('Please enter an amount', {
        duration: 4000,
        position: 'top-center',
        style: {
          background: isDarkMode ? '#1f2937' : '#fff',
          color: isDarkMode ? '#fff' : '#000',
          border: '1px solid',
          borderColor: isDarkMode ? '#374151' : '#e5e7eb',
        },
      });
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error('Please enter a valid amount greater than zero', {
        duration: 4000,
        position: 'top-center',
        style: {
          background: isDarkMode ? '#1f2937' : '#fff',
          color: isDarkMode ? '#fff' : '#000',
          border: '1px solid',
          borderColor: isDarkMode ? '#374151' : '#e5e7eb',
        },
      });
      return;
    }

    if (method === 'card') {
      setShowPaymentPreview(true);
    } else {
      setShowBankDetails(true);
    }
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

  const confirmCardPayment = async () => {
    try {
      const numAmount = parseFloat(amount);
      await fundWallet(numAmount, 'card');
      toast.success('Wallet funded successfully!', {
        duration: 4000,
        position: 'top-center',
        style: {
          background: isDarkMode ? '#1f2937' : '#fff',
          color: isDarkMode ? '#fff' : '#000',
          border: '1px solid',
          borderColor: isDarkMode ? '#374151' : '#e5e7eb',
        },
      });
      setAmount('');
      setShowPaymentPreview(false);
    } catch (error) {
      toast.error(error.message || 'Failed to fund wallet', {
        duration: 4000,
        position: 'top-center',
        style: {
          background: isDarkMode ? '#1f2937' : '#fff',
          color: isDarkMode ? '#fff' : '#000',
          border: '1px solid',
          borderColor: isDarkMode ? '#374151' : '#e5e7eb',
        },
      });
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

  // Helper function to safely format amount
  const formatAmount = (amount) => {
    const num = parseFloat(amount);
    return isNaN(num) ? '0.00' : num.toFixed(2);
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className={cn(
        "container mx-auto px-4 py-8",
        isDarkMode ? "bg-black" : "bg-white"
      )}
    >
      <Toaster />
      <div className="max-w-4xl mx-auto space-y-8">
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
          <Card className={cn(
            "border",
            isDarkMode ? "bg-black border-white/10" : "bg-white border-black/10"
          )}>
            <CardHeader>
              <CardTitle className={cn(
                "text-2xl font-bold",
                isDarkMode ? "text-white" : "text-black"
              )}>
                Wallet Balance
              </CardTitle>
              <CardDescription className={cn(
                isDarkMode ? "text-white/60" : "text-black/60"
              )}>
                Your current available balance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className={cn(
                    "text-5xl font-bold tracking-tight",
                    isDarkMode ? "text-white" : "text-black"
                  )}>
                    ₦{formatAmount(walletBalance)}
                  </p>
                  <p className={cn(
                    "text-sm mt-2",
                    isDarkMode ? "text-white/60" : "text-black/60"
                  )}>
                    Available for transactions
                  </p>
                </div>
                <div className={cn(
                  "p-3 rounded-full",
                  isDarkMode ? "bg-white/5" : "bg-black/5"
                )}>
                  <FiDollarSign className={cn(
                    "w-8 h-8",
                    isDarkMode ? "text-white" : "text-black"
                  )} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={cn(
            "border",
            isDarkMode ? "bg-black border-white/10" : "bg-white border-black/10"
          )}>
            <CardHeader>
              <CardTitle className={cn(
                "text-xl font-bold",
                isDarkMode ? "text-white" : "text-black"
              )}>
                Fund Your Wallet
              </CardTitle>
              <CardDescription className={cn(
                isDarkMode ? "text-white/60" : "text-black/60"
              )}>
                Add funds to your wallet using any of the payment methods below
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="amount" className={cn(
                    isDarkMode ? "text-white" : "text-black"
                  )}>Amount (₦)</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    className={cn(
                      "w-full",
                      isDarkMode ? "bg-black border-white/10 text-white" : "bg-white border-black/10 text-black"
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    onClick={() => handlePayment('card')}
                    className={cn(
                      "w-full h-12",
                      isDarkMode ? "bg-white text-black hover:bg-white/90" : "bg-black text-white hover:bg-black/90"
                    )}
                  >
                    <FiCreditCard className="w-5 h-5 mr-2" />
                    Pay with Card
                  </Button>
                  <Button
                    onClick={() => handlePayment('bank')}
                    className={cn(
                      "w-full h-12",
                      isDarkMode ? "bg-white text-black hover:bg-white/90" : "bg-black text-white hover:bg-black/90"
                    )}
                  >
                    <FiPlus className="w-5 h-5 mr-2" />
                    Bank Transfer
                  </Button>
                </div>
                <div className={cn(
                  "p-4 rounded-lg",
                  isDarkMode ? "bg-white/5" : "bg-black/5"
                )}>
                  <p className={cn(
                    "text-sm",
                    isDarkMode ? "text-white/60" : "text-black/60"
                  )}>
                    Transaction Charge: ₦{transactionCharge.toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={cn(
            "border",
            isDarkMode ? "bg-black border-white/10" : "bg-white border-black/10"
          )}>
            <CardHeader>
              <CardTitle className={cn(
                "text-xl font-bold",
                isDarkMode ? "text-white" : "text-black"
              )}>
                Recent Transactions
              </CardTitle>
              <CardDescription className={cn(
                isDarkMode ? "text-white/60" : "text-black/60"
              )}>
                Your recent wallet activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              {transactions && transactions.length > 0 ? (
                <div className="space-y-4">
                  {transactions.map((transaction, index) => (
                    <motion.div
                      key={index}
                      variants={cardVariants}
                      className={cn(
                        "p-4 rounded-lg flex items-center justify-between",
                        isDarkMode ? "bg-white/5" : "bg-black/5"
                      )}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={cn(
                          "p-3 rounded-full",
                          isDarkMode ? "bg-white/10" : "bg-black/10"
                        )}>
                          {transaction.type === 'credit' ? (
                            <FiArrowDown className={cn(
                              "w-5 h-5",
                              isDarkMode ? "text-white" : "text-black"
                            )} />
                          ) : (
                            <FiArrowUp className={cn(
                              "w-5 h-5",
                              isDarkMode ? "text-white" : "text-black"
                            )} />
                          )}
                        </div>
                        <div>
                          <p className={cn(
                            "font-medium",
                            isDarkMode ? "text-white" : "text-black"
                          )}>
                            {transaction.description || 'Transaction'}
                          </p>
                          <p className={cn(
                            "text-sm",
                            isDarkMode ? "text-white/60" : "text-black/60"
                          )}>
                            {new Date(transaction.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <p className={cn(
                        "font-semibold",
                        isDarkMode ? "text-white" : "text-black"
                      )}>
                        {transaction.type === 'credit' ? '+' : '-'} ₦{formatAmount(transaction.amount)}
                      </p>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className={cn(
                  "text-center py-8",
                  isDarkMode ? "text-white/60" : "text-black/60"
                )}>
                  <p>No transactions yet</p>
                  <p className="text-sm mt-2">Your transaction history will appear here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <AnimatePresence>
          {showPaymentPreview && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className={cn(
                  "w-full max-w-md p-6 rounded-lg shadow-lg",
                  isDarkMode ? "bg-black" : "bg-white"
                )}
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className={cn(
                    "text-lg font-semibold",
                    isDarkMode ? "text-white" : "text-black"
                  )}>
                    Confirm Payment
                  </h3>
                  <button
                    onClick={() => setShowPaymentPreview(false)}
                    className={cn(
                      "p-2 rounded-full hover:bg-white/5",
                      isDarkMode ? "text-white" : "text-black"
                    )}
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div className={cn(
                    "p-4 rounded-lg",
                    isDarkMode ? "bg-white/5" : "bg-black/5"
                  )}>
                    <div className="space-y-2">
                      <p className={cn(
                        "text-sm",
                        isDarkMode ? "text-white/60" : "text-black/60"
                      )}>
                        Transaction ID: {uuidv4()}
                      </p>
                      <p className={cn(
                        "text-sm",
                        isDarkMode ? "text-white/60" : "text-black/60"
                      )}>
                        Amount: ₦{formatAmount(amount)}
                      </p>
                      <p className={cn(
                        "text-sm",
                        isDarkMode ? "text-white/60" : "text-black/60"
                      )}>
                        Transaction Charge: ₦{transactionCharge.toFixed(2)}
                      </p>
                      <p className={cn(
                        "text-sm font-semibold",
                        isDarkMode ? "text-white" : "text-black"
                      )}>
                        Total: ₦{(parseFloat(amount) + transactionCharge).toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => setShowPaymentPreview(false)}
                      className={cn(
                        "flex-1",
                        isDarkMode ? "bg-white/5 hover:bg-white/10" : "bg-black/5 hover:bg-black/10"
                      )}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={confirmCardPayment}
                      className={cn(
                        "flex-1",
                        isDarkMode ? "bg-white text-black hover:bg-white/90" : "bg-black text-white hover:bg-black/90"
                      )}
                    >
                      Confirm Payment
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bank Details Modal */}
        <AnimatePresence>
          {showBankDetails && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className={cn(
                  "w-full max-w-md p-6 rounded-lg shadow-lg",
                  isDarkMode ? "bg-black" : "bg-white"
                )}
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className={cn(
                    "text-lg font-semibold",
                    isDarkMode ? "text-white" : "text-black"
                  )}>
                    Bank Account Details
                  </h3>
                  <button
                    onClick={() => setShowBankDetails(false)}
                    className={cn(
                      "p-2 rounded-full hover:bg-white/5",
                      isDarkMode ? "text-white" : "text-black"
                    )}
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-4">
                  {/* Add bank account details here */}
                  <div className={cn(
                    "p-4 rounded-lg",
                    isDarkMode ? "bg-white/5" : "bg-black/5"
                  )}>
                    <p className={cn(
                      "text-sm",
                      isDarkMode ? "text-white/60" : "text-black/60"
                    )}>
                      Please make your payment and the funds will be credited to your wallet within 24 hours.
                    </p>
                  </div>
                  <Button
                    onClick={() => setShowBankDetails(false)}
                    className={cn(
                      "w-full",
                      isDarkMode ? "bg-white text-black hover:bg-white/90" : "bg-black text-white hover:bg-black/90"
                    )}
                  >
                    Close
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default Wallet;