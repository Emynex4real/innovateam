import React, { useState } from 'react';

const OLevelUpload = () => {
  const [type, setType] = useState('');
  const [quantity, setQuantity] = useState('');
  const [amount, setAmount] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
  };

  const handleRequery = (id) => {
    // Handle requery action
    console.log(`Requery task with ID: ${id}`);
    alert(`Requery task with ID: ${id}`); // Example: Show an alert for demonstration
  };

  const handleDownload = (filename) => {
    // Handle download action
    console.log(`Download file: ${filename}`);
    alert(`Download file: ${filename}`); // Example: Show an alert for demonstration
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">OLEVEL UPLOAD</h1>

        <div className="flex flex-col md:flex-row gap-6">
          {/* OLevel Upload Form */}
          <div className="flex-1 bg-white p-6 rounded-lg shadow-md">
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select Type</option>
                  <option value="Type1">UTME</option>
                  <option value="Type2">Direct entry</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Quantity</label>
                <select
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select Quantity</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                  <option value="6">6</option>
                  <option value="7">7</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Amount</label>
                <input
                  type="text"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600"
              >
                Proceed
              </button>
            </form>
          </div>

          {/* How It Works Section */}
          <div className="flex-1 bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">HOW IT WORKS</h2>
            <ul className="list-disc list-inside">
              <li>Fill the form with your accurate details and submit</li>
              <li>Click the "Proceed" button to make payment for the service</li>
              <li>Upon successful payment, scroll down for new entry. Click on new entry to submit fresh job.</li>
              <li>Once your Job is done, you will be sent a confirmation email and you will be able to print out your processed job.</li>
            </ul>
          </div>
        </div>

        {/* OLevel Upload History */}
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">OLEVEL UPLOAD HISTORY</h2>
          <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="px-4 py-2">#</th>
                  <th className="px-4 py-2">Action</th>
                  <th className="px-4 py-2">Type</th>
                  <th className="px-4 py-2">Filename</th>
                  <th className="px-4 py-2">Profile Code/KeyNo.</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Screenshot</th>
                  <th className="px-4 py-2">Remark</th>
                  <th className="px-4 py-2">Submitted On</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                      <td className="border px-4 py-2">1</td>
                  <td className="border px-4 py-2">
                    <button
                      onClick={() => handleRequery(1)} // Pass the task ID or relevant data
                      className="bg-yellow-500 text-white p-1 rounded-md hover:bg-yellow-600"
                    >
                      Query
                    </button>
                  </td>
                  <td className="border px-4 py-2">UTME</td>
                  <td className="border px-4 py-2">INNOWNO DIMANUEL</td>
                  <td className="border px-4 py-2">12345</td>
                  <td className="border px-4 py-2 text-green-600">Processed</td>
                  <td className="border px-4 py-2">
                    <button
                      onClick={() => handleDownload('UTME')}
                      className="bg-blue-500 text-white p-1 rounded-md hover:bg-blue-600"
                    >
                      Download
                    </button>
                  </td>
                  <td className="border px-4 py-2">0</td>
                  <td className="border px-4 py-2">2025-03/12 10:22:46</td>
                </tr>
                {/* Add more rows as needed */}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OLevelUpload;