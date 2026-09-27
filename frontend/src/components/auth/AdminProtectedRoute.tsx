import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const AdminProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#171A18] flex items-center justify-center p-6 text-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#EECA3A] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-bold text-[#EECA3A]">Verifying Admin Credentials...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (user.role !== 'admin' && user.role !== 'superadmin') {
    return <Navigate to="/admin/login" state={{ error: 'Access denied. Administrator privileges required.' }} replace />;
  }

  return <>{children}</>;
};

export default AdminProtectedRoute;
