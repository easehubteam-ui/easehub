import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PublicLayout } from '../layouts/PublicLayout';
import { CustomerLayout } from '../layouts/CustomerLayout';
import { AdminLayout } from '../layouts/AdminLayout';

import ProtectedRoute from '../components/auth/ProtectedRoute';
import AdminProtectedRoute from '../components/auth/AdminProtectedRoute';

// Public Fast-Loading Entry Pages
import HomePage from '../pages/Home/TemplateHomePage';
import LoginPage from '../pages/Auth/LoginPage';
import RegisterPage from '../pages/Auth/RegisterPage';

// Lazy-Loaded Guest Pages
const ForgotPasswordPage = React.lazy(() => import('../pages/Auth/ForgotPasswordPage'));
const ResetPasswordPage = React.lazy(() => import('../pages/Auth/ResetPasswordPage'));
const SupportPage = React.lazy(() => import('../pages/Support/SupportPage').then(m => ({ default: m.SupportPage })));

// Lazy-Loaded Customer Pages
const DashboardPage = React.lazy(() => import('../pages/Dashboard/DashboardPage'));
const PGPage = React.lazy(() => import('../pages/PG/PGPage').then(m => ({ default: m.PGPage })));
const PGDetails = React.lazy(() => import('../pages/PG/PGDetails').then(m => ({ default: m.PGDetails })));
const MealsPage = React.lazy(() => import('../pages/Meals/MealsPage').then(m => ({ default: m.MealsPage })));
const LaundryPage = React.lazy(() => import('../pages/Laundry/LaundryPage').then(m => ({ default: m.LaundryPage })));
const ServicesPage = React.lazy(() => import('../pages/Services/ServicesPage').then(m => ({ default: m.ServicesPage })));
const BookingsPage = React.lazy(() => import('../pages/Bookings/BookingsPage'));
const AccountPage = React.lazy(() => import('../pages/Account/AccountPage'));
const CustomerPaymentPage = React.lazy(() => import('../pages/Payments/CustomerPaymentPage'));
const WishlistPage = React.lazy(() => import('../pages/Wishlist/WishlistPage').then(m => ({ default: m.WishlistPage })));
const CommunityPage = React.lazy(() => import('../pages/Community/CommunityPage'));
const PrivateSupportChatPage = React.lazy(() => import('../pages/Support/PrivateSupportChatPage'));

// Lazy-Loaded Admin Pages (Loaded only when admin access is initiated)
const AdminLogin = React.lazy(() => import('../pages/admin/AdminLogin'));
const AdminDashboard = React.lazy(() => import('../pages/admin/AdminDashboard'));
const AdminSupport = React.lazy(() => import('../pages/admin/AdminSupport'));
const Users = React.lazy(() => import('../pages/admin/Users'));
const Vendors = React.lazy(() => import('../pages/admin/Vendors'));
const Bookings = React.lazy(() => import('../pages/admin/Bookings'));
const Payments = React.lazy(() => import('../pages/admin/Payments'));
const PGManagement = React.lazy(() => import('../pages/admin/PGManagement'));
const MealsManagement = React.lazy(() => import('../pages/admin/MealsManagement'));
const LaundryManagement = React.lazy(() => import('../pages/admin/LaundryManagement'));
const ServicesManagement = React.lazy(() => import('../pages/admin/ServicesManagement'));
const Reviews = React.lazy(() => import('../pages/admin/Reviews'));
const Complaints = React.lazy(() => import('../pages/admin/Complaints'));
const Notifications = React.lazy(() => import('../pages/admin/Notifications'));
const Reports = React.lazy(() => import('../pages/admin/Reports'));
const AdminActivityLogs = React.lazy(() => import('../pages/admin/AdminActivityLogs'));
const Settings = React.lazy(() => import('../pages/admin/Settings'));
const AdminProfile = React.lazy(() => import('../pages/admin/AdminProfile'));
const SubAdmins = React.lazy(() => import('../pages/admin/SubAdmins'));

import NotFound from '../pages/NotFound/NotFound';
import ErrorBoundary from '../components/common/ErrorBoundary';
import { useAuth } from '../context/AuthContext';
import { isAdminRole, getFirstAllowedAdminPath } from '../types';

const RouteLoading: React.FC = () => (
  <div className="min-h-[50vh] flex items-center justify-center p-6 text-center">
    <div className="flex flex-col items-center gap-3">
      <div className="w-9 h-9 border-4 border-[#225944] border-t-transparent rounded-full animate-spin"></div>
      <p className="text-xs font-bold text-[#225944]">Loading EaseHub...</p>
    </div>
  </div>
);

