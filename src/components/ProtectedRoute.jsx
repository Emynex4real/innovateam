import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';

const ProtectedRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication status
    const checkAuth = () => {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('user');
      const confirmedUser = localStorage.getItem('confirmedUser');
      
      // If no authentication data exists, redirect to login
      if (!token && !confirmedUser && !user && !isAuthenticated) {
        console.log('No authentication found, redirecting to login');
        navigate('/login', { replace: true });
        return;
      }
      
      // Additional check for valid user data
      if (!loading && !user && !confirmedUser) {
        console.log('No valid user data, redirecting to login');
        navigate('/login', { replace: true });
      }
    };

    checkAuth();
  }, [user, isAuthenticated, loading, navigate]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If not authenticated, don't render children
  const token = localStorage.getItem('auth_token') || localStorage.getItem('user');
  const confirmedUser = localStorage.getItem('confirmedUser');
  
  if (!user && !isAuthenticated && !token && !confirmedUser) {
    return null;
  }

  return children;
};

export default ProtectedRoute;