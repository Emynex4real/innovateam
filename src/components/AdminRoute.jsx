import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/SupabaseAuthContext';
import Loading from './Loading';

const AdminRoute = ({ children }) => {
  const { isAuthenticated, loading, profile } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Wait for profile to load before checking admin status
  if (!profile) {
    return <Loading />;
  }

  if (profile.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default AdminRoute;