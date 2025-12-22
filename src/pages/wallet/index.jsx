import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../App';
import { useWallet } from '../../contexts/WalletContext';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { 
  CreditCard, Wallet as WalletIcon, TrendingUp, TrendingDown, 
  X, Plus, RefreshCw, Clock, ArrowUpRight, ArrowDownLeft, 
  AlertCircle, ShieldCheck 
} from 'lucide-react';
import supabase from '../../config/supabase';
import toast from 'react-hot-toast';

const Wallet = () => {
  const [amount, setAmount] = useState('');
  const [showFundModal, setShowFundModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const { user } = useAuth();
  const { walletBalance, transactions, fundWallet, loading: walletLoading, fetchWalletData } = useWallet();

  // --- Logic: Fund Wallet ---
  const handleFundWallet = async () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount < 100 || numAmount > 1000000) {
      toast.error('Please enter a valid amount (₦100 - ₦1,000,000)');
      return;
    }
    
    setLoading(true);
    try {
      const userEmail = user?.email || 'user@example.com';
      const result = await fundWallet(parseFloat(amount), paymentMethod, userEmail);
      
      if (result.success) {
        toast.success(`Success! New balance: ₦${result.balance.toLocaleString()}`);
        setAmount('');
        setShowFundModal(false);
      } else {
        throw new Error('Funding failed');
      }
    } catch (error) {
      console.error('Funding error:', error);
      toast.error(error.message || 'Failed to fund wallet');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFund = (val) => {
    setAmount(val.toString());
    setShowFundModal(true);
  };

  const refreshWallet = async () => {
    try {
      await fetchWalletData();
      toast.success('Wallet updated');
    } catch (error) { toast.error('Update failed'); }
  };

  const totalCredits = transactions.filter(t => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0);
  const totalDebits = transactions.filter(t => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
           <div>
             <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Wallet</h1>
             <p className="text-gray-500 mt-1">Manage funds and track transactions.</p>
           </div>
           <Button 
             variant="outline" 
             onClick={refreshWallet} 
             disabled={walletLoading}
             className="gap-2 border-gray-200 dark:border-gray-800"
           >
             <RefreshCw className={`w-4 h-4 ${walletLoading ? 'animate-spin' : ''}`} /> Refresh
           </Button>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           
           {/* Left Column: Cards */}
           <div className="lg:col-span-1 space-y-6">
              
              {/* Virtual Card */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-6 shadow-2xl h-56 flex flex-col justify-between group">
                 {/* Decor */}
                 <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl group-hover:bg-green-500/20 transition-all"></div>
                 
                 <div className="flex justify-between items-start relative z-10">
                    <div>
                       <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Available Balance</p>
                       <h2 className="text-3xl font-bold mt-1">₦{walletBalance.toLocaleString()}</h2>
                    </div>
                    <WalletIcon className="w-8 h-8 text-green-500" />
                 </div>

                 <div className="relative z-10">
                    <div className="flex justify-between items-end">
                       <div>
                          <p className="text-xs text-gray-400 mb-1">Account Holder</p>
                          <p className="font-medium tracking-wide uppercase text-sm">{user?.name || 'InnovaTeam User'}</p>
                       </div>
                       <CreditCard className="w-8 h-8 text-gray-500" />
                    </div>
                 </div>
              </div>

              {/* Quick Actions */}
              <Card className="border border-gray-100 dark:border-gray-800 shadow-sm">
                 <CardContent className="p-6">
                    <h3 className="font-bold text-sm text-gray-500 uppercase tracking-wider mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-3">
                       <Button onClick={() => setShowFundModal(true)} className="bg-green-600 hover:bg-green-700 text-white h-12 rounded-xl font-bold shadow-lg shadow-green-600/20">
                          <Plus className="w-5 h-5 mr-2" /> Fund Wallet
                       </Button>
                       <Button variant="outline" className="h-12 rounded-xl border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                          <ShieldCheck className="w-5 h-5 mr-2 text-gray-400" /> Verify
                       </Button>
                    </div>
                 </CardContent>
              </Card>

              {/* Stats Mini-Cards */}
              <div className="grid grid-cols-2 gap-4">
                 <Card className="border border-gray-100 dark:border-gray-800 shadow-sm">
                    <CardContent className="p-4">
                       <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg w-fit mb-3">
                          <TrendingUp className="w-5 h-5 text-green-600" />
                       </div>
                       <p className="text-xs text-gray-500">Total Credits</p>
                       <p className="font-bold text-lg text-green-600">₦{totalCredits.toLocaleString()}</p>
                    </CardContent>
                 </Card>
                 <Card className="border border-gray-100 dark:border-gray-800 shadow-sm">
                    <CardContent className="p-4">
                       <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg w-fit mb-3">
                          <TrendingDown className="w-5 h-5 text-red-600" />
                       </div>
                       <p className="text-xs text-gray-500">Total Debits</p>
                       <p className="font-bold text-lg text-red-600">₦{totalDebits.toLocaleString()}</p>
                    </CardContent>
                 </Card>
              </div>
           </div>

           {/* Right Column: Transaction History */}
           <div className="lg:col-span-2">
              <Card className="border border-gray-100 dark:border-gray-800 shadow-sm h-full">
                 <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50 rounded-t-xl">
                    <h3 className="font-bold text-lg">Transaction History</h3>
                    <Badge variant="outline" className="border-gray-200 text-gray-500">
                       {transactions.length} Total
                    </Badge>
                 </div>
                 
                 <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    {transactions.length > 0 ? (
                      transactions.slice(0, 8).map((tx) => (
                         <div key={tx.id} className="p-5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                            <div className="flex items-center gap-4">
                               <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                  tx.type === 'credit' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                               }`}>
                                  {tx.type === 'credit' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                               </div>
                               <div>
                                  <p className="font-bold text-sm text-gray-900 dark:text-white">{tx.label || 'Transaction'}</p>
                                  <p className="text-xs text-gray-500 flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> {new Date(tx.date).toLocaleDateString()}
                                  </p>
                               </div>
                            </div>
                            <div className="text-right">
                               <p className={`font-bold ${tx.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                                  {tx.type === 'credit' ? '+' : '-'}₦{tx.amount.toLocaleString()}
                               </p>
                               <Badge variant={tx.status === 'Successful' ? 'success' : 'secondary'} className={`text-[10px] mt-1 ${tx.status === 'Successful' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                  {tx.status}
                               </Badge>
                            </div>
                         </div>
                      ))
                    ) : (
                      <div className="text-center py-20 text-gray-400">
                         <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full w-fit mx-auto mb-4">
                            <WalletIcon className="w-8 h-8 text-gray-400" />
                         </div>
                         <p>No transactions yet.</p>
                      </div>
                    )}
                 </div>
              </Card>
           </div>
        </div>

        {/* Funding Modal */}
        <AnimatePresence>
          {showFundModal && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
               <motion.div 
                 initial={{ scale: 0.95 }} 
                 animate={{ scale: 1 }} 
                 exit={{ scale: 0.95 }}
                 className="bg-white dark:bg-gray-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
               >
                  <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                     <h3 className="font-bold text-lg">Fund Wallet</h3>
                     <button onClick={() => setShowFundModal(false)} className="text-gray-400 hover:text-gray-600">
                        <X className="w-5 h-5" />
                     </button>
                  </div>
                  
                  <div className="p-6 space-y-6">
                     <div className="grid grid-cols-3 gap-2 mb-4">
                        {[1000, 5000, 10000].map(val => (
                           <button 
                             key={val} 
                             onClick={() => setAmount(val.toString())}
                             className="py-2 border rounded-lg text-sm font-medium hover:border-green-500 hover:text-green-600 transition-colors"
                           >
                             ₦{val.toLocaleString()}
                           </button>
                        ))}
                     </div>

                     <div className="space-y-2">
                        <Label>Enter Amount</Label>
                        <div className="relative">
                           <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-500">₦</span>
                           <Input 
                             type="number" 
                             value={amount} 
                             onChange={(e) => setAmount(e.target.value)} 
                             className="pl-8 text-lg font-bold" 
                             placeholder="0.00" 
                           />
                        </div>
                     </div>

                     <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl flex gap-3 items-start">
                        <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                        <div className="text-sm text-blue-700 dark:text-blue-300">
                           <p className="font-bold mb-1">Secure Payment</p>
                           <p>Your transaction is secured by Paystack using 256-bit encryption.</p>
                        </div>
                     </div>

                     <Button 
                       onClick={handleFundWallet} 
                       disabled={loading || !amount}
                       className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-lg shadow-lg shadow-green-600/20"
                     >
                       {loading ? 'Processing...' : `Pay ₦${amount ? parseInt(amount).toLocaleString() : '0'}`}
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