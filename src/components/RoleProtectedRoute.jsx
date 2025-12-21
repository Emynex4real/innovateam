import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import supabase from '../config/supabase';

const RoleProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [hasAccess, setHasAccess] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      if (loading) return;

      if (!user && !isAuthenticated) {
        navigate('/login', { replace: true });
        return;
      }

      try {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('role, is_admin, is_tutor, is_student')
          .eq('id', user.id)
          .single();

        if (!profile) {
          navigate('/dashboard', { replace: true });
          return;
        }

        // Check if user has any of the allowed roles
        const userRoles = [];
        if (profile.is_admin) userRoles.push('admin');
        if (profile.is_tutor) userRoles.push('tutor');
        if (profile.is_student) userRoles.push('student');

        const hasPermission = allowedRoles.some(role => userRoles.includes(role));

        if (!hasPermission) {
          // Redirect to their primary dashboard
          if (profile.is_admin) {
            navigate('/admin/dashboard', { replace: true });
          } else if (profile.is_tutor) {
            navigate('/tutor', { replace: true });
          } else {
            navigate('/dashboard', { replace: true });
          }
          return;
        }

        setHasAccess(true);
      } catch (error) {
        console.error('Access check error:', error);
        navigate('/dashboard', { replace: true });
      } finally {
        setChecking(false);
      }
    };

    checkAccess();
  }, [user, isAuthenticated, loading, navigate, allowedRoles]);

  if (loading || checking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!hasAccess) {
    return null;
  }

  return children;
};

export default RoleProtectedRoute;
