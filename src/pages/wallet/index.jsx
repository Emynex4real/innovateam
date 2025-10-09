import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { useWallet } from '../../contexts/WalletContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { CreditCard, Wallet as WalletIcon, TrendingUp, TrendingDown, X, Plus, RefreshCw, Clock, ArrowUpRight, ArrowDownLeft, AlertCircle } from 'lucide-react';
import { TransactionUtils } from '../../services/wallet.service.enhanced';
import toast from 'react-hot-toast';

const Wallet = () => {
  const [amount, setAmount] = useState('');
  const [showFundModal, setShowFundModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const { user } = useAuth();
  const { walletBalance, transactions, fundWallet, loading: walletLoading, fetchWalletData } = useWallet();

  const handleFundWallet = async () => {
    if (!TransactionUtils.validateAmount(amount)) {
      toast.error('Please enter a valid amount (₦1 - ₦1,000,000)');
      return;
    }
    
    setLoading(true);
    try {
      const userEmail = user?.email || 'user@example.com';
      const result = await fundWallet(parseFloat(amount), paymentMethod, userEmail);
      
      if (result.success) {
        toast.success(`Wallet funded successfully! New balance: ${TransactionUtils.formatAmount(result.balance)}`);
        setAmount('');
        setShowFundModal(false);
      } else {
        throw new Error('Funding failed');
      }
    } catch (error) {
      console.error('Funding error:', error);
      if (error.message.includes('cancelled')) {
        toast.error('Payment was cancelled');
      } else {
        toast.error(error.message || 'Failed to fund wallet');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFund = async (presetAmount) => {
    setAmount(presetAmount.toString());
    setShowFundModal(true);
  };

  const refreshWallet = async () => {
    try {
      await fetchWalletData();
      toast.success('Wallet data refreshed');
    } catch (error) {
      toast.error('Failed to refresh wallet data');
    }
  };

  const totalCredits = transactions.filter(t => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0);
  const totalDebits = transactions.filter(t => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0);



  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-primary/10 rounded-full">
              <WalletIcon className="h-12 w-12 text-primary" />
            </div>
          </div>
          <div className="flex items-center justify-center space-x-4">
            <h1 className="text-4xl font-bold tracking-tight">My Wallet</h1>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshWallet}
              disabled={walletLoading}
            >
              <RefreshCw className={`h-4 w-4 ${walletLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Manage your funds and track your transactions securely
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <WalletIcon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Wallet Balance</p>
                  <p className="text-2xl font-bold text-primary">₦{walletBalance.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Credits</p>
                  <p className="text-2xl font-bold text-green-600">₦{totalCredits.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-red-100 rounded-full">
                  <TrendingDown className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Debits</p>
                  <p className="text-2xl font-bold text-red-600">₦{totalDebits.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Transactions</p>
                  <p className="text-2xl font-bold text-blue-600">{transactions.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Fund Your Wallet</CardTitle>
              <CardDescription>
                Add funds to your wallet using secure payment methods
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Button
                onClick={() => setShowFundModal(true)}
                className="w-full"
                size="lg"
              >
                <Plus className="h-4 w-4 mr-2" />
                Fund Wallet
              </Button>
              
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">Quick Fund</h4>
                <div className="grid grid-cols-3 gap-2">
                  {[1000, 5000, 10000].map((preset) => (
                    <Button
                      key={preset}
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickFund(preset)}
                    >
                      ₦{preset.toLocaleString()}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">Secure Payments</p>
                    <p>All payments are processed securely via Paystack with 256-bit SSL encryption.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>
                Your latest wallet activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <div className="text-center py-12">
                  <WalletIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No transactions yet</p>
                  <p className="text-sm text-muted-foreground">Your transaction history will appear here</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-80 overflow-y-auto">
                  {transactions.slice(0, 5).map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${
                          transaction.type === 'credit' ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          {transaction.type === 'credit' ? (
                            <ArrowDownLeft className="h-4 w-4 text-green-600" />
                          ) : (
                            <ArrowUpRight className="h-4 w-4 text-red-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{transaction.label}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(transaction.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${
                          transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'credit' ? '+' : '-'}₦{transaction.amount.toLocaleString()}
                        </p>
                        <Badge variant={transaction.status === 'Successful' ? 'default' : 'secondary'}>
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Fund Wallet Modal */}
        <AnimatePresence>
          {showFundModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="w-full max-w-md bg-background rounded-xl shadow-xl overflow-hidden"
              >
                <div className="p-6 border-b">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Fund Wallet</h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowFundModal(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="p-6 space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="fundAmount">Amount (₦)</Label>
                    <Input
                      id="fundAmount"
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="Enter amount (min: ₦1, max: ₦1,000,000)"
                      min="1"
                      max="1000000"
                    />
                    {amount && !TransactionUtils.validateAmount(amount) && (
                      <p className="text-sm text-red-600">Please enter a valid amount between ₦1 and ₦1,000,000</p>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <Label>Payment Method</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="card"
                          name="paymentMethod"
                          value="card"
                          checked={paymentMethod === 'card'}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="text-primary"
                        />
                        <label htmlFor="card" className="flex items-center space-x-2 cursor-pointer">
                          <CreditCard className="h-4 w-4" />
                          <span>Debit/Credit Card (Paystack)</span>
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="test"
                          name="paymentMethod"
                          value="test"
                          checked={paymentMethod === 'test'}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="text-primary"
                        />
                        <label htmlFor="test" className="flex items-center space-x-2 cursor-pointer">
                          <RefreshCw className="h-4 w-4" />
                          <span>Test Funding (Demo)</span>
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  {paymentMethod === 'card' && (
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center space-x-2 mb-2">
                        <CreditCard className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-800">Secure Payment</span>
                      </div>
                      <p className="text-sm text-green-700">
                        Your payment will be processed securely via Paystack. We support Visa, Mastercard, and Verve cards.
                      </p>
                    </div>
                  )}
                  
                  {paymentMethod === 'test' && (
                    <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="flex items-center space-x-2 mb-2">
                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm font-medium text-yellow-800">Demo Mode</span>
                      </div>
                      <p className="text-sm text-yellow-700">
                        This will instantly add funds to your wallet for testing purposes. No actual payment will be processed.
                      </p>
                    </div>
                  )}
                </div>

                <div className="p-6 border-t flex justify-end space-x-3">
                  <Button variant="outline" onClick={() => setShowFundModal(false)} disabled={loading}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleFundWallet} 
                    disabled={loading || !TransactionUtils.validateAmount(amount)}
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        {paymentMethod === 'card' ? 'Processing Payment...' : 'Adding Funds...'}
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Fund Wallet
                      </>
                    )}
                  </Button>
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