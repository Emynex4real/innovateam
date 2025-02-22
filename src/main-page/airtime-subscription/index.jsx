import React, { useState } from "react";

const AirtimeSubscription = () => {
  const [network, setNetwork] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [transactions, setTransactions] = useState([
    { id: 1, date: "2025-02-12", network: "MTN", amount: "₦1000", status: "Success" },
    { id: 2, date: "2025-02-11", network: "Airtel", amount: "₦500", status: "Failed" },
    { id: 3, date: "2025-02-10", network: "Glo", amount: "₦1500", status: "Success" },
  ]);

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

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      const formattedAmount = `₦${parseFloat(amount.replace("₦", "").replace(/[^\d.]/g, "")).toLocaleString()}`;
      const newTransaction = {
        id: transactions.length + 1,
        date: new Date().toISOString().split("T")[0], // Current date
        network,
        amount: formattedAmount,
        status: Math.random() > 0.2 ? "Success" : "Failed", // Random success/failure for demo
      };

      setTransactions([newTransaction, ...transactions]); // Add new transaction to top
      setMessage({
        text: `Airtime of ${formattedAmount} subscribed to ${network} on ${mobileNumber}!`,
        type: "success",
      });
      setNetwork("");
      setMobileNumber("");
      setAmount("");
      setIsLoading(false);
    }, 1000); // Simulated delay
  };

  return (
    <div className="container mx-auto px-4 py-8 font-nunito max-w-4xl">
      {/* Airtime Subscription Section */}
      <section className="bg-white rounded-xl shadow-lg p-6 mb-8 transition-all duration-300 hover:shadow-xl">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">Airtime Subscription</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="network" className="block text-sm font-semibold text-gray-700 mb-2">
              Network
            </label>
            <select
              id="network"
              className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
              value={network}
              onChange={(e) => setNetwork(e.target.value)}
              disabled={isLoading}
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
              onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ""))} // Allow only digits
              maxLength={11}
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="amount" className="block text-sm font-semibold text-gray-700 mb-2">
              Amount
            </label>
            <input
              type="text"
              id="amount"
              className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
              placeholder="e.g., ₦500"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^0-9₦]/g, ""))} // Allow digits and ₦
              disabled={isLoading}
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
            className="w-full bg-green-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-300 flex items-center justify-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Processing...
              </>
            ) : (
              "Proceed"
            )}
          </button>
        </form>
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

export default AirtimeSubscription;