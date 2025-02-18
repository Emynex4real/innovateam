import React, { useState } from "react";

const WaecResultChecker = () => {
  const [quantity, setQuantity] = useState(1); // Default quantity is 1
  const pricePerCard = 3500; // Price per WAEC scratch card

  // Calculate the total amount based on quantity
  const totalAmount = quantity * pricePerCard;

  // Handle quantity change
  const handleQuantityChange = (e) => {
    const selectedQuantity = parseInt(e.target.value, 10);
    setQuantity(selectedQuantity);
  };

  return (
    <div>
      <div className="">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* First Container: Quantity and Amount */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">WAEC Result Checker</h2>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Quantity
                </label>
                <select
                  value={quantity}
                  onChange={handleQuantityChange}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                >
                  <option value={1}>1</option>
                  <option value={2}>2</option>
                  <option value={3}>3</option>
                  <option value={4}>4</option>
                  <option value={5}>5</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Amount
                </label>
                <input
                  type="text"
                  value={`₦${totalAmount.toLocaleString()}`} // Format amount with currency symbol
                  readOnly // Make the input read-only
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm bg-gray-100"
                />
              </div>
              <button className="w-full bg-green-500 text-white p-2 rounded-md hover:bg-green-600 transition-colors">
                Purchase
              </button>
            </div>

            {/* Second Container: View Purchased Cards */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">View Purchased Cards</h2>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-md">
                  <p className="text-sm text-gray-600">
                    Card #1: 1234-5678-9101-1121
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-md">
                  <p className="text-sm text-gray-600">
                    Card #2: 1121-9101-5678-1234
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaecResultChecker;