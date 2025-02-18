import React, { useState } from "react";

const Wallet = () => {
  const [showInput, setShowInput] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [balance, setBalance] = useState(0.0);
  const [transactions, setTransactions] = useState([
    { id: 1, type: "Topup", amount: 400.0, date: "1 month ago", status: "Successful" },
    { id: 2, type: "Topup", amount: 800.0, date: "5 days ago", status: "Successful" },
    { id: 3, type: "Topup", amount: 300.0, date: "1 day ago", status: "Successful" },
  ]);
  const [showPaymentPreview, setShowPaymentPreview] = useState(false);

  const handlePayment = () => {
    const amount = parseFloat(paymentAmount);
    if (!isNaN(amount) && amount > 0) {
      setShowPaymentPreview(true); // Show the payment preview modal
    } else {
      alert("Please enter a valid amount.");
    }
  };

  const confirmPayment = () => {
    const amount = parseFloat(paymentAmount);
    setBalance((prevBalance) => prevBalance + amount);
    const newTransaction = {
      id: transactions.length + 1,
      type: "Payment",
      amount: amount,
      date: "Just now",
      status: "Successful",
    };
    setTransactions((prevTransactions) => {
      const updatedTransactions = [newTransaction, ...prevTransactions];
      return updatedTransactions.slice(0, 4);
    });
    setPaymentAmount(""); // Clear the input after confirmation
    setShowInput(false); // Hide the input field
    setShowPaymentPreview(false); // Close the modal
  };

  const transactionCharge = 50.0; // Example transaction charge

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Wallet Details Container */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Wallet Details</h2>
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-gray-600">Available Balance</p>
                <p className="text-3xl font-bold">N{balance.toFixed(2)}</p>
              </div>

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

              <p className="text-sm text-gray-500">
                NOTE: There is <strong>N$0.00</strong> transaction charge for every bank transfer.
              </p>

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
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-600">Last Recharge</p>
                <p className="text-2xl font-bold text-gray-800">
                  N{transactions[0]?.amount.toFixed(2) || "0.00"}
                </p>
              </div>

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

              <button className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition duration-300">
                View All
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Preview Modal */}
      {showPaymentPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-xl font-bold mb-4">Payment Preview</h2>
            <div className="space-y-4">
              <p><strong>Transaction:</strong> e-Wallet Topup</p>
              <p><strong>Invoice No:</strong> AG-1739874677-HAW1M</p>
              <p><strong>Date:</strong> 2025-02-18 11:31:17</p>
              <p><strong>Amount:</strong> N{parseFloat(paymentAmount || 0).toFixed(2)}</p>
              <p><strong>Transaction charge:</strong> N{transactionCharge.toFixed(2)}</p>
              <p><strong>TOTAL:</strong> N{(parseFloat(paymentAmount || 0) + transactionCharge).toFixed(2)}</p>
            </div>
            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={() => setShowPaymentPreview(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition duration-300"
              >
                Cancel
              </button>
              <button
                onClick={confirmPayment}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition duration-300"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wallet;