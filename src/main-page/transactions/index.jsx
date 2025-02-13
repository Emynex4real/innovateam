import React from 'react';

const Transactions = () => {
  // Sample transaction data
  const transactions = [
    { id: 1, description: "Olevel upload Slot", quantity: 2, amount: "₦800.00", date: "12/02/2025", status: "Successful", action: "View" },
    { id: 2, description: "e-Wallet Topup", quantity: 1, amount: "₦800.00", date: "12/02/2025", status: "Successful", action: "View" },
    { id: 3, description: "Caps printing Slot", quantity: 1, amount: "₦300.00", date: "10/02/2025", status: "Successful", action: "View" },
    { id: 4, description: "e-Wallet Topup", quantity: 1, amount: "₦300.00", date: "10/02/2025", status: "Successful", action: "View" },
    { id: 5, description: "Olevel upload Slot", quantity: 2, amount: "₦800.00", date: "06/02/2025", status: "Successful", action: "View" },
    { id: 6, description: "e-Wallet Topup", quantity: 1, amount: "₦800.00", date: "06/02/2025", status: "Successful", action: "View" },
    { id: 7, description: "Olevel upload Slot", quantity: 1, amount: "₦400.00", date: "07/01/2025", status: "Successful", action: "View" },
    { id: 8, description: "e-Wallet Topup", quantity: 1, amount: "₦400.00", date: "07/01/2025", status: "Successful", action: "View" },
  ];

  return (
    <div className="">
      <div className="">
        <h1 className="text-2xl font-bold mb-6">Transactions</h1>

        <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-200">
                <th className="px-4 py-2 text-left">#</th>
                <th className="px-4 py-2 text-left">Description</th>
                <th className="px-4 py-2 text-left">Quantity</th>
                <th className="px-4 py-2 text-left">Amount</th>
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="border-b">
                  <td className="px-4 py-2">{transaction.id}</td>
                  <td className="px-4 py-2">{transaction.description}</td>
                  <td className="px-4 py-2">{transaction.quantity}</td>
                  <td className="px-4 py-2">{transaction.amount}</td>
                  <td className="px-4 py-2">{transaction.date}</td>
                  <td className="px-4 py-2">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
                      {transaction.status}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => alert(`Viewing transaction ${transaction.id}`)}
                      className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600"
                    >
                      {transaction.action}
                    </button>
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

export default Transactions;