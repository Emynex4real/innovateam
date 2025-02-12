import React, { useState } from "react";

const DataSubscription = () => {
  const [network, setNetwork] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [transactions, setTransactions] = useState([
    { id: 1, date: "2025-02-12", network: "MTN", amount: "₦1000", status: "Success" },
    { id: 2, date: "2025-02-11", network: "Airtel", amount: "₦500", status: "Failed" },
    { id: 3, date: "2025-02-10", network: "Glo", amount: "₦1500", status: "Success" },
  ]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (network && mobileNumber) {
      alert(`Subscribed to ${network} with number ${mobileNumber}`);
      // Add logic to process the subscription
    } else {
      alert("Please fill in all fields.");
    }
  };

  return (
    <div className="font-sans min-h-screen mt-20 p-6 ml-20 md:ml-0">
      {/* Data Subscription Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Data Subscription</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="network">
              Network
            </label>
            <select
              id="network"
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              value={network}
              onChange={(e) => setNetwork(e.target.value)}
              required
            >
              <option value="">Select Network</option>
              <option value="MTN">MTN</option>
              <option value="Airtel">Airtel</option>
              <option value="Glo">Glo</option>
              <option value="9mobile">9mobile</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="mobileNumber">
              Mobile Number
            </label>
            <input
              type="text"
              id="mobileNumber"
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter Mobile Number"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition duration-300"
          >
            Proceed
          </button>
        </form>
      </div>

      {/* Transactions Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Transactions</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-gray-200 text-gray-700">
                <th className="py-2 px-4 text-left">Date</th>
                <th className="py-2 px-4 text-left">Network</th>
                <th className="py-2 px-4 text-left">Amount</th>
                <th className="py-2 px-4 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="border-b border-gray-200 hover:bg-gray-50 transition duration-300">
                  <td className="py-2 px-4">{transaction.date}</td>
                  <td className="py-2 px-4">{transaction.network}</td>
                  <td className="py-2 px-4">{transaction.amount}</td>
                  <td className="py-2 px-4">
                    <span
                      className={`px-2 py-1 rounded-full text-sm ${
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
      </div>
    </div>
  );
};

export default DataSubscription;