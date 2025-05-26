import React from 'react';

const Loading = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-75 backdrop-blur-sm z-50">
      <div className="flex flex-col items-center">
        <div className="relative">
          {/* Outer spinner */}
          <div className="w-16 h-16 border-4 border-green-200 border-t-green-500 rounded-full animate-spin"></div>
          {/* Inner spinner */}
          <div className="absolute top-2 left-2 w-12 h-12 border-4 border-green-100 border-t-green-300 rounded-full animate-spin"></div>
        </div>
        <p className="mt-4 text-green-600 font-medium animate-pulse">Loading...</p>
      </div>
    </div>
  );
};

export default Loading;
