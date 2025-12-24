// File: src/components/forums/Skeleton.jsx
import React from 'react';

export const ForumSkeleton = () => (
  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 animate-pulse mb-4">
    {/* Header Icon + Title placeholder */}
    <div className="flex justify-between mb-4">
      <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
      <div className="w-6 h-6 bg-gray-200 rounded"></div>
    </div>
    
    {/* Title Line */}
    <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
    
    {/* Description Lines */}
    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
    <div className="h-4 bg-gray-200 rounded w-2/3 mb-6"></div>
    
    {/* Footer Stats */}
    <div className="flex justify-between pt-4 border-t border-gray-100">
       <div className="w-20 h-4 bg-gray-200 rounded"></div>
       <div className="w-20 h-4 bg-gray-200 rounded"></div>
    </div>
  </div>
);