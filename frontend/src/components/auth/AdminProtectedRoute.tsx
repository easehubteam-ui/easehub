import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  AdminPermissionKey,
  isAdminRole,
  hasAdminPermission,
  getFirstAllowedAdminPath,
} from '../../types';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: AdminPermissionKey | 'subadmins';
}

export const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({
  children,
  requiredPermission,
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading && !user) {
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

  if (!isAdminRole(user.role)) {
    return (
      <Navigate
        to="/admin/login"
        state={{ error: 'Access denied. Admin privileges required.' }}
        replace
      />
    );
  }

  if (requiredPermission && !hasAdminPermission(user, requiredPermission)) {
    const fallbackPath = getFirstAllowedAdminPath(user);
    if (location.pathname === '/admin/dashboard' && fallbackPath !== '/admin/dashboard') {
      return <Navigate to={fallbackPath} replace />;
    }

    return (
      <div className="bg-white rounded-3xl border border-[#E5E1D6] p-8 sm:p-12 max-w-xl mx-auto my-8 text-center shadow-xs space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <span className="material-symbols-outlined text-3xl">gpp_bad</span>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-extrabold uppercase tracking-wider">
          403 • Unauthorized Module Access
        </div>
        <h2 className="text-xl font-extrabold text-[#171A18]">Permission Denied</h2>
        <p className="text-xs sm:text-sm text-[#6B6B63] leading-relaxed">
          Your Sub Admin account (<strong className="text-[#171A18]">{user.email}</strong>) does not have permission to access this module. Please contact a Super Admin if you require access.
        </p>
        <div className="pt-2 flex items-center justify-center gap-3">
          <Link
            to={fallbackPath}
            className="px-5 py-2.5 rounded-xl bg-[#225944] hover:bg-[#184232] text-white text-xs font-bold transition shadow-xs"
          >
            Go to Allowed Module
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AdminProtectedRoute;
