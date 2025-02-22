import React, { useState } from 'react';
import { motion } from 'framer-motion';

const WaecResultChecker = () => {
  const [quantity, setQuantity] = useState(1);
  const [purchasedCards, setPurchasedCards] = useState([
    { id: 1, serial: '1234-5678-9101-1121', pin: '987654321', date: '2025-02-20' },
    { id: 2, serial: '1121-9101-5678-1234', pin: '123456789', date: '2025-02-19' },
  ]);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [notification, setNotification] = useState({ visible: false, message: '', type: '' });
  const pricePerCard = 3500;

  const totalAmount = quantity * pricePerCard;

  const handleQuantityChange = (e) => {
    const selectedQuantity = parseInt(e.target.value, 10);
    setQuantity(selectedQuantity);
  };

  const generateCard = () => {
    const serial = `${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;
    const pin = Math.floor(100000000 + Math.random() * 900000000).toString();
    return { id: purchasedCards.length + 1, serial, pin, date: new Date().toISOString().split('T')[0] };
  };

  const handlePurchase = async () => {
    setIsPurchasing(true);
    setNotification({ visible: false, message: '', type: '' });

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const newCards = Array.from({ length: quantity }, () => generateCard());
      setPurchasedCards((prev) => [...newCards, ...prev]);
      setNotification({ visible: true, message: `${quantity} WAEC card(s) purchased successfully!`, type: 'success' });
      setQuantity(1); // Reset quantity
    } catch (error) {
      setNotification({ visible: true, message: 'Purchase failed. Please try again.', type: 'error' });
    } finally {
      setIsPurchasing(false);
      setTimeout(() => setNotification({ visible: false, message: '', type: '' }), 3000);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-nunito">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl md:text-3xl font-bold text-text-color mb-6">WAEC Result Checker</h1>

          {/* Notification */}
          {notification.visible && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className={`fixed bottom-4 right-4 px-4 py-2 rounded-lg shadow-lg text-white ${
                notification.type === 'success' ? 'bg-primary-color' : 'bg-red-500'
              }`}
            >
              {notification.message}
            </motion.div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Purchase Section */}
            <motion.div
              variants={cardVariants}
              className="bg-white p-6 rounded-xl shadow-md"
            >
              <h2 className="text-xl font-semibold text-text-color mb-4">Purchase WAEC Scratch Cards</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                  <select
                    value={quantity}
                    onChange={handleQuantityChange}
                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-color transition-all duration-200 text-sm"
                    disabled={isPurchasing}
                  >
                    {[1, 2, 3, 4, 5].map((num) => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount</label>
                  <input
                    type="text"
                    value={`₦${totalAmount.toLocaleString()}`}
                    readOnly
                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed"
                  />
                </div>
                <button
                  onClick={handlePurchase}
                  className="w-full bg-primary-color text-white py-3 rounded-md font-semibold hover:bg-green-600 transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  disabled={isPurchasing}
                >
                  {isPurchasing && (
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" className="opacity-25" />
                      <path fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" className="opacity-75" />
                    </svg>
                  )}
                  {isPurchasing ? 'Purchasing...' : 'Purchase Now'}
                </button>
              </div>
            </motion.div>

            {/* Purchased Cards Section */}
            <motion.div
              variants={cardVariants}
              className="bg-white p-6 rounded-xl shadow-md"
            >
              <h2 className="text-xl font-semibold text-text-color mb-4">Purchased Cards</h2>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {purchasedCards.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No purchased cards yet.</p>
                ) : (
                  purchasedCards.map((card) => (
                    <motion.div
                      key={card.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-4 bg-gray-50 rounded-lg shadow-sm hover:bg-gray-100 transition-all duration-200"
                    >
                      <p className="text-sm text-gray-700"><strong>Serial:</strong> {card.serial}</p>
                      <p className="text-sm text-gray-700"><strong>PIN:</strong> {card.pin}</p>
                      <p className="text-sm text-gray-600"><strong>Date:</strong> {card.date}</p>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default WaecResultChecker;