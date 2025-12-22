import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '../../contexts/WalletContext';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { 
  Download, Filter, Search, X, Calendar, DollarSign, 
  TrendingUp, TrendingDown, ArrowUpRight, ArrowDownLeft, Printer,
  ChevronLeft, ChevronRight, CheckCircle 
} from 'lucide-react';
import toast from 'react-hot-toast';

const Transactions = () => {
  const { transactions, loading } = useWallet();
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  
  // --- Pagination State ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // --- Logic: Filtering & Sorting ---
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((t) => {
        const matchesFilter = filter === 'all' ? true : t.type === filter;
        const matchesSearch = searchTerm === '' ? true : 
          t.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.amount.toString().includes(searchTerm);
        
        return matchesFilter && matchesSearch;
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
  }, [transactions, filter, searchTerm, sortConfig]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchTerm]);

  // --- Pagination Logic ---
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleExport = () => {
    const csvContent = filteredTransactions.map(t => [t.id, t.label, t.amount, t.date.split('T')[0], t.status].join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Export successful');
  };

  const totalCredits = transactions.filter(t => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0);
  const totalDebits = transactions.filter(t => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
           <div>
             <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Transaction History</h1>
             <p className="text-gray-500 mt-1">Track every payment and credit in one place.</p>
           </div>
           <Button variant="outline" onClick={handleExport} className="gap-2 border-gray-200 dark:border-gray-800">
             <Download className="w-4 h-4" /> Export CSV
           </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <Card className="border border-gray-100 dark:border-gray-800 shadow-sm">
              <CardContent className="p-6">
                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full text-green-600">
                       <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                       <p className="text-sm font-medium text-gray-500">Total Inflow</p>
                       <p className="text-2xl font-bold text-green-600">₦{totalCredits.toLocaleString()}</p>
                    </div>
                 </div>
              </CardContent>
           </Card>

           <Card className="border border-gray-100 dark:border-gray-800 shadow-sm">
              <CardContent className="p-6">
                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-full text-red-600">
                       <TrendingDown className="w-6 h-6" />
                    </div>
                    <div>
                       <p className="text-sm font-medium text-gray-500">Total Outflow</p>
                       <p className="text-2xl font-bold text-red-600">₦{totalDebits.toLocaleString()}</p>
                    </div>
                 </div>
              </CardContent>
           </Card>

           <Card className="border border-gray-100 dark:border-gray-800 shadow-sm">
              <CardContent className="p-6">
                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full text-blue-600">
                       <DollarSign className="w-6 h-6" />
                    </div>
                    <div>
                       <p className="text-sm font-medium text-gray-500">Total Transactions</p>
                       <p className="text-2xl font-bold text-blue-600">{transactions.length}</p>
                    </div>
                 </div>
              </CardContent>
           </Card>
        </div>

        {/* Main List Section */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col min-h-[600px]">
           
           {/* Controls Toolbar */}
           <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex flex-col md:flex-row gap-4 justify-between bg-gray-50/50 dark:bg-gray-900/50">
              <div className="relative w-full md:w-80">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                 <input 
                   type="text" 
                   placeholder="Search transactions..." 
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none"
                 />
              </div>
              
              <div className="flex gap-2">
                 {['all', 'credit', 'debit'].map(type => (
                   <button
                     key={type}
                     onClick={() => setFilter(type)}
                     className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                       filter === type 
                         ? 'bg-green-600 text-white shadow-md shadow-green-200 dark:shadow-none' 
                         : 'bg-white dark:bg-gray-800 text-gray-600 border border-gray-200 dark:border-gray-700 hover:bg-gray-50'
                     }`}
                   >
                     {type}
                   </button>
                 ))}
              </div>
           </div>

           {/* Transaction List */}
           <div className="flex-1 divide-y divide-gray-100 dark:divide-gray-800">
              {paginatedTransactions.length === 0 ? (
                <div className="text-center py-20 text-gray-400">
                   <Filter className="w-12 h-12 mx-auto mb-3 opacity-20" />
                   <p>No transactions found matching your filters.</p>
                </div>
              ) : (
                paginatedTransactions.map((tx, index) => (
                   <motion.div 
                     layout
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: index * 0.05 }} // Staggered animation
                     key={tx.id}
                     onClick={() => setSelectedTransaction(tx)}
                     className="p-5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors group"
                   >
                      <div className="flex items-center gap-4">
                         <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 ${
                            tx.type === 'credit' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                         }`}>
                            {tx.type === 'credit' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                         </div>
                         <div>
                            <p className="font-bold text-gray-900 dark:text-white text-sm">{tx.label}</p>
                            <p className="text-xs text-gray-500">{new Date(tx.date).toLocaleDateString()} • {new Date(tx.date).toLocaleTimeString()}</p>
                         </div>
                      </div>

                      <div className="text-right">
                         <p className={`font-bold ${tx.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                            {tx.type === 'credit' ? '+' : '-'}₦{tx.amount.toLocaleString()}
                         </p>
                         <Badge variant={tx.status === 'completed' ? 'success' : 'destructive'} className={`text-[10px] mt-1 capitalize ${
                            tx.status === 'completed' ? 'bg-green-100 text-green-700 hover:bg-green-100' : 'bg-red-100 text-red-700 hover:bg-red-100'
                         }`}>
                            {tx.status}
                         </Badge>
                      </div>
                   </motion.div>
                ))
              )}
           </div>

           {/* Pagination Footer */}
           {filteredTransactions.length > 0 && (
             <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredTransactions.length)} of {filteredTransactions.length} entries
                </span>
                
                <div className="flex gap-2">
                   <Button 
                     variant="outline" 
                     size="sm" 
                     onClick={() => handlePageChange(currentPage - 1)}
                     disabled={currentPage === 1}
                     className="h-8 w-8 p-0"
                   >
                     <ChevronLeft className="w-4 h-4" />
                   </Button>
                   <Button 
                     variant="outline" 
                     size="sm" 
                     onClick={() => handlePageChange(currentPage + 1)}
                     disabled={currentPage === totalPages}
                     className="h-8 w-8 p-0"
                   >
                     <ChevronRight className="w-4 h-4" />
                   </Button>
                </div>
             </div>
           )}
        </div>

        {/* Receipt Modal */}
        <AnimatePresence>
          {selectedTransaction && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedTransaction(null)}
            >
               <motion.div 
                 initial={{ scale: 0.9, y: 20 }} 
                 animate={{ scale: 1, y: 0 }} 
                 exit={{ scale: 0.9, y: 20 }}
                 className="bg-white dark:bg-gray-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden relative"
                 onClick={e => e.stopPropagation()}
               >
                  {/* Receipt Header */}
                  <div className="bg-green-600 p-6 text-white text-center relative overflow-hidden">
                     <div className="absolute top-0 left-0 w-full h-full bg-white/10 opacity-20" style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '10px 10px' }}></div>
                     <div className="relative z-10">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-4">
                           <CheckCircle className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold">Transaction Successful</h2>
                        <p className="text-green-100 text-sm mt-1">{new Date(selectedTransaction.date).toLocaleString()}</p>
                     </div>
                  </div>

                  {/* Receipt Body */}
                  <div className="p-8">
                     <div className="text-center mb-8">
                        <p className="text-sm text-gray-500 uppercase tracking-wide font-bold">Amount</p>
                        <h1 className={`text-4xl font-black mt-2 ${selectedTransaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                           ₦{selectedTransaction.amount.toLocaleString()}
                        </h1>
                     </div>

                     <div className="space-y-4 border-t border-b border-gray-100 dark:border-gray-800 py-6 mb-6">
                        <div className="flex justify-between">
                           <span className="text-gray-500 text-sm">Status</span>
                           <span className="font-bold text-green-600 capitalize">{selectedTransaction.status}</span>
                        </div>
                        <div className="flex justify-between">
                           <span className="text-gray-500 text-sm">Reference</span>
                           <span className="font-mono text-sm">{selectedTransaction.id.substring(0, 12)}...</span>
                        </div>
                        <div className="flex justify-between">
                           <span className="text-gray-500 text-sm">Type</span>
                           <span className="capitalize">{selectedTransaction.type}</span>
                        </div>
                        <div className="flex justify-between">
                           <span className="text-gray-500 text-sm">Description</span>
                           <span className="font-medium text-right max-w-[200px]">{selectedTransaction.label}</span>
                        </div>
                     </div>

                     <Button onClick={() => window.print()} className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 h-12 rounded-xl font-bold">
                        <Printer className="w-4 h-4 mr-2" /> Print Receipt
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

export default Transactions;