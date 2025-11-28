
import React, { useContext } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { UserRole } from '../types';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { user, isLoading } = useContext(AuthContext);
  const location = useLocation();

  if (isLoading) {
    // Render a simple loading spinner while checking auth state
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    // Redirect to login while saving the attempted location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles) {
    // Check if user has ANY of the allowed roles
    const hasPermission = user.roles.some(role => allowedRoles.includes(role));
    if (!hasPermission) {
        // Role not authorized. Redirect to their appropriate dashboard to avoid loops.
        // E.g., A Parent trying to access /dashboard (Teacher area) should go to /parent-dashboard
        if (user.roles.includes(UserRole.STUDENT) && user.roles.length === 1) {
            return <Navigate to="/student-dashboard" replace />;
        }
        if (user.roles.includes(UserRole.PARENT)) {
            return <Navigate to="/parent-dashboard" replace />;
        }
        return <Navigate to="/dashboard" replace />;
    }
  }

  return <Outlet />;
};
