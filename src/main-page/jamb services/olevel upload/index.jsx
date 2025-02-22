import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const OLevelUpload = () => {
  const [type, setType] = useState('');
  const [quantity, setQuantity] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [history, setHistory] = useState([
    {
      id: 1,
      type: 'UTME',
      fullname: 'Not set',
      profileCode: `PROF-${Math.floor(10000 + Math.random() * 90000)}`,
      status: 'Waiting',
      remark: '0',
      submittedOn: new Date().toLocaleString(),
    },
  ]);
  const [showQueryPopup, setShowQueryPopup] = useState(false);
  const [selectedQueryId, setSelectedQueryId] = useState(null);
  const [complaint, setComplaint] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const baseFees = { UTME: 400, 'Direct entry': 500 };

  // Update history from child component
  useEffect(() => {
    const { updatedEntry } = location.state || {};
    if (updatedEntry) {
      setHistory((prevHistory) =>
        prevHistory.map((item) =>
          item.id === updatedEntry.id
            ? {
                ...item,
                type: updatedEntry.type,
                fullname: updatedEntry.fullname,
                profileCode: updatedEntry.profileCode,
                status: updatedEntry.status,
                submittedOn: new Date().toLocaleString(),
              }
            : item
        )
      );
      // Clear the location state to prevent re-triggering
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, navigate, location.pathname]);

  const calculateTotalAmount = () => {
    if (!type || !quantity) return 0;
    return baseFees[type] * parseInt(quantity);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });

    if (!type) {
      setMessage({ text: 'Please select a type.', type: 'error' });
      return;
    }
    if (!quantity || parseInt(quantity) < 1) {
      setMessage({ text: 'Please select a valid quantity.', type: 'error' });
      return;
    }

    const qty = parseInt(quantity);
    const newEntries = Array.from({ length: qty }, (_, index) => ({
      id: history.length + 1 + index,
      type,
      fullname: 'Not set',
      profileCode: `PROF-${Math.floor(10000 + Math.random() * 90000)}`,
      status: 'Waiting',
      remark: '0',
      submittedOn: new Date().toLocaleString(),
    }));

    setHistory([...newEntries, ...history]);
    setMessage({ text: `Added ${qty} new entries. Click 'New Entry' to proceed.`, type: 'success' });
    setType('');
    setQuantity('');
  };

  const handleNewEntry = (id) => {
    const entry = history.find((item) => item.id === id);
    navigate('/homepage/olevel-entry', {
      state: {
        id,
        type: entry.type,
        quantity: 1,
        amount: `₦${baseFees[entry.type]}`,
        fullname: entry.fullname,
      },
    });
  };

  const handleRequery = (id) => {
    setSelectedQueryId(id);
    setShowQueryPopup(true);
  };

  const handleDownload = (filename) => {
    console.log(`Download file: ${filename}`);
    setMessage({ text: `Downloading file: ${filename}`, type: 'success' });
  };

  const handleQueryProceed = () => {
    if (!complaint.trim()) {
      setMessage({ text: 'Please enter your complaint.', type: 'error' });
      return;
    }
    console.log(`Query for task ID: ${selectedQueryId}, Complaint: ${complaint}`);
    setMessage({ text: `Query submitted for task ID: ${selectedQueryId}`, type: 'info' });
    setShowQueryPopup(false);
    setComplaint('');
  };

  const handleQueryCancel = () => {
    setShowQueryPopup(false);
    setComplaint('');
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8 font-nunito">
      <div className="container mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-text-color mb-8">O-Level Upload</h1>

        <div className="mb-6">
          <input
            type="text"
            placeholder="Search..."
            className="w-full md:w-96 p-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-color transition-all duration-200"
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          {/* OLevel Upload Form */}
          <div className="bg-white p-8 rounded-xl shadow-md">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="type" className="block text-sm font-semibold text-gray-700 mb-2">
                  Type
                </label>
                <select
                  id="type"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-color transition-all duration-200"
                >
                  <option value="">Select Type</option>
                  <option value="UTME">UTME (₦400 per unit)</option>
                  <option value="Direct entry">Direct Entry (₦500 per unit)</option>
                </select>
              </div>

              <div>
                <label htmlFor="quantity" className="block text-sm font-semibold text-gray-700 mb-2">
                  Quantity
                </label>
                <select
                  id="quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-color transition-all duration-200"
                >
                  <option value="">Select Quantity</option>
                  {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="amount" className="block text-sm font-semibold text-gray-700 mb-2">
                  Total Amount
                </label>
                <input
                  type="text"
                  id="amount"
                  value={type && quantity ? `₦${calculateTotalAmount()}` : ''}
                  readOnly
                  className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed"
                />
              </div>

              {message.text && (
                <div
                  className={`p-3 rounded-lg text-sm font-medium ${
                    message.type === 'success'
                      ? 'bg-green-100 text-green-700'
                      : message.type === 'info'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-red-100 text-red-700'
                  }`}
                >
                  {message.text}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-primary-color text-white py-3 rounded-md font-semibold hover:bg-green-600 transition-all duration-200"
              >
                Proceed
              </button>
            </form>
          </div>

          {/* How It Works */}
          <div className="bg-white p-8 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold text-text-color mb-6">How It Works</h2>
            <ul className="list-disc list-inside space-y-4 text-gray-600 text-sm">
              <li>Fill the form with accurate details and submit.</li>
              <li>Click "Proceed" to add new entries to the history.</li>
              <li>Click "New Entry" to input O-Level results (min 8, max 9 subjects).</li>
              <li>Make payment after submission.</li>
              <li>Download your result or requery once processed.</li>
            </ul>
          </div>
        </motion.div>

        {/* History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-12"
        >
          <h2 className="text-xl md:text-2xl font-semibold text-text-color mb-6">O-Level Upload History</h2>
          <div className="bg-white p-8 rounded-xl shadow-md overflow-x-auto">
            {history.length === 0 ? (
              <p className="text-gray-500 text-center py-6">No upload history yet.</p>
            ) : (
              <table className="min-w-full bg-white">
                <thead className="bg-gray-100 text-gray-700">
                  <tr>
                    <th className="py-4 px-6 text-left text-sm font-semibold">#</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold">Action</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold">Type</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold">Full Name</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold">Profile Code</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold">Status</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold">Screenshot</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold">Remark</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold">Submitted On</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((item) => (
                    <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50 transition-all duration-200">
                      <td className="py-4 px-6 text-gray-700">{item.id}</td>
                      <td className="py-4 px-6">
                        {item.status === 'Waiting' ? (
                          <button
                            onClick={() => handleNewEntry(item.id)}
                            className="bg-yellow-500 text-white py-2 px-4 rounded-md hover:bg-yellow-600 transition-all duration-200 text-sm"
                          >
                            New Entry
                          </button>
                        ) : (
                          <button
                            onClick={() => handleRequery(item.id)}
                            className="bg-yellow-500 text-white py-2 px-4 rounded-md hover:bg-yellow-600 transition-all duration-200 text-sm"
                          >
                            Query
                          </button>
                        )}
                      </td>
                      <td className="py-4 px-6 text-gray-700">{item.type}</td>
                      <td className="py-4 px-6 text-gray-700">{item.fullname}</td>
                      <td className="py-4 px-6 text-gray-700">{item.profileCode}</td>
                      <td className="py-4 px-6">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            item.status === 'Processed'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-orange-100 text-orange-700'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <button
                          onClick={() => handleDownload(item.fullname || item.type)}
                          className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-all duration-200 text-sm"
                          disabled={item.status !== 'Processed'}
                        >
                          Download
                        </button>
                      </td>
                      <td className="py-4 px-6 text-gray-700">{item.remark}</td>
                      <td className="py-4 px-6 text-gray-700">{item.submittedOn}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </motion.div>

        {/* Query Popup */}
        {showQueryPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full"
            >
              <h2 className="text-xl font-semibold text-text-color mb-6">Query</h2>
              <p className="text-sm text-gray-600 mb-6">
                <strong>Notice:</strong> A 500 Naira fee may be deducted if the error is not ours.
              </p>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type</label>
                  <p className="mt-1 p-2 bg-gray-100 rounded-lg">{history.find((item) => item.id === selectedQueryId)?.type || 'UTME'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <p className="mt-1 p-2 bg-gray-100 rounded-lg">{history.find((item) => item.id === selectedQueryId)?.fullname || 'Not set'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Profile Code</label>
                  <p className="mt-1 p-2 bg-gray-100 rounded-lg">{history.find((item) => item.id === selectedQueryId)?.profileCode || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Complaint</label>
                  <textarea
                    value={complaint}
                    onChange={(e) => setComplaint(e.target.value)}
                    placeholder="Enter your complaint..."
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-color transition-all duration-200"
                    rows={4}
                  />
                </div>
              </div>
              <div className="mt-8 flex justify-end gap-4">
                <button
                  onClick={handleQueryCancel}
                  className="bg-gray-500 text-white py-2 px-6 rounded-md hover:bg-gray-600 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleQueryProceed}
                  className="bg-primary-color text-white py-2 px-6 rounded-md hover:bg-green-600 transition-all duration-200"
                >
                  Proceed
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default OLevelUpload;