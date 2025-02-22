import React, { useState } from "react";

const DataSubscription = () => {
  const [network, setNetwork] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [showPlans, setShowPlans] = useState(false);
  const [transactions, setTransactions] = useState([
    { id: 1, date: "2025-02-12", network: "MTN", amount: "₦1000", status: "Success" },
    { id: 2, date: "2025-02-11", network: "Airtel", amount: "₦500", status: "Failed" },
    { id: 3, date: "2025-02-10", network: "Glo", amount: "₦1500", status: "Success" },
  ]);

  // Data plans for each network
  const dataPlans = {
    MTN: [
      { id: 1, name: "1GB Daily", amount: "₦300" },
      { id: 2, name: "5GB Weekly", amount: "₦1500" },
      { id: 3, name: "10GB Monthly", amount: "₦3500" },
    ],
    Airtel: [
      { id: 1, name: "500MB Daily", amount: "₦200" },
      { id: 2, name: "2GB Weekly", amount: "₦1000" },
      { id: 3, name: "6GB Monthly", amount: "₦2500" },
    ],
    Glo: [
      { id: 1, name: "800MB Daily", amount: "₦250" },
      { id: 2, name: "4GB Weekly", amount: "₦1200" },
      { id: 3, name: "8GB Monthly", amount: "₦3000" },
    ],
    "9mobile": [
      { id: 1, name: "1GB Daily", amount: "₦350" },
      { id: 2, name: "3GB Weekly", amount: "₦1100" },
      { id: 3, name: "7GB Monthly", amount: "₦2800" },
    ],
  };

  // Validate Nigerian mobile number
  const validateMobileNumber = (number) => {
    const regex = /^0[7-9][0-1]\d{8}$/;
    return regex.test(number);
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

    // Show data plans instead of submitting
    setShowPlans(true);
  };

  const handleBuyPlan = (plan) => {
    setIsLoading(true);
    setShowPlans(false);

    // Simulate API call
    setTimeout(() => {
      const newTransaction = {
        id: transactions.length + 1,
        date: new Date().toISOString().split("T")[0],
        network,
        amount: plan.amount,
        status: Math.random() > 0.2 ? "Success" : "Failed", // Random success/failure
      };

      setTransactions([newTransaction, ...transactions]);
      setMessage({
        text: `Purchased ${plan.name} for ${network} on ${mobileNumber}!`,
        type: "success",
      });
      setNetwork("");
      setMobileNumber("");
      setIsLoading(false);
    }, 1000);
  };

  const handleCancel = () => {
    setShowPlans(false);
    setMessage({ text: "", type: "" });
  };

  return (
    <div className="container mx-auto px-4 py-8 font-nunito">
      {/* Data Subscription Section */}
      <section className="bg-white rounded-xl shadow-lg p-6 mb-8 transition-all duration-300 hover:shadow-xl">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">Data Subscription</h2>
        <form onSubmit={handleProceed} className="space-y-6">
          <div>
            <label htmlFor="network" className="block text-sm font-semibold text-gray-700 mb-2">
              Network
            </label>
            <select
              id="network"
              className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
              value={network}
              onChange={(e) => setNetwork(e.target.value)}
              disabled={isLoading || showPlans}
            >
              <option value="">Select Network</option>
              <option value="MTN">MTN</option>
              <option value="Airtel">Airtel</option>
              <option value="Glo">Glo</option>
              <option value="9mobile">9mobile</option>
            </select>
          </div>

          <div>
            <label htmlFor="mobileNumber" className="block text-sm font-semibold text-gray-700 mb-2">
              Mobile Number
            </label>
            <input
              type="text"
              id="mobileNumber"
              className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
              placeholder="e.g., 08012345678"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ""))}
              maxLength={11}
              disabled={isLoading || showPlans}
            />
          </div>

          {message.text && (
            <div
              className={`p-3 rounded-lg text-sm font-medium ${
                message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              }`}
            >
              {message.text}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-green-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-300"
            disabled={isLoading || showPlans}
          >
            Proceed
          </button>
        </form>

        {/* Data Plans Section */}
        {showPlans && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Choose a Data Plan for {network}
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              {dataPlans[network].map((plan) => (
                <div
                  key={plan.id}
                  className="p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex justify-between items-center"
                >
                  <div>
                    <p className="text-gray-800 font-medium">{plan.name}</p>
                    <p className="text-gray-600">{plan.amount}</p>
                  </div>
                  <button
                    onClick={() => handleBuyPlan(plan)}
                    className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-all duration-300"
                    disabled={isLoading}
                  >
                    {isLoading ? "Buying..." : "Buy"}
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={handleCancel}
              className="mt-4 w-full bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-all duration-300"
            >
              Cancel
            </button>
          </div>
        )}
      </section>

      {/* Transactions Section */}
      <section className="bg-white rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">Recent Transactions</h2>
        {transactions.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No transactions yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="py-3 px-4 text-left font-semibold text-sm">Date</th>
                  <th className="py-3 px-4 text-left font-semibold text-sm">Network</th>
                  <th className="py-3 px-4 text-left font-semibold text-sm">Amount</th>
                  <th className="py-3 px-4 text-left font-semibold text-sm">Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr
                    key={transaction.id}
                    className="border-b border-gray-200 hover:bg-gray-50 transition-all duration-200"
                  >
                    <td className="py-3 px-4 text-gray-700">{transaction.date}</td>
                    <td className="py-3 px-4 text-gray-700">{transaction.network}</td>
                    <td className="py-3 px-4 text-gray-700">{transaction.amount}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          transaction.status === "Success"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
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
        )}
      </section>
    </div>
  );
};

export default DataSubscription;