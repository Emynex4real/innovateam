import React from 'react';

const Spinner = ({ size = 32, className = '' }) => (
  <div className={`flex items-center justify-center ${className}`} aria-label="Loading">
    <svg className="animate-spin" width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle
        className="opacity-25"
        cx="12" cy="12" r="10"
        stroke="currentColor" strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  </div>
);

export default Spinner; 