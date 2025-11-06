import React from 'react';

const Loading = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-b from-white to-gray-50 backdrop-blur-sm z-50">
      <div className="relative p-8 rounded-2xl bg-white/80 shadow-xl backdrop-blur-sm">
        {/* Main spinner */}
        <div className="w-20 h-20 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin-slow">
          {/* Inner spinner */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 border-4 border-primary-100 border-t-primary-400 rounded-full animate-spin"></div>
          {/* Center dot */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-primary-500 rounded-full animate-pulse-slow"></div>
        </div>
        
        {/* Loading text */}
        <div className="mt-6 text-center">
          <span className="text-primary-600 text-lg font-medium tracking-wide animate-pulse-slow">Loading</span>
          <span className="inline-flex ml-1">
            <span className="animate-bounce-delay delay-75 text-primary-600">.</span>
            <span className="animate-bounce-delay delay-150 text-primary-600">.</span>
            <span className="animate-bounce-delay delay-300 text-primary-600">.</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default Loading;
