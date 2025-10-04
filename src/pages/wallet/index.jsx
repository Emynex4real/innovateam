import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCreditCard, FiDollarSign, FiArrowUp, FiArrowDown, FiX, FiPlus, FiRefreshCw, FiClock } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { useDarkMode } from '../../contexts/DarkModeContext';
import { useWallet } from '../../contexts/WalletContext';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card';
import Button from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import Label from '../../components/ui/label';
import { toast } from 'react-hot-toast';
import { cn } from '../../lib/utils';
import { Toaster } from 'react-hot-toast';
import walletService from '../../services/wallet.service';

const Wallet = () => {
  const [amount, setAmount] = useState('');
  const [showPaymentPreview, setShowPaymentPreview] = useState(false);
  const [showBankDetails, setShowBankDetails] = useState(false);
  const [stats, setStats] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const { walletBalance, transactions, loading, fundWallet, fetchWalletData } = useWallet();
  const { isDarkMode } = useDarkMode();
  const transactionCharge = 50.0;

  useEffect(() => {
    if (isAuthenticated) {
      fetchWalletStats();
    }
  }, [isAuthenticated]);

  const fetchWalletStats = async () => {
    try {
      const walletStats = await walletService.getStats();
      setStats(walletStats);
    } catch (error) {
      toast.error('Failed to load wallet stats');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchWalletData();
    await fetchWalletStats();
    setRefreshing(false);
    toast.success('Wallet refreshed');
  };

  const handlePayment = async (method) => {
    if (!amount || !amount.trim()) {
      toast.error('Please enter an amount');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error('Please enter a valid amount greater than zero');
      return;
    }

    if (method === 'card') {
      setShowPaymentPreview(true);
    } else {
      setShowBankDetails(true);
    }
  };

  const confirmCardPayment = async () => {
    try {
      const numAmount = parseFloat(amount);
      
      await fundWallet(numAmount, 'card');

      toast.success('Wallet funded successfully!');
      setAmount('');
      setShowPaymentPreview(false);
    } catch (error) {
      toast.error(error.message || 'Failed to fund wallet');
    }
  };

  const formatAmount = (amount) => {
    const num = parseFloat(amount);
    return isNaN(num) ? '0.00' : num.toFixed(2);
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'credit':
        return <FiArrowDown className="w-5 h-5 text-green-500" />;
      case 'debit':
        return <FiArrowUp className="w-5 h-5 text-red-500" />;
      default:
        return <FiDollarSign className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-500';
      case 'pending':
        return 'text-yellow-500';
      case 'failed':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please Login</h1>
          <p className="text-gray-600">You need to be logged in to access your wallet.</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn(
        "container mx-auto px-4 py-8 min-h-screen",
        isDarkMode ? "bg-black" : "bg-white"
      )}
    >
      <Toaster />
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <h1 className={cn(
              "text-4xl font-bold",
              isDarkMode ? "text-white" : "text-black"
            )}>
              My Wallet
            </h1>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className={cn(
                "p-2 rounded-full transition-colors",
                isDarkMode ? "hover:bg-white/10" : "hover:bg-black/10",
                refreshing && "animate-spin"
              )}
            >
              <FiRefreshCw className={cn(
                "w-6 h-6",
                isDarkMode ? "text-white" : "text-black"
              )} />
            </button>
          </div>
          <p className={cn(
            "text-lg",
            isDarkMode ? "text-white/60" : "text-black/60"
          )}>
            Welcome, {user?.name || user?.email}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className={cn(
            "border",
            isDarkMode ? "bg-black border-white/10" : "bg-white border-black/10"
          )}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={cn(
                    "text-sm font-medium",
                    isDarkMode ? "text-white/60" : "text-black/60"
                  )}>
                    Wallet Balance
                  </p>
                  <p className={cn(
                    "text-3xl font-bold",
                    isDarkMode ? "text-white" : "text-black"
                  )}>
                    ₦{formatAmount(walletBalance)}
                  </p>
                </div>
                <FiDollarSign className={cn(
                  "w-8 h-8",
                  isDarkMode ? "text-white/40" : "text-black/40"
                )} />
              </div>
            </CardContent>
          </Card>

          <Card className={cn(
            "border",
            isDarkMode ? "bg-black border-white/10" : "bg-white border-black/10"
          )}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={cn(
                    "text-sm font-medium",
                    isDarkMode ? "text-white/60" : "text-black/60"
                  )}>
                    Total Transactions
                  </p>
                  <p className={cn(
                    "text-3xl font-bold text-blue-500"
                  )}>
                    {stats.totalTransactions || 0}
                  </p>
                </div>
                <FiArrowUp className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className={cn(
            "border",
            isDarkMode ? "bg-black border-white/10" : "bg-white border-black/10"
          )}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={cn(
                    "text-sm font-medium",
                    isDarkMode ? "text-white/60" : "text-black/60"
                  )}>
                    Total Credits
                  </p>
                  <p className="text-3xl font-bold text-green-500">
                    ₦{formatAmount(stats.totalCredits || 0)}
                  </p>
                </div>
                <FiArrowDown className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className={cn(
            "border",
            isDarkMode ? "bg-black border-white/10" : "bg-white border-black/10"
          )}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={cn(
                    "text-sm font-medium",
                    isDarkMode ? "text-white/60" : "text-black/60"
                  )}>
                    Pending
                  </p>
                  <p className="text-3xl font-bold text-yellow-500">
                    {stats.pendingTransactions || 0}
                  </p>
                </div>
                <FiClock className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Fund Wallet Card */}
          <Card className={cn(
            "border",
            isDarkMode ? "bg-black border-white/10" : "bg-white border-black/10"
          )}>
            <CardHeader>
              <CardTitle className={cn(
                "text-2xl font-bold",
                isDarkMode ? "text-white" : "text-black"
              )}>
                Fund Your Wallet
              </CardTitle>
              <CardDescription className={cn(
                isDarkMode ? "text-white/60" : "text-black/60"
              )}>
                Add funds to your wallet using secure payment methods
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="amount" className={cn(
                    "text-sm font-medium",
                    isDarkMode ? "text-white" : "text-black"
                  )}>Amount (₦)</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    className={cn(
                      "w-full h-12 text-lg",
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

          {/* Recent Transactions */}
          <Card className={cn(
            "border",
            isDarkMode ? "bg-black border-white/10" : "bg-white border-black/10"
          )}>
            <CardHeader>
              <CardTitle className={cn(
                "text-2xl font-bold",
                isDarkMode ? "text-white" : "text-black"
              )}>
                Recent Transactions
              </CardTitle>
              <CardDescription className={cn(
                isDarkMode ? "text-white/60" : "text-black/60"
              )}>
                Your latest wallet activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : transactions && transactions.length > 0 ? (
                <div className="space-y-4 max-h-80 overflow-y-auto">
                  {transactions.slice(0, 10).map((transaction) => (
                    <motion.div
                      key={transaction.id}
                      className={cn(
                        "p-4 rounded-lg flex items-center justify-between border",
                        isDarkMode ? "bg-white/5 border-white/10" : "bg-black/5 border-black/10"
                      )}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={cn(
                          "p-3 rounded-full",
                          isDarkMode ? "bg-white/10" : "bg-black/10"
                        )}>
                          {getTransactionIcon(transaction.type)}
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
                      <div className="text-right">
                        <p className={cn(
                          "font-semibold",
                          transaction.type === 'credit' ? "text-green-500" : "text-red-500"
                        )}>
                          {transaction.type === 'credit' ? '+' : '-'} ₦{formatAmount(transaction.amount)}
                        </p>
                        <p className={cn(
                          "text-xs capitalize",
                          getStatusColor(transaction.status)
                        )}>
                          {transaction.status}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className={cn(
                  "text-center py-12",
                  isDarkMode ? "text-white/60" : "text-black/60"
                )}>
                  <FiDollarSign className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">No transactions yet</p>
                  <p className="text-sm">Your transaction history will appear here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Payment Confirmation Modal */}
        <AnimatePresence>
          {showPaymentPreview && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className={cn(
                  "w-full max-w-md p-6 rounded-lg shadow-xl",
                  isDarkMode ? "bg-black border border-white/10" : "bg-white border border-black/10"
                )}
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className={cn(
                    "text-xl font-semibold",
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
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className={cn(
                          "text-sm",
                          isDarkMode ? "text-white/60" : "text-black/60"
                        )}>Amount:</span>
                        <span className={cn(
                          "text-sm font-medium",
                          isDarkMode ? "text-white" : "text-black"
                        )}>₦{formatAmount(amount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={cn(
                          "text-sm",
                          isDarkMode ? "text-white/60" : "text-black/60"
                        )}>Transaction Charge:</span>
                        <span className={cn(
                          "text-sm font-medium",
                          isDarkMode ? "text-white" : "text-black"
                        )}>₦{transactionCharge.toFixed(2)}</span>
                      </div>
                      <div className="border-t pt-3">
                        <div className="flex justify-between">
                          <span className={cn(
                            "font-semibold",
                            isDarkMode ? "text-white" : "text-black"
                          )}>Total:</span>
                          <span className={cn(
                            "font-semibold",
                            isDarkMode ? "text-white" : "text-black"
                          )}>₦{(parseFloat(amount) + transactionCharge).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => setShowPaymentPreview(false)}
                      className={cn(
                        "flex-1",
                        isDarkMode ? "bg-white/10 hover:bg-white/20 text-white" : "bg-black/10 hover:bg-black/20 text-black"
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
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className={cn(
                  "w-full max-w-md p-6 rounded-lg shadow-xl",
                  isDarkMode ? "bg-black border border-white/10" : "bg-white border border-black/10"
                )}
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className={cn(
                    "text-xl font-semibold",
                    isDarkMode ? "text-white" : "text-black"
                  )}>
                    Bank Transfer Details
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
                  <div className={cn(
                    "p-4 rounded-lg",
                    isDarkMode ? "bg-white/5" : "bg-black/5"
                  )}>
                    <p className={cn(
                      "text-sm mb-4",
                      isDarkMode ? "text-white/60" : "text-black/60"
                    )}>
                      Transfer ₦{formatAmount(amount)} to the account below and your wallet will be credited within 24 hours.
                    </p>
                    <div className="space-y-2">
                      <p className={cn(
                        "text-sm",
                        isDarkMode ? "text-white" : "text-black"
                      )}>
                        <strong>Bank:</strong> Example Bank
                      </p>
                      <p className={cn(
                        "text-sm",
                        isDarkMode ? "text-white" : "text-black"
                      )}>
                        <strong>Account Number:</strong> 1234567890
                      </p>
                      <p className={cn(
                        "text-sm",
                        isDarkMode ? "text-white" : "text-black"
                      )}>
                        <strong>Account Name:</strong> Your Company Name
                      </p>
                    </div>
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