import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import supabase from '../config/supabase';

const AdminProtectedRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAdminAccess = async () => {
      if (loading) return;

      if (!user && !isAuthenticated) {
        navigate('/login', { replace: true });
        return;
      }

      try {
        // First check metadata (fast)
        if (user.user_metadata?.role === 'admin') {
           setIsAdmin(true);
           setChecking(false);
           return;
        }

        // Then check database (secure)
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('is_admin, role')
          .eq('id', user.id)
          .single();

        if (!profile || (!profile.is_admin && profile.role !== 'admin')) {
          navigate('/dashboard', { replace: true });
          return;
        }

        setIsAdmin(true);
      } catch (error) {
        console.error('Admin check error:', error);
        navigate('/dashboard', { replace: true });
      } finally {
        setChecking(false);
      }
    };

    checkAdminAccess();
  }, [user, isAuthenticated, loading, navigate]);

  if (loading || checking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return children;
};

export default AdminProtectedRoute;