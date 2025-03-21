import React, { useState } from 'react';

const AdmissionLetter = () => {
  const [type, setType] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [amount, setAmount] = useState(1500); // Default amount for one admission letter

  const handleQuantityChange = (e) => {
    const newQuantity = parseInt(e.target.value, 10);
    setQuantity(newQuantity);
    setAmount(newQuantity * 1500); // Update amount based on quantity
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log({ type, quantity, amount });
    alert(`Form submitted with Quantity: ${quantity}, Amount: ${amount}`);
  };

  return (
    <div className="">
      <div className="">
        <h1 className="text-2xl font-bold mb-6">ADMISSION LETTER</h1>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Admission Letter Form */}
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
                  <option value="Undergraduate">ADMISSION LETTER (₦1500)</option>
                  {/* <option value="Postgraduate">Postgraduate</option> */}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Quantity</label>
                <select
                  value={quantity}
                  onChange={handleQuantityChange}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Amount</label>
                <input
                  type="text"
                  value={`₦${amount}`}
                  readOnly
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-gray-100"
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
              <li>Click the “Proceed” button to make payment for the service</li>
              <li>Upon successful payment, scroll down for new entry. Click on new entry to submit fresh job.</li>
              <li>Once your Job is done, you will be sent a confirmation email and you will be able to print out your processed job.</li>
            </ul>
          </div>
        </div>

        {/* Admission Letter History */}
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">ADMISSION LETTER HISTORY</h2>
          <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="px-4 py-2">Action</th>
                  <th className="px-4 py-2">Type</th>
                  <th className="px-4 py-2">Fullname</th>
                  <th className="px-4 py-2">Profile Code/RegNo.</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Screenshot</th>
                  <th className="px-4 py-2">Remark</th>
                  <th className="px-4 py-2">Submitted On</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan="8" className="text-center py-4">No Record Found!</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdmissionLetter;