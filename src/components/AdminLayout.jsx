import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAdmin } from '../contexts/AdminContext';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const AdminLayout = () => {
  const { isAdmin } = useAdmin();
  const { user } = useAuth();

  // if (!user) {
  //   return <Navigate to="/login" replace />;
  // }

  // if (!isAdmin) {
  //   return <Navigate to="/" replace />;
  // }

  return (
    <div>
      <div className="mb-2 p-2 bg-yellow-100 text-xs rounded">
        <b>DEBUG:</b> user: {user ? JSON.stringify(user) : 'null'} | isAdmin: {String(isAdmin)}
      </div>
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Navbar />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
            <div className="container mx-auto px-6 py-8">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout; 