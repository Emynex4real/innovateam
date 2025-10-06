import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/SupabaseAuthContext';
import Loading from './Loading';

const AdminRoute = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!user?.isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default AdminRoute;