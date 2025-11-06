import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDarkMode } from '../../contexts/DarkModeContext';

const BuyOLevelUpload = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDarkMode } = useDarkMode();
  const [history, setHistory] = useState([]);

  // Update history from child component
  useEffect(() => {
    const { status, entryId, profileCode, jambRegNo, fullname, type, quantity, amount } = location.state || {};
    if (status === 'processing') {
      // Add new entry to history if it doesn't exist
      setHistory((prevHistory) => {
        const entryExists = prevHistory.some(item => item.id === entryId);
        if (!entryExists) {
          return [{
            id: entryId,
            type: type || 'UTME',
            fullname: fullname,
            profileCode: profileCode,
            jambRegNo: jambRegNo,
            status: 'Processing',
            quantity: quantity || 1,
            amount: amount || '₦400',
            submittedOn: new Date().toLocaleString(),
          }, ...prevHistory];
        }
        return prevHistory;
      });
      // Clear the location state to prevent re-triggering
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, navigate, location.pathname]);

  return (
    <div className={`min-h-screen py-6 font-nunito transition-colors duration-200 ${
      isDarkMode ? 'bg-dark-surface text-dark-text-primary' : 'bg-gray-50'
    }`}>
      <div className="container mx-auto px-4">
        {/* ... other JSX ... */}

        {/* History List */}
        <div className="mt-8">
          <h2 className={`text-xl font-bold mb-4 ${
            isDarkMode ? 'text-dark-text-primary' : 'text-gray-800'
          }`}>Recent Entries</h2>
          <div className="space-y-4">
            {history.map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-lg border ${
                  isDarkMode 
                    ? 'bg-dark-surface-secondary border-dark-border' 
                    : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className={`font-semibold ${
                      isDarkMode ? 'text-dark-text-primary' : 'text-gray-800'
                    }`}>{item.fullname}</h3>
                    <p className={`text-sm ${
                      isDarkMode ? 'text-dark-text-secondary' : 'text-gray-600'
                    }`}>
                      Profile Code: {item.profileCode}
                    </p>
                    <p className={`text-sm ${
                      isDarkMode ? 'text-dark-text-secondary' : 'text-gray-600'
                    }`}>
                      JAMB Reg: {item.jambRegNo}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${
                      item.status === 'Processing' 
                        ? 'text-yellow-600' 
                        : item.status === 'Completed'
                        ? 'text-green-600'
                        : 'text-gray-600'
                    }`}>
                      {item.status}
                    </p>
                    <p className={`text-sm ${
                      isDarkMode ? 'text-dark-text-secondary' : 'text-gray-600'
                    }`}>
                      {item.submittedOn}
                    </p>
                  </div>
                </div>
                {item.status === 'Processing' ? (
                  <div className="mt-4 flex justify-end">
                    <button
                      className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg text-sm font-medium"
                      disabled
                    >
                      Processing...
                    </button>
                  </div>
                ) : (
                  <div className="mt-4 flex justify-end space-x-2">
                    <button
                      onClick={() => handleNewEntry(item.id)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium ${
                        isDarkMode
                          ? 'bg-green-900/30 text-green-400 hover:bg-green-900/40'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      New Entry
                    </button>
                    <button
                      onClick={() => handleRequery(item.id)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium ${
                        isDarkMode
                          ? 'bg-blue-900/30 text-blue-400 hover:bg-blue-900/40'
                          : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      }`}
                    >
                      Requery
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyOLevelUpload; 