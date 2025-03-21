import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ClipboardIcon, CheckIcon } from '@heroicons/react/24/outline';

const WaecResultChecker = () => {
  const [quantity, setQuantity] = useState(1);
  const [purchasedCards, setPurchasedCards] = useState([
    { id: 1, serial: 'WAE-1234-5678-9101', pin: '987654321', date: '2025-02-20' },
    { id: 2, serial: 'WAE-1121-9101-5678', pin: '123456789', date: '2025-02-19' },
  ]);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [notification, setNotification] = useState({ visible: false, message: '', type: '' });
  const [copiedCardId, setCopiedCardId] = useState(null);
  const pricePerCard = 3500;

  const totalAmount = quantity * pricePerCard;

  const handleQuantityChange = (e) => {
    const selectedQuantity = parseInt(e.target.value, 10);
    setQuantity(selectedQuantity);
  };

  const generateCard = () => {
    const serial = `WAE-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;
    const pin = Math.floor(100000000 + Math.random() * 900000000).toString();
    return { id: Date.now() + Math.random(), serial, pin, date: new Date().toLocaleDateString('en-CA') };
  };

  const handlePurchase = async () => {
    setIsPurchasing(true);
    setNotification({ visible: false, message: '', type: '' });

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const newCards = Array.from({ length: quantity }, () => generateCard());
      setPurchasedCards((prev) => [...newCards, ...prev]);
      setNotification({ visible: true, message: `${quantity} WAEC card(s) purchased successfully!`, type: 'success' });
      setQuantity(1);
    } catch (error) {
      setNotification({ visible: true, message: 'Purchase failed. Please try again.', type: 'error' });
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
    <div className="bg-gray-50 min-h-screen font-nunito lg:ml-0 md:ml-20">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="mb-12"
        >
          <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight">WAEC Result Checker</h1>
          <p className="text-gray-600 mt-2 text-lg">Purchase your WAEC scratch cards seamlessly</p>
        </motion.div>

        {/* Notification */}
        {notification.visible && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`fixed bottom-6 right-6 px-6 py-3 rounded-lg shadow-lg text-white font-medium ${
              notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
            }`}
          >
            {notification.message}
          </motion.div>
        )}

        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Purchase Section */}
          <motion.div variants={cardVariants} className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Purchase WAEC Scratch Cards</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Quantity</label>
                <select
                  value={quantity}
                  onChange={handleQuantityChange}
                  className="w-full p-3 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-800 shadow-sm hover:border-gray-300"
                  disabled={isPurchasing}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Total Amount</label>
                <input
                  type="text"
                  value={`₦${totalAmount.toLocaleString()}`}
                  readOnly
                  className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-800 font-medium cursor-not-allowed"
                />
              </div>
              <button
                onClick={handlePurchase}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md"
                disabled={isPurchasing}
              >
                {isPurchasing && (
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" className="opacity-25" />
                    <path fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" className="opacity-75" />
                  </svg>
                )}
                {isPurchasing ? 'Processing...' : 'Purchase Now'}
              </button>
            </div>
          </motion.div>

          {/* Purchased Cards Section */}
          <motion.div variants={cardVariants} className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">Your Purchased Cards</h2>
              {purchasedCards.length > 0 && (
                <button
                  onClick={clearPurchasedCards}
                  className="text-sm text-red-600 hover:text-red-700 font-medium transition-colors duration-200"
                >
                  Clear All
                </button>
              )}
            </div>
            <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              {purchasedCards.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No purchased cards yet. Get started by purchasing one!</p>
              ) : (
                purchasedCards.map((card) => (
                  <motion.div
                    key={card.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-4 bg-gray-50 rounded-lg shadow-sm hover:bg-gray-100 transition-all duration-200 flex justify-between items-center"
                  >
                    <div>
                      <p className="text-sm text-gray-800"><strong>Serial:</strong> {card.serial}</p>
                      <p className="text-sm text-gray-800"><strong>PIN:</strong> {card.pin}</p>
                      <p className="text-xs text-gray-600"><strong>Date:</strong> {card.date}</p>
                    </div>
                    <button
                      onClick={() => copyCardDetails(card)}
                      className="p-2 text-gray-600 hover:text-green-600 transition-colors duration-200"
                      title="Copy Details"
                    >
                      {copiedCardId === card.id ? (
                        <CheckIcon className="h-5 w-5 text-green-500" />
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

export default WaecResultChecker;