const RootRoute: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  // If session is restoring from storage, wait before making the routing decision
  if (isLoading && !user) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center p-6 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 border-4 border-[#225944] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-bold text-[#225944]">Loading EaseHub...</p>
        </div>
      </div>
    );
  }

  // Authenticated users are routed to their respective dashboards
  if (isAuthenticated && user) {
    if (isAdminRole(user.role)) {
      return <Navigate to={getFirstAllowedAdminPath(user)} replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  // Unauthenticated guests see the Public Home Page
  return <HomePage />;
};

export const AppRoutes: React.FC = () => {
  return (
    <ErrorBoundary>
      <Suspense fallback={<RouteLoading />}>
        <Routes>
          {/* Public Guest Routes (Cinematic 3D Homepage, Services & Auth Forms) */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<RootRoute />} />
            <Route path="/pg" element={<PGPage />} />
            <Route path="/pg/:id" element={<PGDetails />} />
            <Route path="/meals" element={<MealsPage />} />
            <Route path="/meals/:id" element={<MealsPage />} />
            <Route path="/laundry" element={<LaundryPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/services/:id" element={<ServicesPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/support" element={<SupportPage />} />
          </Route>

          {/* Authenticated Customer Service App (Dedicated App Layout & Protected Account Pages) */}
          <Route
            element={
              <ProtectedRoute>
                <CustomerLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/bookings" element={<BookingsPage />} />
            <Route path="/bookings/:id" element={<BookingsPage />} />
            <Route path="/booking/confirmation/:id" element={<BookingsPage />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="/payment" element={<CustomerPaymentPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/saved" element={<WishlistPage />} />
            <Route path="/community" element={<CommunityPage />} />
            <Route path="/support/chat" element={<PrivateSupportChatPage />} />

            {/* Shortcuts & Aliases */}
            <Route path="/my-account" element={<Navigate to="/account" replace />} />
            <Route path="/profile" element={<Navigate to="/account?tab=profile" replace />} />
            <Route path="/payments" element={<Navigate to="/account?tab=payments" replace />} />
            <Route path="/notifications" element={<Navigate to="/account?tab=notifications" replace />} />
          </Route>

          {/* Admin Login Route (standalone) */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Protected Admin Console Routes */}
          <Route
            element={
              <AdminProtectedRoute>
                <AdminLayout />
              </AdminProtectedRoute>
            }
          >
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route
              path="/admin/dashboard"
              element={
                <AdminProtectedRoute requiredPermission="dashboard">
                  <AdminDashboard />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/community"
              element={
                <AdminProtectedRoute requiredPermission="community">
                  <AdminSupport defaultTab="community" />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/support"
              element={
                <AdminProtectedRoute requiredPermission="support">
                  <AdminSupport defaultTab="conversations" />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/subadmins"
              element={
                <AdminProtectedRoute requiredPermission="subadmins">
                  <SubAdmins />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <AdminProtectedRoute requiredPermission="users">
                  <Users />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/vendors"
              element={
                <AdminProtectedRoute requiredPermission="vendors">
                  <Vendors />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/bookings"
              element={
                <AdminProtectedRoute requiredPermission="bookings">
                  <Bookings />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/payments"
              element={
                <AdminProtectedRoute requiredPermission="payments">
                  <Payments />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/pg"
              element={
                <AdminProtectedRoute requiredPermission="pg">
                  <PGManagement />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/properties"
              element={
                <AdminProtectedRoute requiredPermission="pg">
                  <PGManagement />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/meals"
              element={
                <AdminProtectedRoute requiredPermission="meals">
                  <MealsManagement />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/laundry"
              element={
                <AdminProtectedRoute requiredPermission="laundry">
                  <LaundryManagement />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/services"
              element={
                <AdminProtectedRoute requiredPermission="services">
                  <ServicesManagement />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/reviews"
              element={
                <AdminProtectedRoute requiredPermission="reviews">
                  <Reviews />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/complaints"
              element={
                <AdminProtectedRoute requiredPermission="complaints">
                  <Complaints />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/notifications"
              element={
                <AdminProtectedRoute requiredPermission="notifications">
                  <Notifications />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/reports"
              element={
                <AdminProtectedRoute requiredPermission="reports">
                  <Reports />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/activity-logs"
              element={
                <AdminProtectedRoute requiredPermission="activity_logs">
                  <AdminActivityLogs />
                </AdminProtectedRoute>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <AdminProtectedRoute requiredPermission="settings">
                  <Settings />
                </AdminProtectedRoute>
              }
            />
            <Route path="/admin/profile" element={<AdminProfile />} />
          </Route>

          {/* Catch-all Global 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
};

export default AppRoutes;
