import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PublicLayout } from '../layouts/PublicLayout';
import { CustomerLayout } from '../layouts/CustomerLayout';
import { AdminLayout } from '../layouts/AdminLayout';

import ProtectedRoute from '../components/auth/ProtectedRoute';
import AdminProtectedRoute from '../components/auth/AdminProtectedRoute';

// Public Guest Pages
import HomePage from '../pages/Home/HomePage';
import LoginPage from '../pages/Auth/LoginPage';
import RegisterPage from '../pages/Auth/RegisterPage';
import ForgotPasswordPage from '../pages/Auth/ForgotPasswordPage';
import ResetPasswordPage from '../pages/Auth/ResetPasswordPage';

// Authenticated Customer App Pages
import DashboardPage from '../pages/Dashboard/DashboardPage';
import { PGPage } from '../pages/PG/PGPage';
import { PGDetails } from '../pages/PG/PGDetails';
import { MealsPage } from '../pages/Meals/MealsPage';
import { LaundryPage } from '../pages/Laundry/LaundryPage';
import { ServicesPage } from '../pages/Services/ServicesPage';
import BookingsPage from '../pages/Bookings/BookingsPage';
import AccountPage from '../pages/Account/AccountPage';
import CustomerPaymentPage from '../pages/Payments/CustomerPaymentPage';
import { WishlistPage } from '../pages/Wishlist/WishlistPage';
import { SupportPage } from '../pages/Support/SupportPage';

// Admin Pages
import AdminLogin from '../pages/admin/AdminLogin';
import AdminDashboard from '../pages/admin/AdminDashboard';
import Users from '../pages/admin/Users';
import Vendors from '../pages/admin/Vendors';
import Bookings from '../pages/admin/Bookings';
import Payments from '../pages/admin/Payments';
import PGManagement from '../pages/admin/PGManagement';
import MealsManagement from '../pages/admin/MealsManagement';
import LaundryManagement from '../pages/admin/LaundryManagement';
import ServicesManagement from '../pages/admin/ServicesManagement';
import Reviews from '../pages/admin/Reviews';
import Complaints from '../pages/admin/Complaints';
import Notifications from '../pages/admin/Notifications';
import Reports from '../pages/admin/Reports';
import AdminActivityLogs from '../pages/admin/AdminActivityLogs';
import Settings from '../pages/admin/Settings';
import AdminProfile from '../pages/admin/AdminProfile';

import NotFound from '../pages/NotFound/NotFound';
import ErrorBoundary from '../components/common/ErrorBoundary';

export const AppRoutes: React.FC = () => {
  return (
    <ErrorBoundary>
      <Routes>
        {/* Public Guest Routes (Cinematic 3D Homepage, Services & Auth Forms) */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
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
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<Users />} />
          <Route path="/admin/vendors" element={<Vendors />} />
          <Route path="/admin/bookings" element={<Bookings />} />
          <Route path="/admin/payments" element={<Payments />} />
          <Route path="/admin/pg" element={<PGManagement />} />
          <Route path="/admin/properties" element={<PGManagement />} />
          <Route path="/admin/meals" element={<MealsManagement />} />
          <Route path="/admin/laundry" element={<LaundryManagement />} />
          <Route path="/admin/services" element={<ServicesManagement />} />
          <Route path="/admin/reviews" element={<Reviews />} />
          <Route path="/admin/complaints" element={<Complaints />} />
          <Route path="/admin/notifications" element={<Notifications />} />
          <Route path="/admin/reports" element={<Reports />} />
          <Route path="/admin/activity-logs" element={<AdminActivityLogs />} />
          <Route path="/admin/settings" element={<Settings />} />
          <Route path="/admin/profile" element={<AdminProfile />} />
        </Route>

        {/* Catch-all Global 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ErrorBoundary>
  );
};

export default AppRoutes;
