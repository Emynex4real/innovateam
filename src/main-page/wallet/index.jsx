import React, { useState } from "react";

const Wallet = () => {
  // State for input visibility
  const [showInput, setShowInput] = useState(false);

  // State for payment amount
  const [paymentAmount, setPaymentAmount] = useState("");

  // State for available balance (initially 0.00)
  const [balance, setBalance] = useState(0.0);

  // State for recent transactions (initially with 3 transactions)
  const [transactions, setTransactions] = useState([
    { id: 1, type: "Topup", amount: 400.0, date: "1 month ago", status: "Successful" },
    { id: 2, type: "Topup", amount: 800.0, date: "5 days ago", status: "Successful" },
    { id: 3, type: "Topup", amount: 300.0, date: "1 day ago", status: "Successful" },
  ]);

  // Handle payment submission
  const handlePayment = () => {
    const amount = parseFloat(paymentAmount);
    if (!isNaN(amount) && amount > 0) {
      // Update the balance
      setBalance((prevBalance) => prevBalance + amount);

      // Add the new transaction to the list
      const newTransaction = {
        id: transactions.length + 1,
        type: "Payment",
        amount: amount, // Positive amount for payments
        date: "Just now",
        status: "Successful",
      };

      // Update the transactions list with the new transaction at the top
      // Ensure only the last 4 transactions are kept
      setTransactions((prevTransactions) => {
        const updatedTransactions = [newTransaction, ...prevTransactions];
        return updatedTransactions.slice(0, 4); // Keep only the last 4 transactions
      });

      // Clear the input field and hide it
      setPaymentAmount("");
      setShowInput(false);
    } else {
      alert("Please enter a valid amount.");
    }
  };

  return (
    <div className="">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Wallet Details Container */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Wallet Details</h2>
            <div className="space-y-4">
              {/* Available Balance */}
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-gray-600">Available Balance</p>
                <p className="text-3xl font-bold">
                  N{balance.toFixed(2)}
                </p>
              </div>

              {/* Pay With Card Button and Input */}
              <div className="space-y-4">
                <button
                  onClick={() => setShowInput(!showInput)}
                  className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition duration-300"
                >
                  Pay With Card
                </button>

                {showInput && (
                  <div className="space-y-2">
                    <input
                      type="number"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      placeholder="Enter amount"
                      className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <button
                      onClick={handlePayment}
                      className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition duration-300"
                    >
                      Submit Payment
                    </button>
                  </div>
                )}
              </div>

              {/* Transaction Note */}
              <p className="text-sm text-gray-500">
                NOTE: There is <strong>N$0.00</strong> transaction charge for every bank
                transfer.
              </p>

              {/* Account Details */}
              <div className="space-y-2">
                <p className="text-gray-600">Account Name: Mic</p>
                <p className="text-gray-600">Account Number: 7324484567</p>
                <p className="text-gray-600">Bank: Werna Bank</p>
              </div>

              <div className="space-y-2">
                <p className="text-gray-600">Account Name: Mic</p>
                <p className="text-gray-600">Account Number: 5025249620</p>
                <p className="text-gray-600">Bank: Sterling Bank</p>
              </div>
            </div>
          </div>

          {/* Recent Transactions Container */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Recent Transactions</h2>
            <div className="space-y-4">
              {/* Last Recharge */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-600">Last Recharge</p>
                <p className="text-2xl font-bold text-gray-800">
                  N{transactions[0]?.amount.toFixed(2) || "0.00"}
                </p>
              </div>

              {/* Transaction List */}
              <div className="space-y-2">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition duration-300"
                  >
                    <div>
                      <p className="text-gray-600">{transaction.type}</p>
                      <p className="text-sm text-gray-400">{transaction.date}</p>
                    </div>
                    <p
                      className={`font-bold ${
                        transaction.amount > 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {transaction.amount > 0 ? "+" : "-"} N{Math.abs(transaction.amount).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              {/* View All Button */}
              <button className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition duration-300">
                View All
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wallet;