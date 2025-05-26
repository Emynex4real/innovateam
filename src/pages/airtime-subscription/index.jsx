import React, { useState } from "react";
import { useTransactions } from "../../contexts/TransactionContext";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { PhoneIcon } from "@heroicons/react/24/outline";
import { useDarkMode } from "../../contexts/DarkModeContext";

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      when: "beforeChildren",
      staggerChildren: 0.1
    }
  }
};

const formVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3 }
  }
};

const AirtimeSubscription = () => {
  const { walletBalance, addTransaction, transactions } = useTransactions();
  const [network, setNetwork] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const { isDarkMode } = useDarkMode();

  const formatAmount = (value) => {
    // Remove all non-digit characters except decimal point
    const numericValue = value.replace(/[^\d]/g, "");
    // Convert to number and format with commas
    const formattedValue = parseInt(numericValue, 10).toLocaleString();
    return isNaN(parseInt(numericValue, 10)) ? "" : formattedValue;
  };

  const handleCancel = () => {
    setNetwork("");
    setMobileNumber("");
    setAmount("");
    setMessage({ text: "", type: "" });
  };

  // Validate Nigerian mobile number (e.g., 11 digits starting with 0)
  const validateMobileNumber = (number) => {
    const regex = /^0[7-9][0-1]\d{8}$/; // Matches 070, 080, 090, 081, etc.
    return regex.test(number);
  };

  // Validate amount (positive number, e.g., ₦50 - ₦10000)
  const validateAmount = (amt) => {
    const numericAmt = parseFloat(amt.replace("₦", "").replace(/[^\d.]/g, ""));
    return !isNaN(numericAmt) && numericAmt >= 50 && numericAmt <= 10000;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage({ text: "", type: "" });

    if (!network) {
      setMessage({ text: "Please select a network.", type: "error" });
      return;
    }

    if (!mobileNumber || !validateMobileNumber(mobileNumber)) {
      setMessage({ text: "Please enter a valid Nigerian mobile number (e.g., 08012345678).", type: "error" });
      return;
    }

    if (!amount || !validateAmount(amount)) {
      setMessage({ text: "Please enter a valid amount between ₦50 and ₦10,000.", type: "error" });
      return;
    }

    const numericAmount = parseFloat(amount.replace("₦", "").replace(/[^\d.]/g, ""));

    // Check wallet balance
    if (numericAmount > walletBalance) {
      setMessage({
        text: "Insufficient wallet balance. Please fund your wallet.",
        type: "error",
      });
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      const success = Math.random() > 0.2;

      if (success) {
        // Add transaction
        addTransaction({
          id: transactions.length + 1,
          label: `${network} Airtime Recharge`,
          description: `Airtime recharge to ${mobileNumber}`,
          amount: numericAmount,
          type: "debit",
          category: "airtime",
          status: "Successful",
          paymentMethod: "wallet",
          date: new Date().toISOString(),
        });

        setMessage({
          text: `Successfully recharged ${network} airtime worth ₦${numericAmount.toLocaleString()} to ${mobileNumber}!`,
          type: "success",
        });
        setNetwork("");
        setMobileNumber("");
        setAmount("");
      } else {
        setMessage({
          text: "Transaction failed. Please try again later.",
          type: "error",
        });
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      isDarkMode ? 'bg-dark-surface text-dark-text-primary' : 'bg-gradient-to-b from-gray-50 to-white'
    } container mx-auto px-4 py-8 font-nunito relative`}>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`fixed inset-0 ${
            isDarkMode ? 'bg-black/40' : 'bg-black/20'
          } backdrop-blur-sm z-50 flex items-center justify-center`}
        >
          <div className={`${
            isDarkMode ? 'bg-dark-surface-secondary' : 'bg-white'
          } rounded-2xl p-6 shadow-xl flex items-center gap-4`}>
            <div className="relative">
              <div className="w-12 h-12 rounded-full border-4 border-green-200 animate-spin border-t-green-500"></div>
              <div className="w-12 h-12 rounded-full border-4 border-green-500/30 animate-ping absolute inset-0"></div>
            </div>
            <p className={`${
              isDarkMode ? 'text-dark-text-primary' : 'text-gray-600'
            } font-medium`}>Processing your request...</p>
          </div>
        </motion.div>
      )}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className={`p-3 ${
            isDarkMode ? 'bg-green-900/30' : 'bg-green-100'
          } rounded-full`}>
            <PhoneIcon className={`w-6 h-6 ${
              isDarkMode ? 'text-green-400' : 'text-green-600'
            }`} />
          </div>
          <h1 className={`text-2xl md:text-3xl font-bold ${
            isDarkMode ? 'text-dark-text-primary' : 'text-gray-800'
          }`}>Airtime Subscription</h1>
        </div>

        {/* Main Content */}
        <div className={`${
          isDarkMode ? 'bg-dark-surface-secondary border-dark-border' : 'bg-white border-gray-100'
        } rounded-2xl shadow-xl p-6 mb-8 border`}>
          <motion.form
            onSubmit={handleSubmit}
            variants={formVariants}
            className="space-y-6"
          >
            {/* Network Selection */}
            <motion.div variants={itemVariants}>
              <label htmlFor="network" className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-dark-text-primary' : 'text-gray-700'
              }`}>
                Select Network Provider
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {["MTN", "Airtel", "Glo", "9mobile"].map((provider) => (
                  <button
                    key={provider}
                    type="button"
                    onClick={() => setNetwork(provider)}
                    className={`p-4 rounded-xl border-2 transition-all duration-300
                      ${network === provider
                        ? isDarkMode
                          ? 'border-green-600 bg-green-900/30 text-green-400'
                          : 'border-green-500 bg-green-50 text-green-700'
                        : isDarkMode
                          ? 'border-dark-border hover:border-green-800 hover:bg-green-900/20'
                          : 'border-gray-200 hover:border-green-200 hover:bg-green-50'
                      }
                    `}
                    disabled={isLoading}
                  >
                    <div className="text-center">
                      <div className={`w-8 h-8 mx-auto mb-2 rounded-full flex items-center justify-center
                        ${network === provider 
                          ? isDarkMode ? 'bg-green-600' : 'bg-green-500'
                          : isDarkMode ? 'bg-dark-border' : 'bg-gray-200'
                        }
                      `}>
                        <span className="text-white text-xs font-bold">
                          {provider === "MTN" ? "M" :
                           provider === "Airtel" ? "A" :
                           provider === "Glo" ? "G" : "9"}
                        </span>
                      </div>
                      <span className={`text-sm font-medium ${
                        isDarkMode ? 'text-dark-text-primary' : ''
                      }`}>{provider}</span>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Mobile Number Input */}
            <motion.div variants={itemVariants}>
              <label htmlFor="mobileNumber" className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-dark-text-primary' : 'text-gray-700'
              }`}>
                Mobile Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="mobileNumber"
                  className={`w-full pl-12 pr-4 py-3 rounded-xl border focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
                    isDarkMode 
                      ? 'bg-dark-surface border-dark-border text-dark-text-primary placeholder-dark-text-secondary' 
                      : 'border-gray-200 placeholder-gray-400'
                  }`}
                  placeholder="Enter mobile number"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ""))}
                  maxLength={11}
                  disabled={isLoading}
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <PhoneIcon className={`w-5 h-5 ${
                    isDarkMode ? 'text-dark-text-secondary' : 'text-gray-400'
                  }`} />
                </div>
              </div>
            </motion.div>

            {/* Amount Input */}
            <motion.div variants={itemVariants}>
              <label htmlFor="amount" className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-dark-text-primary' : 'text-gray-700'
              }`}>
                Amount
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="amount"
                  className={`w-full pl-12 pr-4 py-3 rounded-xl border focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
                    isDarkMode 
                      ? 'bg-dark-surface border-dark-border text-dark-text-primary placeholder-dark-text-secondary' 
                      : 'border-gray-200 placeholder-gray-400'
                  }`}
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(formatAmount(e.target.value))}
                  disabled={isLoading}
                />
                <div className={`absolute left-4 top-1/2 -translate-y-1/2 font-medium ${
                  isDarkMode ? 'text-dark-text-secondary' : 'text-gray-500'
                }`}>₦</div>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div variants={itemVariants} className="flex gap-4">
              <button
                type="button"
                onClick={handleCancel}
                className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
                  isDarkMode
                    ? 'bg-dark-surface hover:bg-dark-border text-dark-text-primary'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                }`}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                  isDarkMode
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
                disabled={isLoading || !network || !mobileNumber || !amount}
              >
                {isLoading ? 'Processing...' : 'Purchase Airtime'}
              </button>
            </motion.div>
          </motion.form>
        </div>

        {/* Message Display */}
        {message.text && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-xl mb-8 ${
              message.type === 'success'
                ? isDarkMode 
                  ? 'bg-green-900/30 text-green-400 border border-green-800'
                  : 'bg-green-50 text-green-800 border border-green-200'
                : isDarkMode
                  ? 'bg-red-900/30 text-red-400 border border-red-800'
                  : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {message.text}
          </motion.div>
        )}

        {/* Transactions Section */}
        <motion.div
          variants={containerVariants}
          className="bg-white rounded-2xl shadow-xl p-6 overflow-hidden"
        >
          <div className="flex items-center gap-3 mb-6">
            <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h2 className="text-xl font-bold text-gray-800">Recent Transactions</h2>
          </div>

          {transactions.filter(t => t.category === 'airtime').length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8"
            >
              <p className="text-gray-500">No airtime transactions yet</p>
              <p className="text-sm text-gray-400 mt-1">Your airtime purchase history will appear here</p>
            </motion.div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-gray-100">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions
                    .filter(t => t.category === 'airtime')
                    .map((transaction) => (
                      <motion.tr
                        key={transaction.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-gray-50 transition-colors duration-200"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(transaction.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {transaction.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          ₦{transaction.amount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            transaction.status === "Successful"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}>
                            {transaction.status}
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AirtimeSubscription;