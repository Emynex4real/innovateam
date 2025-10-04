import React from 'react';
import { Outlet } from 'react-router-dom';

const SimpleAdminLayout = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-800">Admin Panel</h1>
            </div>
          </div>
        </div>
      </div>
      <div className="p-6">
        <Outlet />
      </div>
    </div>
  );
};

export default SimpleAdminLayout;