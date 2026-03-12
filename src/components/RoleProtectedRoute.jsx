import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../App";
import supabase from "../config/supabase";

const RoleProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const [userRole, setUserRole] = useState(null);
  const [roleLoading, setRoleLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    let isMounted = true;

    const fetchUserRole = async () => {
      console.log("🛡️ [RoleProtected] fetchUserRole started. Loading:", loading, "User:", !!user);
      // 1. If auth is still loading, do nothing yet
      if (loading) return;

      // 2. If no user, stop checking and let the redirect happen below
      if (!user && !isAuthenticated) {
        if (isMounted) setRoleLoading(false);
        return;
      }

      try {
        // 3. Always check the DB first for the most up-to-date role
        const { data: profile, error: profileError } = await supabase
          .from("user_profiles")
          .select("role, is_admin, is_tutor, is_student")
          .eq("id", user.id)
          .single();

        if (profileError) {
          console.error("RoleProtectedRoute profile error:", profileError);
        }

        // console.log('RoleProtectedRoute profile:', profile);

        // Check boolean flags first, then fallback to role column
        let role = "student";
        if (profile?.is_admin === true || profile?.role === "admin")
          role = "admin";
        else if (profile?.is_tutor === true || profile?.role === "tutor")
          role = "tutor";
        else if (profile?.is_student === true || profile?.role === "student")
          role = "student";
        else if (profile?.role) role = profile.role; // Use role column if boolean flags not set

        // 4. Fallback to metadata if DB check fails
        if (!role) {
          role = user?.user_metadata?.role;
        }

        if (isMounted) {
          console.log(`🛡️ [RoleProtected] Role Check resolved: ${role} | Allowed: ${allowedRoles.join(', ')}`);
          setUserRole(role || "student");
          setRoleLoading(false);
        }
      } catch (error) {
        console.error("🛡️ [RoleProtected] Error fetching role:", error);
        if (isMounted) {
          setUserRole("student");
          setRoleLoading(false);
        }
      }
    };

    fetchUserRole();

    return () => {
      isMounted = false;
    };
  }, [user, isAuthenticated, loading]);

  if (loading || roleLoading) {
    if (loading) console.log("⏳ [RoleProtected] Rendering spinner because Auth is loading");
    if (roleLoading) console.log("⏳ [RoleProtected] Rendering spinner because Role is loading");
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // 1. Not Authenticated
  if (!isAuthenticated || !user) {
    console.log("🛡️ [RoleProtected] Not authenticated, redirecting to login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. ✅ CRITICAL FIX: Check allowedRoles FIRST.
  console.log(`🛡️ [RoleProtected] Evaluating clearance. User is '${userRole}', needs [${allowedRoles.join(', ')}]`);
  // If the current page allows ['student', 'admin'] and I am 'admin', I stay here.
  if (allowedRoles.includes(userRole)) {
    return children;
  }

  if (userRole === "admin") {
    return <Navigate to="/admin" replace />;
  }
  if (userRole === "tutor") {
    return <Navigate to="/tutor/dashboard" replace />;
  }

  return <Navigate to="/dashboard" replace />;
};

export default RoleProtectedRoute;
