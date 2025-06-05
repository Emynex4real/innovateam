import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { DocumentTextIcon, AcademicCapIcon, ClipboardDocumentListIcon, ArrowPathIcon, XMarkIcon, WalletIcon } from '@heroicons/react/24/outline';
import { useJambTransaction } from '../../../hooks/useJambTransaction';
import { useDarkMode } from '../../../contexts/DarkModeContext';

const OLevelUpload = () => {
  const { isDarkMode } = useDarkMode();
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
    const { status, entryId, profileCode, jambRegNo, fullname } = location.state || {};
    if (status === 'processing') {
      setHistory((prevHistory) =>
        prevHistory.map((item) =>
          item.id === entryId
            ? {
                ...item,
                type: 'UTME',
                fullname: fullname,
                profileCode: profileCode,
                jambRegNo: jambRegNo,
                status: 'Processing',
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
    navigate('/dashboard/olevel-entry', {
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
    <div className={`min-h-screen py-6 font-nunito transition-colors duration-200 ${
      isDarkMode ? 'bg-dark-surface text-dark-text-primary' : 'bg-gray-50'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-4 mb-8">
          <div className={`p-3 ${
            isDarkMode ? 'bg-green-900/30' : 'bg-green-100'
          } rounded-full`}>
            <DocumentTextIcon className={`w-6 h-6 ${
              isDarkMode ? 'text-green-400' : 'text-green-600'
            }`} />
          </div>
          <h1 className={`text-2xl md:text-3xl font-bold ${
            isDarkMode ? 'text-dark-text-primary' : 'text-gray-800'
          }`}>O-Level Upload</h1>
        </div>

        {/* Status Message */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'error' 
              ? 'bg-red-100 text-red-700' 
              : message.type === 'success'
              ? 'bg-green-100 text-green-700'
              : 'bg-blue-100 text-blue-700'
          }`}>
            {message.text}
          </div>
        )}

        {/* Search Input */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="Search by name or profile code..."
              className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
                isDarkMode 
                  ? 'bg-dark-surface border-dark-border text-dark-text-primary placeholder-dark-text-secondary' 
                  : 'bg-white border-gray-200 placeholder-gray-400'
              }`}
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <ClipboardDocumentListIcon className={`w-5 h-5 ${
                isDarkMode ? 'text-dark-text-secondary' : 'text-gray-400'
              }`} />
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
          <div className={`${
            isDarkMode ? 'bg-dark-surface-secondary border-dark-border' : 'bg-white'
          } p-6 rounded-xl shadow-md border`}>
            <div className="flex items-center gap-3 mb-6">
              <AcademicCapIcon className={`w-6 h-6 ${
                isDarkMode ? 'text-green-400' : 'text-green-600'
              }`} />
              <h2 className={`text-lg font-bold ${
                isDarkMode ? 'text-dark-text-primary' : 'text-gray-800'
              }`}>Upload Details</h2>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="type" className={`block text-sm font-semibold mb-1 ${
                  isDarkMode ? 'text-dark-text-primary' : 'text-gray-700'
                }`}>
                  Type
                </label>
                <select
                  id="type"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200 ${
                    isDarkMode 
                      ? 'bg-dark-surface border-dark-border text-dark-text-primary' 
                      : 'bg-gray-50 border-gray-300'
                  }`}
                >
                  <option value="">Select Type</option>
                  <option value="UTME">UTME (₦400 per unit)</option>
                  <option value="Direct entry">Direct Entry (₦500 per unit)</option>
                </select>
              </div>

              <div>
                <label htmlFor="quantity" className={`block text-sm font-semibold mb-1 ${
                  isDarkMode ? 'text-dark-text-primary' : 'text-gray-700'
                }`}>
                  Quantity
                </label>
                <select
                  id="quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200 ${
                    isDarkMode 
                      ? 'bg-dark-surface border-dark-border text-dark-text-primary' 
                      : 'bg-gray-50 border-gray-300'
                  }`}
                >
                  <option value="">Select Quantity</option>
                  {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="amount" className={`block text-sm font-semibold mb-1 ${
                  isDarkMode ? 'text-dark-text-primary' : 'text-gray-700'
                }`}>
                  Total Amount
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="amount"
                    value={type && quantity ? `₦${calculateTotalAmount()}` : ''}
                    readOnly
                    className={`w-full pl-12 pr-4 py-3 border rounded-xl cursor-not-allowed ${
                      isDarkMode 
                        ? 'bg-dark-surface border-dark-border text-dark-text-primary' 
                        : 'bg-gray-100 border-gray-300 text-gray-700'
                    }`}
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <WalletIcon className={`w-5 h-5 ${
                      isDarkMode ? 'text-dark-text-secondary' : 'text-gray-400'
                    }`} />
                  </div>
                </div>
                <p className={`mt-2 text-sm ${
                  isDarkMode ? 'text-dark-text-secondary' : 'text-gray-500'
                }`}>
                  Wallet Balance: <span className={`font-medium ${
                    isDarkMode ? 'text-dark-text-primary' : 'text-gray-700'
                  }`}>₦{walletBalance.toLocaleString()}</span>
                </p>
              </div>

              <button
                type="submit"
                className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                  isDarkMode
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-green-500 hover:bg-green-600 text-white'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <ArrowPathIcon className="w-5 h-5" />
                Proceed
              </button>
            </form>
          </div>

          {/* How It Works Section */}
          <div className={`${
            isDarkMode ? 'bg-dark-surface-secondary border-dark-border' : 'bg-white'
          } p-6 rounded-xl shadow-md border`}>
            <div className="flex items-center gap-3 mb-6">
              <DocumentTextIcon className={`w-6 h-6 ${
                isDarkMode ? 'text-green-400' : 'text-green-600'
              }`} />
              <h2 className={`text-lg font-bold ${
                isDarkMode ? 'text-dark-text-primary' : 'text-gray-800'
              }`}>How It Works</h2>
            </div>
            <ul className={`list-disc list-inside ${
              isDarkMode ? 'text-dark-text-secondary' : 'text-gray-600'
            }`}>
              <li>Fill the form with your accurate details and submit</li>
              <li>Click the "Proceed" button to make payment for the service</li>
              <li>Upon successful payment, scroll down for new entry. Click on new entry to submit fresh job.</li>
              <li>Once your Job is done, you will be sent a confirmation email and you will be able to print out your processed job.</li>
            </ul>
          </div>
        </motion.div>

        {/* O-Level Upload History */}
        <div className="mt-8">
          <h2 className={`text-xl font-bold mb-4 ${
            isDarkMode ? 'text-dark-text-primary' : 'text-gray-800'
          }`}>O-LEVEL UPLOAD HISTORY</h2>
          <div className={`${
            isDarkMode ? 'bg-dark-surface-secondary border-dark-border' : 'bg-white'
          } p-6 rounded-lg shadow-md overflow-x-auto border`}>
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className={`px-4 py-2 ${
                    isDarkMode ? 'text-dark-text-primary' : 'text-gray-800'
                  }`}>Action</th>
                  <th className={`px-4 py-2 ${
                    isDarkMode ? 'text-dark-text-primary' : 'text-gray-800'
                  }`}>Type</th>
                  <th className={`px-4 py-2 ${
                    isDarkMode ? 'text-dark-text-primary' : 'text-gray-800'
                  }`}>Fullname</th>
                  <th className={`px-4 py-2 ${
                    isDarkMode ? 'text-dark-text-primary' : 'text-gray-800'
                  }`}>Profile Code/RegNo.</th>
                  <th className={`px-4 py-2 ${
                    isDarkMode ? 'text-dark-text-primary' : 'text-gray-800'
                  }`}>Status</th>
                  <th className={`px-4 py-2 ${
                    isDarkMode ? 'text-dark-text-primary' : 'text-gray-800'
                  }`}>Screenshot</th>
                  <th className={`px-4 py-2 ${
                    isDarkMode ? 'text-dark-text-primary' : 'text-gray-800'
                  }`}>Remark</th>
                  <th className={`px-4 py-2 ${
                    isDarkMode ? 'text-dark-text-primary' : 'text-gray-800'
                  }`}>Submitted On</th>
                </tr>
              </thead>
              <tbody>
                {history.length === 0 ? (
                  <tr>
                    <td colSpan="8" className={`text-center py-4 ${
                      isDarkMode ? 'text-dark-text-secondary' : 'text-gray-500'
                    }`}>No Record Found!</td>
                  </tr>
                ) : (
                  history.map((entry) => (
                    <tr key={entry.id} className={`${
                      isDarkMode ? 'border-dark-border hover:bg-dark-surface/50' : 'border-gray-100 hover:bg-gray-50'
                    } border-b transition-colors duration-200`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {entry.status === 'Waiting' && (
                            <button
                              onClick={() => handleNewEntry(entry.id)}
                              className={`px-3 py-1 text-xs rounded-full font-medium ${
                                isDarkMode
                                  ? 'bg-green-900/30 text-green-400 hover:bg-green-800/40'
                                  : 'bg-green-100 text-green-700 hover:bg-green-200'
                              } transition-colors duration-200`}
                            >
                              New Entry
                            </button>
                          )}
                          <button
                            onClick={() => handleRequery(entry.id)}
                            className={`px-3 py-1 text-xs rounded-full font-medium ${
                              isDarkMode
                                ? 'bg-blue-900/30 text-blue-400 hover:bg-blue-800/40'
                                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                            } transition-colors duration-200`}
                          >
                            Query
                          </button>
                        </div>
                      </td>
                      <td className={`px-4 py-3 ${
                        isDarkMode ? 'text-dark-text-primary' : 'text-gray-800'
                      }`}>{entry.type}</td>
                      <td className={`px-4 py-3 ${
                        isDarkMode ? 'text-dark-text-primary' : 'text-gray-800'
                      }`}>{entry.fullname}</td>
                      <td className={`px-4 py-3 ${
                        isDarkMode ? 'text-dark-text-primary' : 'text-gray-800'
                      }`}>{entry.profileCode}</td>
                      <td className={`px-4 py-3`}>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          entry.status === 'Waiting'
                            ? isDarkMode
                              ? 'bg-yellow-900/30 text-yellow-400'
                              : 'bg-yellow-100 text-yellow-700'
                            : entry.status === 'Completed'
                              ? isDarkMode
                                ? 'bg-green-900/30 text-green-400'
                                : 'bg-green-100 text-green-700'
                              : isDarkMode
                                ? 'bg-red-900/30 text-red-400'
                                : 'bg-red-100 text-red-700'
                        }`}>
                          {entry.status}
                        </span>
                      </td>
                      <td className={`px-4 py-3 ${
                        isDarkMode ? 'text-dark-text-primary' : 'text-gray-800'
                      }`}>
                        {entry.status === 'Completed' ? (
                          <button
                            onClick={() => handleDownload(`screenshot_${entry.id}.pdf`)}
                            className={`text-xs underline ${
                              isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
                            }`}
                          >
                            Download
                          </button>
                        ) : (
                          'N/A'
                        )}
                      </td>
                      <td className={`px-4 py-3 ${
                        isDarkMode ? 'text-dark-text-primary' : 'text-gray-800'
                      }`}>{entry.remark}</td>
                      <td className={`px-4 py-3 ${
                        isDarkMode ? 'text-dark-text-primary' : 'text-gray-800'
                      }`}>{entry.submittedOn}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Query Popup */}
        <AnimatePresence>
          {showQueryPopup && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`fixed inset-0 ${
                isDarkMode ? 'bg-black/40' : 'bg-black/20'
              } backdrop-blur-sm z-50 flex items-center justify-center p-4`}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className={`${
                  isDarkMode 
                    ? 'bg-gray-800 border border-gray-700' 
                    : 'bg-white'
                } p-6 rounded-xl shadow-xl max-w-md w-full relative`}
              >
                <button
                  onClick={handleQueryCancel}
                  className={`absolute top-4 right-4 ${
                    isDarkMode 
                      ? 'text-gray-500 hover:text-gray-400' 
                      : 'text-gray-400 hover:text-gray-600'
                  } transition-colors`}
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
                <h2 className={`text-lg font-semibold mb-4 ${
                  isDarkMode ? 'text-gray-100' : 'text-gray-900'
                }`}>Query</h2>
                <p className={`text-sm mb-4 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  <strong>Notice:</strong> A 500 Naira fee may be deducted if the error is not ours.
                </p>
                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>Type</label>
                    <p className={`mt-1 p-2 rounded-lg ${
                      isDarkMode 
                        ? 'bg-gray-700 text-gray-300' 
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      {history.find((item) => item.id === selectedQueryId)?.type || 'UTME'}
                    </p>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>Full Name</label>
                    <p className={`mt-1 p-2 rounded-lg ${
                      isDarkMode 
                        ? 'bg-gray-700 text-gray-300' 
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      {history.find((item) => item.id === selectedQueryId)?.fullname || 'Not set'}
                    </p>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>Profile Code</label>
                    <p className={`mt-1 p-2 rounded-lg ${
                      isDarkMode 
                        ? 'bg-gray-700 text-gray-300' 
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      {history.find((item) => item.id === selectedQueryId)?.profileCode || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>Complaint</label>
                    <textarea
                      value={complaint}
                      onChange={(e) => setComplaint(e.target.value)}
                      placeholder="Enter your complaint..."
                      className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-500 focus:ring-primary-color/30 focus:border-primary-color' 
                          : 'border-gray-300 focus:ring-primary-color focus:border-primary-color'
                      }`}
                      rows={4}
                    />
                  </div>
                </div>
                <div className="mt-6 flex gap-4">
                  <button
                    onClick={handleQueryCancel}
                    className={`flex-1 px-6 py-3 border-2 rounded-xl font-semibold transition-all duration-300 ${
                      isDarkMode
                        ? 'border-gray-700 text-gray-300 hover:bg-gray-700'
                        : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleQueryProceed}
                    className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
                      isDarkMode
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white'
                    }`}
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