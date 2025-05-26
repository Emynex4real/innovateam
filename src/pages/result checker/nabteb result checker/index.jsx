import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ClipboardIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useTransactions } from '../../../contexts/TransactionContext';
import { useDarkMode } from '../../../contexts/DarkModeContext';

const NabtebResultChecker = () => {
  const [quantity, setQuantity] = useState(1);
  const [purchasedCards, setPurchasedCards] = useState([]);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [notification, setNotification] = useState({ visible: false, message: '', type: '' });
  const [copiedCardId, setCopiedCardId] = useState(null);
  const pricePerCard = 2500;
  const { isDarkMode } = useDarkMode();

  const totalAmount = quantity * pricePerCard;

  const handleQuantityChange = (e) => {
    const selectedQuantity = parseInt(e.target.value, 10);
    setQuantity(selectedQuantity);
  };

  const generateCard = () => {
    const serial = `NAB-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;
    const pin = Math.floor(100000000 + Math.random() * 900000000).toString();
    return { id: Date.now() + Math.random(), serial, pin, date: new Date().toLocaleDateString('en-CA') };
  };

  const { makePayment, walletBalance } = useTransactions();

  const handlePurchase = async () => {
    setIsPurchasing(true);
    setNotification({ visible: false, message: '', type: '' });

    try {
      // Check if user has enough balance
      if (totalAmount > walletBalance) {
        throw new Error('Insufficient wallet balance');
      }

      // Process the payment first
      await makePayment(
        totalAmount,
        `Purchase of ${quantity} NABTEB Result Checker Card${quantity > 1 ? 's' : ''}`,
        'scratch_card'
      );

      // Generate the cards after successful payment
      const newCards = Array.from({ length: quantity }, () => generateCard());
      setPurchasedCards((prev) => [...newCards, ...prev]);
      
      setNotification({ visible: true, message: `${quantity} NABTEB card(s) purchased successfully!`, type: 'success' });
      setQuantity(1);
    } catch (error) {
      setNotification({ 
        visible: true, 
        message: error.message === 'Insufficient wallet balance' 
          ? 'Insufficient wallet balance. Please fund your wallet.'
          : 'Purchase failed. Please try again.', 
        type: 'error' 
      });
    } finally {
      setIsPurchasing(false);
      setTimeout(() => setNotification({ visible: false, message: '', type: '' }), 2500);
    }
  };

  const copyCardDetails = (card) => {
    const details = `Serial: ${card.serial}\nPIN: ${card.pin}`;
    navigator.clipboard.writeText(details);
    setCopiedCardId(card.id);
    setTimeout(() => setCopiedCardId(null), 2000);
  };

  const clearPurchasedCards = () => {
    setPurchasedCards([]);
    setNotification({ visible: true, message: 'Purchased cards cleared!', type: 'success' });
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120 } },
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      isDarkMode ? 'bg-dark-surface text-dark-text-primary' : 'bg-gradient-to-b from-gray-50 to-white'
    }`}>
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="mb-12"
        >
          <div className="relative">
            <h1 className={`text-3xl md:text-4xl font-extrabold tracking-tight mb-2 relative z-10 ${
              isDarkMode ? 'text-dark-text-primary' : 'text-gray-800'
            }`}>NABTEB Result Checker</h1>
            <p className={`text-lg relative z-10 ${
              isDarkMode ? 'text-dark-text-secondary' : 'text-gray-600'
            }`}>Purchase your NABTEB scratch cards securely</p>
            <div className={`absolute -top-6 -left-6 w-24 h-24 rounded-full filter blur-xl opacity-60 ${
              isDarkMode ? 'bg-green-900/30' : 'bg-green-100'
            }`}></div>
            <div className={`absolute top-10 -right-4 w-16 h-16 rounded-full filter blur-lg opacity-40 ${
              isDarkMode ? 'bg-green-900/20' : 'bg-green-50'
            }`}></div>
          </div>
        </motion.div>

        {/* Notification */}
        {notification.visible && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`fixed bottom-6 right-6 px-6 py-4 rounded-xl shadow-xl backdrop-blur-sm text-white font-medium flex items-center gap-3 ${
              notification.type === 'success' 
                ? isDarkMode ? 'bg-green-600/90' : 'bg-green-500'
                : isDarkMode ? 'bg-red-600/90' : 'bg-red-500'
            }`}
          >
            {notification.message}
          </motion.div>
        )}

        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Purchase Section */}
          <motion.div variants={cardVariants} className={`p-8 rounded-2xl shadow-xl border relative overflow-hidden ${
            isDarkMode ? 'bg-dark-surface-secondary border-dark-border' : 'bg-white border-gray-100'
          }`}>
            <div className={`absolute top-0 right-0 w-40 h-40 rounded-full filter blur-3xl opacity-30 -mr-20 -mt-20 ${
              isDarkMode ? 'bg-green-900/30' : 'bg-green-50'
            }`}></div>
            <h2 className={`text-2xl font-semibold mb-6 ${
              isDarkMode ? 'text-dark-text-primary' : 'text-gray-800'
            }`}>Purchase NABTEB Scratch Cards</h2>
            <div className="space-y-6">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-dark-text-primary' : 'text-gray-700'
                }`}>Select Quantity</label>
                <select
                  value={quantity}
                  onChange={handleQuantityChange}
                  className={`w-full p-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 shadow-sm appearance-none ${
                    isDarkMode 
                      ? 'bg-dark-surface border-dark-border text-dark-text-primary hover:border-dark-border-secondary' 
                      : 'bg-white border-gray-200 text-gray-800 hover:border-gray-300'
                  }`}
                  disabled={isPurchasing}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <option key={num} value={num} className={
                      isDarkMode ? 'bg-dark-surface text-dark-text-primary' : ''
                    }>{num}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-dark-text-primary' : 'text-gray-700'
                }`}>Total Amount</label>
                <input
                  type="text"
                  value={`₦${totalAmount.toLocaleString()}`}
                  readOnly
                  className={`w-full p-4 border rounded-xl font-medium cursor-not-allowed ${
                    isDarkMode 
                      ? 'bg-dark-surface border-dark-border text-dark-text-primary' 
                      : 'bg-gradient-to-r from-green-50 to-green-100/30 border-gray-200 text-gray-800'
                  }`}
                />
              </div>
              <button
                onClick={handlePurchase}
                className={`w-full py-4 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg ${
                  isDarkMode
                    ? 'bg-green-600 hover:bg-green-700 text-white shadow-green-900/20'
                    : 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white shadow-green-500/20'
                }`}
                disabled={isPurchasing}
              >
                {isPurchasing ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" className="opacity-25" />
                      <path fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" className="opacity-75" />
                    </svg>
                    Processing...
                  </>
                ) : (
                  'Purchase Now'
                )}
              </button>
            </div>
          </motion.div>

          {/* Purchased Cards Section */}
          <motion.div variants={cardVariants} className={`p-8 rounded-2xl shadow-xl border relative overflow-hidden ${
            isDarkMode ? 'bg-dark-surface-secondary border-dark-border' : 'bg-white border-gray-100'
          }`}>
            <div className={`absolute top-0 right-0 w-40 h-40 rounded-full filter blur-3xl opacity-30 -mr-20 -mt-20 ${
              isDarkMode ? 'bg-green-900/30' : 'bg-green-50'
            }`}></div>
            <div className="flex justify-between items-center mb-6">
              <h2 className={`text-2xl font-semibold ${
                isDarkMode ? 'text-dark-text-primary' : 'text-gray-800'
              }`}>Your Purchased Cards</h2>
              {purchasedCards.length > 0 && (
                <button
                  onClick={clearPurchasedCards}
                  className={`text-sm font-medium transition-colors duration-200 ${
                    isDarkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-700'
                  }`}
                >
                  Clear All
                </button>
              )}
            </div>
            <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              {purchasedCards.length === 0 ? (
                <p className={`text-center py-8 ${
                  isDarkMode ? 'text-dark-text-secondary' : 'text-gray-500'
                }`}>No purchased cards yet. Get started by purchasing one!</p>
              ) : (
                purchasedCards.map((card) => (
                  <motion.div
                    key={card.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    whileHover={{ scale: 1.02 }}
                    className={`p-5 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex justify-between items-center border group ${
                      isDarkMode 
                        ? 'bg-dark-surface border-dark-border hover:bg-dark-border' 
                        : 'bg-gradient-to-r from-gray-50 to-white border-gray-100/50'
                    }`}
                  >
                    <div>
                      <p className={`text-sm ${
                        isDarkMode ? 'text-dark-text-primary' : 'text-gray-800'
                      }`}><strong>Serial:</strong> {card.serial}</p>
                      <p className={`text-sm ${
                        isDarkMode ? 'text-dark-text-primary' : 'text-gray-800'
                      }`}><strong>PIN:</strong> {card.pin}</p>
                      <p className={`text-xs ${
                        isDarkMode ? 'text-dark-text-secondary' : 'text-gray-600'
                      }`}><strong>Date:</strong> {card.date}</p>
                    </div>
                    <button
                      onClick={() => copyCardDetails(card)}
                      className={`p-2.5 transition-all duration-200 rounded-lg group-hover:scale-110 ${
                        isDarkMode 
                          ? 'text-dark-text-secondary hover:text-primary-400 hover:bg-dark-border' 
                          : 'text-gray-500 hover:text-green-600 hover:bg-green-50'
                      }`}
                      title="Copy Details"
                    >
                      {copiedCardId === card.id ? (
                        <CheckIcon className={`h-5 w-5 ${
                          isDarkMode ? 'text-primary-400' : 'text-green-500'
                        }`} />
                      ) : (
                        <ClipboardIcon className="h-5 w-5" />
                      )}
                    </button>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default NabtebResultChecker;