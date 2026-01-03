import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';

const ProtectedRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('user');
      const confirmedUser = localStorage.getItem('confirmedUser');
      
      if (!token && !confirmedUser && !user && !isAuthenticated) {
        navigate('/login', { replace: true });
        return;
      }
    };

    if (!loading) {
      checkAuth();
    }
  }, [user, isAuthenticated, loading, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const token = localStorage.getItem('auth_token') || localStorage.getItem('user');
  const confirmedUser = localStorage.getItem('confirmedUser');
  
  if (!user && !isAuthenticated && !token && !confirmedUser) {
    return null;
  }

  return children;
};

export default ProtectedRoute;