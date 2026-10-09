export type UserRole =
  | 'customer'
  | 'vendor'
  | 'admin'
  | 'subadmin'
  | 'superadmin'
  | 'CUSTOMER'
  | 'SUB_ADMIN'
  | 'SUPER_ADMIN';

export type AdminPermissionKey =
  | 'dashboard'
  | 'users'
  | 'pg'
  | 'meals'
  | 'laundry'
  | 'services'
  | 'bookings'
  | 'payments'
  | 'reviews'
  | 'notifications'
  | 'community'
  | 'support'
  | 'reports'
  | 'vendors'
  | 'complaints'
  | 'activity_logs'
  | 'settings';

export type AdminPermissions = Partial<Record<AdminPermissionKey, boolean>>;

export const ADMIN_PERMISSION_MODULES: {
  key: AdminPermissionKey;
  label: string;
  shortLabel: string;
}[] = [
  { key: 'dashboard', label: 'Dashboard', shortLabel: 'Dashboard' },
  { key: 'users', label: 'Users', shortLabel: 'Users' },
  { key: 'pg', label: 'PG Management', shortLabel: 'PG' },
  { key: 'meals', label: 'Meals Management', shortLabel: 'Meals' },
  { key: 'laundry', label: 'Laundry Management', shortLabel: 'Laundry' },
  { key: 'services', label: 'Services Management', shortLabel: 'Services' },
  { key: 'bookings', label: 'Bookings', shortLabel: 'Bookings' },
  { key: 'payments', label: 'Payments', shortLabel: 'Payments' },
  { key: 'reviews', label: 'Reviews', shortLabel: 'Reviews' },
  { key: 'notifications', label: 'Notifications', shortLabel: 'Notifications' },
  { key: 'community', label: 'Community', shortLabel: 'Community' },
  { key: 'support', label: 'Support', shortLabel: 'Support' },
  { key: 'reports', label: 'Revenue/Stats', shortLabel: 'Revenue/Stats' },
  { key: 'vendors', label: 'Vendors', shortLabel: 'Vendors' },
  { key: 'complaints', label: 'Complaints', shortLabel: 'Complaints' },
  { key: 'activity_logs', label: 'Activity Logs', shortLabel: 'Activity Logs' },
  { key: 'settings', label: 'System Settings', shortLabel: 'Settings' },
];

export interface User {
  id: string;
  authUserId?: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  permissions?: AdminPermissions;
  avatar?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  isActive: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any[];
}

export const isSuperAdminRole = (role?: string | null): boolean => {
  const r = (role || '').toLowerCase().replace('-', '_');
  return r === 'superadmin' || r === 'super_admin';
};

export const isSubAdminRole = (role?: string | null): boolean => {
  const r = (role || '').toLowerCase().replace('-', '_');
  return r === 'subadmin' || r === 'sub_admin' || r === 'admin';
};

export const isAdminRole = (role?: string | null): boolean => {
  return isSuperAdminRole(role) || isSubAdminRole(role);
};

export const hasAdminPermission = (
  user: User | null | undefined,
  permKey?: AdminPermissionKey | 'subadmins'
): boolean => {
  if (!user || !user.isActive) return false;
  if (isSuperAdminRole(user.role)) return true;
  if (!isSubAdminRole(user.role)) return false;
  if (permKey === 'subadmins') return false;
  if (!permKey) return true;
  return Boolean(user.permissions && user.permissions[permKey]);
};

export const getFirstAllowedAdminPath = (user: User | null | undefined): string => {
  if (!user || !isAdminRole(user.role)) return '/admin/login';
  if (isSuperAdminRole(user.role)) return '/admin/dashboard';

  const routeOrder: { key: AdminPermissionKey; path: string }[] = [
    { key: 'dashboard', path: '/admin/dashboard' },
    { key: 'pg', path: '/admin/pg' },
    { key: 'meals', path: '/admin/meals' },
    { key: 'laundry', path: '/admin/laundry' },
    { key: 'services', path: '/admin/services' },
    { key: 'bookings', path: '/admin/bookings' },
    { key: 'payments', path: '/admin/payments' },
    { key: 'users', path: '/admin/users' },
    { key: 'community', path: '/admin/community' },
    { key: 'support', path: '/admin/support' },
    { key: 'reviews', path: '/admin/reviews' },
    { key: 'notifications', path: '/admin/notifications' },
    { key: 'reports', path: '/admin/reports' },
    { key: 'vendors', path: '/admin/vendors' },
    { key: 'complaints', path: '/admin/complaints' },
    { key: 'activity_logs', path: '/admin/activity-logs' },
    { key: 'settings', path: '/admin/settings' },
  ];

  for (const item of routeOrder) {
    if (hasAdminPermission(user, item.key)) {
      return item.path;
    }
  }
  return '/admin/profile';
};
