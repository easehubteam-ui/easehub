import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { isAdminRole, getFirstAllowedAdminPath } from '../../types';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading && !user) {
    return (
      <div className="min-h-screen bg-[#F7F5EF] flex items-center justify-center p-6 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#225944] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-bold text-[#225944]">Verifying EaseHub session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Redirect admin/subadmin/superadmin to admin console when attempting to access customer routes
  if (isAdminRole(user.role)) {
    return <Navigate to={getFirstAllowedAdminPath(user)} replace />;
  }

  if (user.role !== 'customer') {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
