import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAdmin } from '../contexts/AdminContext';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

// Debug logging helper
const debugLayout = (message, data = {}) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[AdminLayout] ${message}`, {
      timestamp: new Date().toISOString(),
      ...data
    });
  }
};

const AdminLayout = () => {
  const { isAdmin, isLoading, isAdminResolved } = useAdmin();
  const { user, isAuthenticated, isAuthResolved } = useAuth();
  const location = useLocation();

  // Log initial render and auth state changes
  useEffect(() => {
    debugLayout('Mounted/Updated', {
      path: location.pathname,
      isAuthenticated,
      user: user ? { id: user.id, email: user.email, role: user.role, isAdmin: user.isAdmin } : null,
      isAdmin,
      isLoading,
      isAuthResolved,
      isAdminResolved,
      timestamp: new Date().toISOString()
    });
  }, [isAuthenticated, user, isAdmin, isLoading, isAuthResolved, isAdminResolved, location.pathname]);

  // Show loading state while checking auth or admin context
  if (!isAuthResolved || !isAdminResolved) {
    debugLayout('Rendering loading state');
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-700">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  // Only redirect to login if auth is fully resolved and user is NOT authenticated
  if (isAuthResolved && !isAuthenticated) {
    debugLayout('Redirecting to login', { from: location.pathname });
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Show access denied message instead of redirecting
  if (!isAdmin) {
    debugLayout('Access denied - not an admin', { 
      userId: user?.id,
      userRole: user?.role,
      isAdmin,
      userEmail: user?.email
    });
    
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-red-500 text-6xl mb-4">
            <i className="fas fa-exclamation-circle"></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">
            You don't have permission to access the admin dashboard.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Your role: <span className="font-medium">{user?.role || 'user'}</span><br />
            Required role: <span className="font-medium">admin</span>
          </p>
          <a
            href="/"
            className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            Go to Homepage
          </a>
          
          {/* Debug info for development */}
          {process.env.NODE_ENV !== 'production' && (
            <div className="mt-8 p-4 bg-gray-100 rounded-lg text-left text-sm">
              <h4 className="font-bold mb-2">Debug Information:</h4>
              <pre className="whitespace-pre-wrap text-xs">
                {JSON.stringify({
                  userId: user?.id,
                  userEmail: user?.email,
                  userRole: user?.role,
                  isAdmin,
                  isAuthenticated,
                  timestamp: new Date().toISOString()
                }, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    );
  }

  debugLayout('Rendering admin layout', { 
    userId: user.id,
    userRole: user.role,
    isAdmin 
  });

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          <div className="container mx-auto px-6 py-8">
            {/* Debug info - only shown in development */}
            {process.env.NODE_ENV !== 'production' && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 text-xs rounded">
                <div className="font-bold mb-1">Admin Debug Info:</div>
                <div>User: {user.name} ({user.email})</div>
                <div>Role: <span className="font-semibold">{user.role}</span></div>
                <div>Admin Access: <span className={isAdmin ? 'text-green-600 font-semibold' : 'text-red-600'}>
                  {isAdmin ? 'Granted' : 'Denied'}
                </span></div>
              </div>
            )}
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;