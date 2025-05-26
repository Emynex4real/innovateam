import React, { useState } from "react";
import { motion } from "framer-motion";
import { useTransactions } from "../../contexts/TransactionContext";
import { PhoneIcon, WifiIcon } from "@heroicons/react/24/outline";
import { useDarkMode } from "../../contexts/DarkModeContext";

const DataSubscription = () => {
  const { addTransaction, walletBalance, transactions } = useTransactions();
  const [network, setNetwork] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [showPlans, setShowPlans] = useState(false);
  const { isDarkMode } = useDarkMode();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } },
  };

  // Data plans for each network
  const dataPlans = {
    MTN: [
      { id: 1, name: "500MB Daily", amount: "₦150", validity: "1 Day" },
      { id: 2, name: "1GB Daily", amount: "₦300", validity: "1 Day" },
      { id: 3, name: "2GB Weekly", amount: "₦500", validity: "7 Days" },
      { id: 4, name: "5GB Monthly", amount: "₦1500", validity: "30 Days" },
      { id: 5, name: "10GB Monthly", amount: "₦3000", validity: "30 Days" },
      { id: 6, name: "20GB Monthly", amount: "₦5000", validity: "30 Days" },
    ],
    Airtel: [
      { id: 1, name: "500MB Daily", amount: "₦200", validity: "1 Day" },
      { id: 2, name: "2GB Weekly", amount: "₦1000", validity: "7 Days" },
      { id: 3, name: "6GB Monthly", amount: "₦2500", validity: "30 Days" },
    ],
    Glo: [
      { id: 1, name: "800MB Daily", amount: "₦250", validity: "1 Day" },
      { id: 2, name: "4GB Weekly", amount: "₦1200", validity: "7 Days" },
      { id: 3, name: "8GB Monthly", amount: "₦3000", validity: "30 Days" },
    ],
    "9mobile": [
      { id: 1, name: "1GB Daily", amount: "₦350", validity: "1 Day" },
      { id: 2, name: "3GB Weekly", amount: "₦1100", validity: "7 Days" },
      { id: 3, name: "7GB Monthly", amount: "₦2800", validity: "30 Days" },
    ],
  };

  // Validate Nigerian mobile number
  const validateMobileNumber = (number) => {
    const regex = /^0[7-9][0-1]\d{8}$/;
    return regex.test(number.trim());
  };

  // Format mobile number as user types
  const formatMobileNumber = (number) => {
    const cleaned = number.replace(/\D/g, "");
    return cleaned.substring(0, 11);
  };

  const handleProceed = (e) => {
    e.preventDefault();
    setMessage({ text: "", type: "" });

    if (!network) {
      setMessage({ text: "Please select a network.", type: "error" });
      return;
    }

    if (!mobileNumber || !validateMobileNumber(mobileNumber)) {
      setMessage({
        text: "Please enter a valid Nigerian mobile number (e.g., 08012345678).",
        type: "error",
      });
      return;
    }

    setShowPlans(true);
    setTimeout(() => {
      window.scrollTo({
        top: window.scrollY + 300,
        behavior: "smooth",
      });
    }, 100);
  };

  const handleBuyPlan = () => {
    if (!selectedPlan) {
      setMessage({ text: "Please select a data plan.", type: "error" });
      return;
    }

    const plan = dataPlans[network].find((p) => p.id === parseInt(selectedPlan));
    const numericAmount = parseFloat(plan.amount.replace("₦", "").replace(/[^\d.]/g, ""));
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
        addTransaction({
          id: transactions.length + 1,
          label: `${network} ${plan.name}`,
          description: `Data subscription to ${mobileNumber}`,
          amount: numericAmount,
          type: "debit",
          category: "data",
          status: "Successful",
          paymentMethod: "wallet",
          date: new Date().toISOString(),
        });

        setMessage({
          text: `Successfully purchased ${plan.name} for ${mobileNumber}!`,
          type: "success",
        });
        setShowPlans(false);
        setNetwork("");
        setMobileNumber("");
        setSelectedPlan("");
      } else {
        setMessage({
          text: "Transaction failed. Please try again later.",
          type: "error",
        });
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleCancel = () => {
    setShowPlans(false);
    setNetwork("");
    setMobileNumber("");
    setSelectedPlan("");
    setMessage({ text: "", type: "" });
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      isDarkMode ? 'bg-dark-surface text-dark-text-primary' : 'bg-gradient-to-b from-gray-50 to-white'
    } lg:ml-0 md:ml-20 py-8`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="relative">
            <h1 className={`text-3xl md:text-4xl font-extrabold tracking-tight mb-2 relative z-10 ${
              isDarkMode ? 'text-dark-text-primary' : 'text-gray-800'
            }`}>
              Data Subscription
            </h1>
            <p className={`text-lg relative z-10 ${
              isDarkMode ? 'text-dark-text-secondary' : 'text-gray-600'
            }`}>Purchase data bundles for any network</p>
            <div className={`absolute -top-6 -left-6 w-24 h-24 rounded-full filter blur-xl opacity-60 ${
              isDarkMode ? 'bg-green-900/30' : 'bg-green-100'
            }`}></div>
            <div className={`absolute top-10 -right-4 w-16 h-16 rounded-full filter blur-lg opacity-40 ${
              isDarkMode ? 'bg-green-900/20' : 'bg-green-50'
            }`}></div>
          </div>
        </motion.div>

        {/* Data Subscription Section */}
        <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
          >
            <div className={`rounded-2xl shadow-xl p-8 relative overflow-hidden border ${
              isDarkMode ? 'bg-dark-surface-secondary border-dark-border' : 'bg-white border-gray-100'
            }`}>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <WifiIcon className="h-8 w-8 text-green-500" />
                  <h2 className={`text-2xl font-bold ${
                    isDarkMode ? 'text-dark-text-primary' : 'text-gray-800'
                  }`}>Buy Data Bundle</h2>
                </div>

                <form onSubmit={handleProceed} className="space-y-6">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                    {["MTN", "Airtel", "Glo", "9mobile"].map((net) => (
                      <motion.button
                        key={net}
                        type="button"
                        variants={itemVariants}
                        onClick={() => setNetwork(net)}
                        className={`p-4 rounded-xl border-2 transition-all duration-300 flex flex-col items-center gap-2
                          ${network === net
                            ? isDarkMode 
                              ? 'border-green-600 bg-green-900/30 text-green-400'
                              : 'border-green-500 bg-green-50 text-green-700'
                            : isDarkMode
                              ? 'border-dark-border hover:border-green-800 hover:bg-green-900/20'
                              : 'border-gray-200 hover:border-green-200 hover:bg-green-50/30'
                          }
                          ${isLoading || showPlans ? 'opacity-50 cursor-not-allowed' : ''}
                        `}
                        disabled={isLoading || showPlans}
                      >
                        {net === "MTN" && (
                          <div className="w-12 h-12 flex items-center justify-center bg-yellow-400 rounded-full">
                            <span className="text-2xl font-bold text-white">M</span>
                          </div>
                        )}
                        {net === "Airtel" && (
                          <div className="w-12 h-12 flex items-center justify-center bg-red-500 rounded-full">
                            <span className="text-2xl font-bold text-white">A</span>
                          </div>
                        )}
                        {net === "Glo" && (
                          <div className="w-12 h-12 flex items-center justify-center bg-green-500 rounded-full">
                            <span className="text-2xl font-bold text-white">G</span>
                          </div>
                        )}
                        {net === "9mobile" && (
                          <div className="w-12 h-12 flex items-center justify-center bg-green-600 rounded-full">
                            <span className="text-2xl font-bold text-white">9</span>
                          </div>
                        )}
                        <span className={`font-medium ${
                          isDarkMode ? 'text-dark-text-primary' : ''
                        }`}>{net}</span>
                      </motion.button>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="mobileNumber" className={`block text-sm font-medium ${
                      isDarkMode ? 'text-dark-text-primary' : 'text-gray-700'
                    }`}>
                      Mobile Number
                    </label>
                    <div className="relative">
                      <PhoneIcon className={`h-5 w-5 absolute left-3 top-3 ${
                        isDarkMode ? 'text-dark-text-secondary' : 'text-gray-400'
                      }`} />
                      <input
                        type="tel"
                        id="mobileNumber"
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(formatMobileNumber(e.target.value))}
                        placeholder="Enter mobile number (e.g., 08012345678)"
                        className={`w-full pl-10 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                          isDarkMode 
                            ? 'bg-dark-surface border-dark-border text-dark-text-primary placeholder-dark-text-secondary' 
                            : 'border-gray-200 placeholder-gray-400'
                        }`}
                        disabled={isLoading || showPlans}
                        maxLength="11"
                      />
                    </div>
                    {mobileNumber && !validateMobileNumber(mobileNumber) && (
                      <p className="text-sm text-red-500">Please enter a valid Nigerian mobile number</p>
                    )}
                  </div>

                  {message.text && (
                    <div
                      className={`p-4 rounded-xl ${
                        message.type === "success"
                          ? isDarkMode 
                            ? 'bg-green-900/30 text-green-400 border border-green-800'
                            : 'bg-green-50 text-green-800 border border-green-200'
                          : isDarkMode
                            ? 'bg-red-900/30 text-red-400 border border-red-800'
                            : 'bg-red-50 text-red-800 border border-red-200'
                      }`}
                    >
                      {message.text}
                    </div>
                  )}

                  <div className="flex gap-4">
                    {!showPlans ? (
                      <motion.button
                        type="submit"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`flex-1 py-4 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                          isDarkMode
                            ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'bg-green-500 hover:bg-green-600 text-white'
                        }`}
                        disabled={isLoading || !network || !validateMobileNumber(mobileNumber)}
                      >
                        Proceed
                      </motion.button>
                    ) : (
                      <>
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleCancel}
                          className={`flex-1 py-4 rounded-xl font-semibold transition-all duration-300 ${
                            isDarkMode
                              ? 'bg-dark-surface hover:bg-dark-border text-dark-text-primary'
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                          }`}
                        >
                          Cancel
                        </motion.button>
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleBuyPlan}
                          className={`flex-1 py-4 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                            isDarkMode
                              ? 'bg-green-600 hover:bg-green-700 text-white'
                              : 'bg-green-500 hover:bg-green-600 text-white'
                          }`}
                          disabled={isLoading || !selectedPlan}
                        >
                          {isLoading ? (
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                              Processing...
                            </div>
                          ) : (
                            'Buy Now'
                          )}
                        </motion.button>
                      </>
                    )}
                  </div>
                </form>
              </div>
            </div>

            {/* Data Plans Section */}
            {showPlans && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-2xl shadow-xl p-8 border ${
                  isDarkMode ? 'bg-dark-surface-secondary border-dark-border' : 'bg-white border-gray-100'
                }`}
              >
                <h3 className={`text-xl font-semibold mb-6 ${
                  isDarkMode ? 'text-dark-text-primary' : 'text-gray-800'
                }`}>Select Data Plan</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dataPlans[network].map((plan) => (
                    <motion.button
                      key={plan.id}
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedPlan(plan.id.toString())}
                      className={`p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                        selectedPlan === plan.id.toString()
                          ? isDarkMode 
                            ? 'border-green-600 bg-green-900/30'
                            : 'border-green-500 bg-green-50'
                          : isDarkMode
                            ? 'border-dark-border hover:border-green-800 hover:bg-green-900/20'
                            : 'border-gray-200 hover:border-green-200 hover:bg-green-50/30'
                      }`}
                    >
                      <p className={`font-semibold mb-1 ${
                        isDarkMode ? 'text-dark-text-primary' : 'text-gray-800'
                      }`}>{plan.name}</p>
                      <p className={`text-lg font-bold ${
                        isDarkMode ? 'text-green-400' : 'text-green-600'
                      }`}>{plan.amount}</p>
                      <p className={`text-sm ${
                        isDarkMode ? 'text-dark-text-secondary' : 'text-gray-500'
                      }`}>Validity: {plan.validity}</p>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Transactions Section */}
        <section className="bg-white rounded-xl shadow-lg p-6 mt-8 transition-all duration-300 hover:shadow-xl">
          <h2 className="text-xl font-bold mb-4">Recent Transactions</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions
                  .filter((transaction) => transaction.category === "data")
                  .map((transaction) => (
                    <tr key={transaction.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(transaction.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {transaction.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₦{transaction.amount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            transaction.status === "Successful"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {transaction.status}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};

export default DataSubscription;