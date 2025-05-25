import React, { useState } from "react";
import { motion } from "framer-motion";
import { useTransactions } from "../../contexts/TransactionContext";
import { PhoneIcon, WifiIcon } from "@heroicons/react/24/outline";

const DataSubscription = () => {
  const { addTransaction, walletBalance, transactions } = useTransactions();
  const [network, setNetwork] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [showPlans, setShowPlans] = useState(false);

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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white font-nunito lg:ml-0 md:ml-20 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="relative">
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 tracking-tight mb-2 relative z-10">
              Data Subscription
            </h1>
            <p className="text-gray-600 text-lg relative z-10">Purchase data bundles for any network</p>
            <div className="absolute -top-6 -left-6 w-24 h-24 bg-green-100 rounded-full filter blur-xl opacity-60"></div>
            <div className="absolute top-10 -right-4 w-16 h-16 bg-green-50 rounded-full filter blur-lg opacity-40"></div>
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
            <div className="bg-white rounded-2xl shadow-xl p-8 relative overflow-hidden border border-gray-100">
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <WifiIcon className="h-8 w-8 text-green-500" />
                  <h2 className="text-2xl font-bold text-gray-800">Buy Data Bundle</h2>
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
                            ? "border-green-500 bg-green-50 text-green-700"
                            : "border-gray-200 hover:border-green-200 hover:bg-green-50/30"}
                          ${isLoading || showPlans ? "opacity-50 cursor-not-allowed" : ""}
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
                        <span className="font-medium">{net}</span>
                      </motion.button>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="mobileNumber" className="block text-sm font-medium text-gray-700">
                      Mobile Number
                    </label>
                    <div className="relative">
                      <PhoneIcon className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
                      <input
                        type="tel"
                        id="mobileNumber"
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(formatMobileNumber(e.target.value))}
                        placeholder="Enter mobile number (e.g., 08012345678)"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                      className={`p-4 rounded-lg ${
                        message.type === "error" ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"
                      }`}
                    >
                      {message.text}
                    </div>
                  )}

                  <button
                    type="submit"
                    className={`w-full bg-gradient-to-r from-green-600 to-green-500 text-white py-3 rounded-xl font-semibold
                      hover:from-green-700 hover:to-green-600 transition-all duration-300 flex items-center justify-center gap-2
                      ${isLoading ? "opacity-50 cursor-not-allowed" : ""}
                    `}
                    disabled={isLoading || showPlans}
                  >
                    Proceed to Select Plan
                  </button>
                </form>
              </div>
            </div>

            {/* Data Plans Dropdown Section */}
            {showPlans && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100"
              >
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    {network === "MTN" && (
                      <div className="w-6 h-6 flex items-center justify-center bg-yellow-400 rounded-full text-xs font-bold text-white">M</div>
                    )}
                    {network === "Airtel" && (
                      <div className="w-6 h-6 flex items-center justify-center bg-red-500 rounded-full text-xs font-bold text-white">A</div>
                    )}
                    {network === "Glo" && (
                      <div className="w-6 h-6 flex items-center justify-center bg-green-500 rounded-full text-xs font-bold text-white">G</div>
                    )}
                    {network === "9mobile" && (
                      <div className="w-6 h-6 flex items-center justify-center bg-green-600 rounded-full text-xs font-bold text-white">9</div>
                    )}
                    Select {network} Data Plan
                  </h3>
                </div>

                <div className="p-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="dataPlan" className="block text-sm font-medium text-gray-700">
                        Choose Data Plan
                      </label>
                      <select
                        id="dataPlan"
                        value={selectedPlan}
                        onChange={(e) => setSelectedPlan(e.target.value)}
                        className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        disabled={isLoading}
                      >
                        <option value="">Select a data plan</option>
                        {network &&
                          dataPlans[network].map((plan) => (
                            <option key={plan.id} value={plan.id}>
                              {plan.name} - {plan.amount} ({plan.validity})
                            </option>
                          ))}
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={handleBuyPlan}
                      className={`w-full bg-gradient-to-r from-green-600 to-green-500 text-white py-3 rounded-xl font-semibold
                        hover:from-green-700 hover:to-green-600 transition-all duration-300 flex items-center justify-center gap-2
                        ${isLoading ? "opacity-50 cursor-not-allowed" : ""}
                      `}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          Processing...
                        </span>
                      ) : (
                        "Buy Now"
                      )}
                    </button>
                  </div>
                </div>

                <div className="p-6 bg-gray-50 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="w-full bg-white border-2 border-gray-200 text-gray-700 py-3 px-4 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    Back to Selection
                  </button>
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