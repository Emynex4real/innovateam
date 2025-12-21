import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import supabase from '../config/supabase';

const RoleProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkRoleAndRedirect = async () => {
      if (loading) return;

      if (!user && !isAuthenticated) {
        navigate('/login', { replace: true });
        return;
      }

      try {
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('❌ Profile fetch error:', profileError);
        }

        const role = profile?.role || 'student';
        setUserRole(role);

        // Check if user has permission
        if (!allowedRoles.includes(role)) {
          // Redirect based on their actual role
          if (role === 'admin') {
            navigate('/admin/dashboard', { replace: true });
          } else if (role === 'tutor') {
            navigate('/tutor', { replace: true });
          } else {
            navigate('/dashboard', { replace: true });
          }
        }
      } catch (error) {
        console.error('❌ Role check error:', error);
        navigate('/dashboard', { replace: true });
      } finally {
        setChecking(false);
      }
    };

    checkRoleAndRedirect();
  }, [user, isAuthenticated, loading, navigate, allowedRoles]);

  if (loading || checking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!userRole || !allowedRoles.includes(userRole)) {
    return null;
  }

  return children;
};

export default RoleProtectedRoute;
