import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DocumentTextIcon, AcademicCapIcon, WalletIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { useJambTransaction } from '../../../hooks/useJambTransaction';
import { toast } from 'react-toastify';
import { useDarkMode } from '../../../contexts/DarkModeContext';

const OriginalResult = () => {
  const [type, setType] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [amount, setAmount] = useState(2000); // Default amount for one original result
  const [isLoading, setIsLoading] = useState(false);
  const { processJambTransaction, walletBalance } = useJambTransaction();
  const { isDarkMode } = useDarkMode();

  const handleQuantityChange = (e) => {
    const newQuantity = parseInt(e.target.value, 10);
    setQuantity(newQuantity);
    setAmount(newQuantity * 2000); // Update amount based on quantity
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!type) {
      toast.error('Please select a type');
      return;
    }

    setIsLoading(true);
    try {
      const result = await processJambTransaction({
        amount: amount,
        serviceType: 'Original Result',
        description: `${type} Original Result`,
        quantity: quantity,
      });

      if (result.success) {
        toast.success('Transaction successful');
        // Reset form
        setType('');
        setQuantity(1);
        setAmount(2000);
      }
    } catch (error) {
      toast.error('Transaction failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen py-6 font-nunito transition-colors duration-200 ${
      isDarkMode ? 'bg-dark-surface text-dark-text-primary' : 'bg-gray-50'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-4 mb-8">
          <div className={`p-3 ${
            isDarkMode ? 'bg-green-900/30' : 'bg-green-100'
          } rounded-full`}>
            <DocumentTextIcon className={`w-6 h-6 ${
              isDarkMode ? 'text-green-400' : 'text-green-600'
            }`} />
          </div>
          <h1 className={`text-2xl md:text-3xl font-bold ${
            isDarkMode ? 'text-dark-text-primary' : 'text-gray-800'
          }`}>Original Result</h1>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Original Result Form */}
          <div className={`flex-1 ${
            isDarkMode ? 'bg-dark-surface-secondary border-dark-border' : 'bg-white'
          } p-6 rounded-xl shadow-md border`}>
            <div className="flex items-center gap-3 mb-6">
              <AcademicCapIcon className={`w-6 h-6 ${
                isDarkMode ? 'text-green-400' : 'text-green-600'
              }`} />
              <h2 className={`text-lg font-bold ${
                isDarkMode ? 'text-dark-text-primary' : 'text-gray-800'
              }`}>Result Details</h2>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="mb-4">
                <label className={`block text-sm font-medium mb-1 ${
                  isDarkMode ? 'text-dark-text-primary' : 'text-gray-700'
                }`}>Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className={`mt-1 block w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
                    isDarkMode 
                      ? 'bg-dark-surface border-dark-border text-dark-text-primary' 
                      : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Type</option>
                  <option value="Undergraduate">Undergraduate</option>
                  <option value="Postgraduate">Postgraduate</option>
                </select>
              </div>

              <div className="mb-4">
                <label className={`block text-sm font-medium mb-1 ${
                  isDarkMode ? 'text-dark-text-primary' : 'text-gray-700'
                }`}>Quantity</label>
                <select
                  value={quantity}
                  onChange={handleQuantityChange}
                  className={`mt-1 block w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
                    isDarkMode 
                      ? 'bg-dark-surface border-dark-border text-dark-text-primary' 
                      : 'border-gray-300'
                  }`}
                >
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-semibold mb-1 ${
                  isDarkMode ? 'text-dark-text-primary' : 'text-gray-700'
                }`}>Amount</label>
                <div className="relative">
                  <input
                    type="text"
                    value={`₦${amount}`}
                    readOnly
                    className={`w-full pl-12 pr-4 py-3 border rounded-xl cursor-not-allowed ${
                      isDarkMode 
                        ? 'bg-dark-surface border-dark-border text-dark-text-primary' 
                        : 'bg-gray-100 border-gray-300 text-gray-700'
                    }`}
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <WalletIcon className={`w-5 h-5 ${
                      isDarkMode ? 'text-dark-text-secondary' : 'text-gray-400'
                    }`} />
                  </div>
                </div>
                <p className={`mt-2 text-sm ${
                  isDarkMode ? 'text-dark-text-secondary' : 'text-gray-500'
                }`}>
                  Wallet Balance: <span className={`font-medium ${
                    isDarkMode ? 'text-dark-text-primary' : 'text-gray-700'
                  }`}>₦{walletBalance.toLocaleString()}</span>
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                  isDarkMode
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-green-500 hover:bg-green-600 text-white'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isLoading ? (
                  <>
                    <ArrowPathIcon className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <ArrowPathIcon className="w-5 h-5" />
                    Proceed
                  </>
                )}
              </button>
            </form>
          </div>

          {/* How It Works Section */}
          <div className={`flex-1 ${
            isDarkMode ? 'bg-dark-surface-secondary border-dark-border' : 'bg-white'
          } p-6 rounded-xl shadow-md border`}>
            <div className="flex items-center gap-3 mb-6">
              <DocumentTextIcon className={`w-6 h-6 ${
                isDarkMode ? 'text-green-400' : 'text-green-600'
              }`} />
              <h2 className={`text-lg font-bold ${
                isDarkMode ? 'text-dark-text-primary' : 'text-gray-800'
              }`}>How It Works</h2>
            </div>
            <ul className={`list-disc list-inside ${
              isDarkMode ? 'text-dark-text-secondary' : 'text-gray-600'
            }`}>
              <li>Fill the form with your accurate details and submit</li>
              <li>Click the "Proceed" button to make payment for the service</li>
              <li>Upon successful payment, scroll down for new entry. Click on new entry to submit fresh job.</li>
              <li>Once your Job is done, you will be sent a confirmation email and you will be able to print out your processed job.</li>
            </ul>
          </div>
        </div>

        {/* Original Result History */}
        <div className="mt-8">
          <h2 className={`text-xl font-bold mb-4 ${
            isDarkMode ? 'text-dark-text-primary' : 'text-gray-800'
          }`}>ORIGINAL RESULT HISTORY</h2>
          <div className={`${
            isDarkMode ? 'bg-dark-surface-secondary border-dark-border' : 'bg-white'
          } p-6 rounded-lg shadow-md overflow-x-auto border`}>
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className={`px-4 py-2 ${
                    isDarkMode ? 'text-dark-text-primary' : 'text-gray-800'
                  }`}>Action</th>
                  <th className={`px-4 py-2 ${
                    isDarkMode ? 'text-dark-text-primary' : 'text-gray-800'
                  }`}>Type</th>
                  <th className={`px-4 py-2 ${
                    isDarkMode ? 'text-dark-text-primary' : 'text-gray-800'
                  }`}>Fullname</th>
                  <th className={`px-4 py-2 ${
                    isDarkMode ? 'text-dark-text-primary' : 'text-gray-800'
                  }`}>Profile Code/RegNo.</th>
                  <th className={`px-4 py-2 ${
                    isDarkMode ? 'text-dark-text-primary' : 'text-gray-800'
                  }`}>Status</th>
                  <th className={`px-4 py-2 ${
                    isDarkMode ? 'text-dark-text-primary' : 'text-gray-800'
                  }`}>Screenshot</th>
                  <th className={`px-4 py-2 ${
                    isDarkMode ? 'text-dark-text-primary' : 'text-gray-800'
                  }`}>Remark</th>
                  <th className={`px-4 py-2 ${
                    isDarkMode ? 'text-dark-text-primary' : 'text-gray-800'
                  }`}>Submitted On</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan="8" className={`text-center py-4 ${
                    isDarkMode ? 'text-dark-text-secondary' : 'text-gray-500'
                  }`}>No Record Found!</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OriginalResult;