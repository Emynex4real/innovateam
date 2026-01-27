import React, { useState, useEffect } from 'react';
import requestManager from '../utils/requestManager';

const RequestDebugPanel = () => {
  const [stats, setStats] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      setStats(requestManager.getStats());
    }, 1000);

    return () => clearInterval(interval);
  }, [isVisible]);

  // Only show in development
  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <>
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed bottom-4 right-4 z-50 bg-purple-600 text-white px-3 py-2 rounded-lg shadow-lg text-xs font-mono hover:bg-purple-700 transition-colors"
        title="Toggle Request Debug Panel"
      >
        {isVisible ? '📊 Hide' : '📊 Debug'}
      </button>

      {isVisible && stats && (
        <div className="fixed bottom-16 right-4 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-4 text-xs font-mono max-w-xs">
          <div className="font-bold mb-2 text-gray-900 dark:text-white">Request Manager Stats</div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Pending:</span>
              <span className={`font-bold ${stats.pendingRequests > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                {stats.pendingRequests}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Cached:</span>
              <span className="font-bold text-blue-600">{stats.cachedItems}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Circuit:</span>
              <span className={`font-bold ${stats.circuitBreaker.isOpen ? 'text-red-600' : 'text-green-600'}`}>
                {stats.circuitBreaker.isOpen ? 'OPEN' : 'CLOSED'}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Failures:</span>
              <span className={`font-bold ${stats.circuitBreaker.failures > 0 ? 'text-red-600' : 'text-gray-600'}`}>
                {stats.circuitBreaker.failures}
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              requestManager.clearCache();
              console.log('🗑️ Cache cleared manually');
            }}
            className="mt-3 w-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-1 rounded hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
          >
            Clear Cache
          </button>
        </div>
      )}
    </>
  );
};

export default RequestDebugPanel;
