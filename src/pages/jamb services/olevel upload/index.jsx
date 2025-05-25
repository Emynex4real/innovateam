import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { DocumentTextIcon, AcademicCapIcon, ClipboardDocumentListIcon, ArrowPathIcon, XMarkIcon, WalletIcon } from '@heroicons/react/24/outline';
import { useJambTransaction } from '../../../hooks/useJambTransaction';

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

  const { processJambTransaction, walletBalance } = useJambTransaction();

  const handleSubmit = async (e) => {
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
    const totalAmount = calculateTotalAmount();

    // Process payment
    const result = await processJambTransaction({
      amount: totalAmount,
      serviceType: 'O-Level Upload',
      description: `${type} O-Level Upload`,
      quantity: qty,
    });

    if (!result.success) {
      setMessage({ text: result.error, type: 'error' });
      return;
    }

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
    <div className="bg-gray-50 min-h-screen py-6 font-nunito">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-green-100 rounded-full">
            <DocumentTextIcon className="w-6 h-6 text-green-600" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">O-Level Upload</h1>
        </div>

        {/* Search Input */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="Search by name or profile code..."
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <ClipboardDocumentListIcon className="w-5 h-5 text-gray-400" />
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* OLevel Upload Form */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex items-center gap-3 mb-6">
              <AcademicCapIcon className="w-6 h-6 text-green-600" />
              <h2 className="text-lg font-bold text-gray-800">Upload Details</h2>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="type" className="block text-sm font-semibold text-gray-700 mb-1">
                  Type
                </label>
                <select
                  id="type"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-color transition-all duration-200"
                >
                  <option value="">Select Type</option>
                  <option value="UTME">UTME (₦400 per unit)</option>
                  <option value="Direct entry">Direct Entry (₦500 per unit)</option>
                </select>
              </div>

              <div>
                <label htmlFor="quantity" className="block text-sm font-semibold text-gray-700 mb-1">
                  Quantity
                </label>
                <select
                  id="quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-color transition-all duration-200"
                >
                  <option value="">Select Quantity</option>
                  {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="amount" className="block text-sm font-semibold text-gray-700 mb-1">
                  Total Amount
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="amount"
                    value={type && quantity ? `₦${calculateTotalAmount()}` : ''}
                    readOnly
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl bg-gray-100 text-gray-700 cursor-not-allowed"
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <WalletIcon className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Wallet Balance: <span className="font-medium text-gray-700">₦{walletBalance.toLocaleString()}</span>
                </p>
              </div>

              {message.text && (
                <div
                  className={`p-2 rounded-lg text-sm font-medium ${
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
                className="w-full bg-gradient-to-r from-green-600 to-green-500 text-white py-3 px-6 rounded-xl font-semibold
                  hover:from-green-700 hover:to-green-600 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <ArrowPathIcon className="w-5 h-5" />
                Proceed
              </button>
            </form>
          </div>

          {/* How It Works */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex items-center gap-3 mb-6">
              <DocumentTextIcon className="w-6 h-6 text-green-600" />
              <h2 className="text-lg font-bold text-gray-800">How It Works</h2>
            </div>
            <ul className="list-disc list-inside space-y-2 text-gray-600 text-sm">
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
          className="mt-8"
        >
          <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-4">O-Level Upload History</h2>
          <div className="bg-white p-6 rounded-xl shadow-md overflow-x-auto">
            {history.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No upload history yet.</p>
            ) : (
              <table className="min-w-full bg-white">
                <thead className="bg-gray-100 text-gray-700">
                  <tr>
                    <th className="py-2 px-4 text-left text-sm font-semibold">#</th>
                    <th className="py-2 px-4 text-left text-sm font-semibold">Action</th>
                    <th className="py-2 px-4 text-left text-sm font-semibold">Type</th>
                    <th className="py-2 px-4 text-left text-sm font-semibold">Full Name</th>
                    <th className="py-2 px-4 text-left text-sm font-semibold">Profile Code</th>
                    <th className="py-2 px-4 text-left text-sm font-semibold">Status</th>
                    <th className="py-2 px-4 text-left text-sm font-semibold">Screenshot</th>
                    <th className="py-2 px-4 text-left text-sm font-semibold">Remark</th>
                    <th className="py-2 px-4 text-left text-sm font-semibold">Submitted On</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((item) => (
                    <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50 transition-all duration-200">
                      <td className="py-2 px-4 text-gray-700">{item.id}</td>
                      <td className="py-2 px-4">
                        {item.status === 'Waiting' ? (
                          <button
                            onClick={() => handleNewEntry(item.id)}
                            className="bg-yellow-500 text-white py-1 px-3 rounded-md hover:bg-yellow-600 transition-all duration-200 text-sm"
                          >
                            New Entry
                          </button>
                        ) : (
                          <button
                            onClick={() => handleRequery(item.id)}
                            className="bg-yellow-500 text-white py-1 px-3 rounded-md hover:bg-yellow-600 transition-all duration-200 text-sm"
                          >
                            Query
                          </button>
                        )}
                      </td>
                      <td className="py-2 px-4 text-gray-700">{item.type}</td>
                      <td className="py-2 px-4 text-gray-700">{item.fullname}</td>
                      <td className="py-2 px-4 text-gray-700">{item.profileCode}</td>
                      <td className="py-2 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            item.status === 'Processed'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-orange-100 text-orange-700'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="py-2 px-4">
                        <button
                          onClick={() => handleDownload(item.fullname || item.type)}
                          className="bg-blue-500 text-white py-1 px-3 rounded-md hover:bg-blue-600 transition-all duration-200 text-sm"
                          disabled={item.status !== 'Processed'}
                        >
                          Download
                        </button>
                      </td>
                      <td className="py-2 px-4 text-gray-700">{item.remark}</td>
                      <td className="py-2 px-4 text-gray-700">{item.submittedOn}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </motion.div>

        {/* Query Popup */}
        <AnimatePresence>
          {showQueryPopup && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white p-6 rounded-xl shadow-xl max-w-md w-full relative"
              >
                <button
                  onClick={handleQueryCancel}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
                <h2 className="text-lg font-semibold text-text-color mb-4">Query</h2>
                <p className="text-sm text-gray-600 mb-4">
                  <strong>Notice:</strong> A 500 Naira fee may be deducted if the error is not ours.
                </p>
                <div className="space-y-4">
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
                <div className="mt-6 flex gap-4">
                  <button
                    onClick={handleQueryCancel}
                    className="flex-1 px-6 py-3 border-2 border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-all duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleQueryProceed}
                    className="flex-1 bg-gradient-to-r from-green-600 to-green-500 text-white py-3 px-6 rounded-xl font-semibold
                      hover:from-green-700 hover:to-green-600 transition-all duration-300"
                  >
                    Submit Query
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default OLevelUpload;