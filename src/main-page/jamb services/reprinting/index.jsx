import React, { useState } from 'react';

const CapsPrinting = () => {
  const [type, setType] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [amount, setAmount] = useState(0); // Default amount is 0 until a type is selected

  const handleTypeChange = (e) => {
    const selectedType = e.target.value;
    setType(selectedType);
    // Update amount based on the selected type and quantity
    const price = getPriceForType(selectedType);
    setAmount(quantity * price);
  };

  const handleQuantityChange = (e) => {
    const newQuantity = parseInt(e.target.value, 10);
    setQuantity(newQuantity);
    // Update amount based on the selected type and new quantity
    const price = getPriceForType(type);
    setAmount(newQuantity * price);
  };

  const getPriceForType = (type) => {
    switch (type) {
      case "CHANGE_OF_COURSE_SLIP":
      case "REGISTRATION_SLIP":
      case "CAPS_LINK_URL":
      case "RESULTS_REPRINTS_ONLY":
      case "D_E_REGISTRATION_SLIP":
      case "ADMISSION_STATUS_ONLY":
      case "RETRIEVE_PROFILE_CODE":
        return 300;
      case "ACCEPT_ADMISSION_PICS_NOTIFICATION":
        return 400;
      case "CHANGE_OF_COURSE_REFRESH":
        return 200;
      default:
        return 0;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log({ type, quantity, amount });
    alert(`Form submitted with Type: ${type}, Quantity: ${quantity}, Amount: ${amount}`);
  };

  return (
    <div className="">
      <div className="">
        <h1 className="text-2xl font-bold mb-6">CAPS PRINTING</h1>

        <div className="flex flex-col md:flex-row gap-6">
          {/* CAPS Printing Form */}
          <div className="flex-1 bg-white p-6 rounded-lg shadow-md">
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <select
                  value={type}
                  onChange={handleTypeChange}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select Type</option>
                  <option value="CHANGE_OF_COURSE_SLIP">Change of Course Slip (₦300)</option>
                  <option value="REGISTRATION_SLIP">Registration Slip (₦300)</option>
                  <option value="CAPS_LINK_URL">CAPS Link URL (₦300)</option>
                  <option value="RESULTS_REPRINTS_ONLY">Results Reprints Only (₦300)</option>
                  <option value="ACCEPT_ADMISSION_PICS_NOTIFICATION">Accept Admission & Pics Notification (₦400)</option>
                  <option value="CHANGE_OF_COURSE_REFRESH">Change of Course Refresh (₦200)</option>
                  <option value="D_E_REGISTRATION_SLIP">D.E Registration Slip (₦300)</option>
                  <option value="ADMISSION_STATUS_ONLY">Admission Status Only (₦300)</option>
                  <option value="RETRIEVE_PROFILE_CODE">Retrieve Profile Code (₦300)</option>
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

        {/* CAPS Printing History */}
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">CAPS PRINTING HISTORY</h2>
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

export default CapsPrinting;