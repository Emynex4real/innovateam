import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DocumentTextIcon, AcademicCapIcon, WalletIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { useJambTransaction } from '../../../hooks/useJambTransaction';
import { toast } from 'react-toastify';

const OriginalResult = () => {
  const [type, setType] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [amount, setAmount] = useState(2000); // Default amount for one original result
  const [isLoading, setIsLoading] = useState(false);
  const { processJambTransaction, walletBalance } = useJambTransaction();

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
    <div className="bg-gray-50 min-h-screen py-6 font-nunito">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-green-100 rounded-full">
            <DocumentTextIcon className="w-6 h-6 text-green-600" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Original Result</h1>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Original Result Form */}
          <div className="flex-1 bg-white p-6 rounded-xl shadow-md">
            <div className="flex items-center gap-3 mb-6">
              <AcademicCapIcon className="w-6 h-6 text-green-600" />
              <h2 className="text-lg font-bold text-gray-800">Result Details</h2>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select Type</option>
                  <option value="Undergraduate">Undergraduate</option>
                  <option value="Postgraduate">Postgraduate</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Quantity</label>
                <select
                  value={quantity}
                  onChange={handleQuantityChange}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Amount</label>
                <div className="relative">
                  <input
                    type="text"
                    value={`₦${amount}`}
                    readOnly
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl bg-gray-100 text-gray-700 cursor-not-allowed"
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <WalletIcon className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Wallet Balance: <span className="font-medium text-gray-700">₦{walletBalance.toLocaleString()}</span>
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-green-600 to-green-500 text-white py-3 px-6 rounded-xl font-semibold
                  hover:from-green-700 hover:to-green-600 transition-all duration-300 flex items-center justify-center gap-2
                  disabled:opacity-50 disabled:cursor-not-allowed"
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
          <div className="flex-1 bg-white p-6 rounded-xl shadow-md">
            <div className="flex items-center gap-3 mb-6">
              <DocumentTextIcon className="w-6 h-6 text-green-600" />
              <h2 className="text-lg font-bold text-gray-800">How It Works</h2>
            </div>
            <ul className="list-disc list-inside">
              <li>Fill the form with your accurate details and submit</li>
              <li>Click the “Proceed” button to make payment for the service</li>
              <li>Upon successful payment, scroll down for new entry. Click on new entry to submit fresh job.</li>
              <li>Once your Job is done, you will be sent a confirmation email and you will be able to print out your processed job.</li>
            </ul>
          </div>
        </div>

        {/* Original Result History */}
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">ORIGINAL RESULT HISTORY</h2>
          <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="px-4 py-2">Action</th>
                  <th className="px-4 py-2">Type</th>
                  <th className="px-4 py-2">Fullname</th>
                  <th className="px-4 py-2">Profile Code/RegNo.</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Screenshot</th>
                  <th className="px-4 py-2">Remark</th>
                  <th className="px-4 py-2">Submitted On</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan="8" className="text-center py-4">No Record Found!</td>
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