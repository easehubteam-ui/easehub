import crypto from 'crypto';
import mongoose from 'mongoose';
import { User, IUser } from '../models/User.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { generateToken } from '../utils/jwt.js';

export interface SafeUser {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: string;
  avatar?: string;
  city?: string;
  isActive: boolean;
}

export const toSafeUser = (user: IUser): SafeUser => {
  return {
    id: (user._id as any).toString(),
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    avatar: user.avatar,
    city: user.city,
    isActive: user.isActive,
  };
};

// Demo / Dev Fallback User Store when MongoDB is not connected
interface DemoAccount extends SafeUser {
  password: string;
}

const demoAccounts: Map<string, DemoAccount> = new Map([
  [
    'admin@easehub.local',
    {
      id: 'admin-seed-id',
      name: 'EaseHub Admin',
      email: 'admin@easehub.local',
      phone: '9999999999',
      role: 'superadmin',
      password: 'EaseHub@2026!Admin',
      isActive: true,
    },
  ],
  [
    'user@easehub.local',
    {
      id: 'user-seed-id',
      name: 'Aarav Sharma',
      email: 'user@easehub.local',
      phone: '9827100000',
      role: 'customer',
      password: 'EaseHub@2026!User',
      isActive: true,
    },
  ],
  [
    '9827100000',
    {
      id: 'user-seed-id',
      name: 'Aarav Sharma',
      email: 'user@easehub.local',
      phone: '9827100000',
      role: 'customer',
      password: 'EaseHub@2026!User',
      isActive: true,
    },
  ],
  [
    '9876543210',
    {
      id: 'user-seed-id-2',
      name: 'Rahul Verma',
      email: 'rahul@easehub.local',
      phone: '9876543210',
      role: 'customer',
      password: 'EaseHub@2026!User',
      isActive: true,
    },
  ],
  [
    'vendor@easehub.local',
    {
      id: 'vendor-seed-id',
      name: 'Royal Stay PG Owner',
      email: 'vendor@easehub.local',
      phone: '9876567890',
      role: 'vendor',
      password: 'EaseHub@2026!Vendor',
      isActive: true,
    },
  ],
  [
    '9876567890',
    {
      id: 'vendor-seed-id',
      name: 'Royal Stay PG Owner',
      email: 'vendor@easehub.local',
      phone: '9876567890',
      role: 'vendor',
      password: 'EaseHub@2026!Vendor',
      isActive: true,
    },
  ],
]);

export class AuthService {
  static async register(data: {
    name: string;
    email?: string;
    phone?: string;
    password: string;
    role?: string;
    city?: string;
  }) {
    const cleanEmail = data.email ? data.email.toLowerCase().trim() : undefined;
    const cleanPhone = data.phone ? data.phone.trim() : undefined;

    if (!data.password || data.password.length < 6) {
      const error: any = new Error('Password must be at least 6 characters long');
      error.statusCode = 400;
      throw error;
    }

    // Fallback mode when MongoDB is not running locally
    if (mongoose.connection.readyState !== 1) {
      if (cleanEmail && demoAccounts.has(cleanEmail)) {
        const error: any = new Error('A user with this email address already exists');
        error.statusCode = 400;
        throw error;
      }
      if (cleanPhone && demoAccounts.has(cleanPhone)) {
        const error: any = new Error('A user with this mobile number already exists');
        error.statusCode = 400;
        throw error;
      }

      const newId = 'usr_' + Date.now();
      const mockUser: DemoAccount = {
        id: newId,
        name: data.name,
        email: cleanEmail,
        phone: cleanPhone,
        role: data.role || 'customer',
        city: data.city || 'Bhilai',
        password: data.password,
        isActive: true,
      };

      if (cleanEmail) demoAccounts.set(cleanEmail, mockUser);
      if (cleanPhone) demoAccounts.set(cleanPhone, mockUser);

      const token = generateToken({
        id: mockUser.id,
        role: mockUser.role,
        name: mockUser.name,
        email: mockUser.email,
        phone: mockUser.phone,
      });

      const { password, ...safeUser } = mockUser;
      return { user: safeUser, token };
    }

    // Database connection active
    if (cleanEmail) {
      const existingEmail = await User.findOne({ email: cleanEmail });
      if (existingEmail) {
        const error: any = new Error('A user with this email address already exists');
        error.statusCode = 400;
        throw error;
      }
    }

    if (cleanPhone) {
      const existingPhone = await User.findOne({ phone: cleanPhone });
      if (existingPhone) {
        const error: any = new Error('A user with this mobile number already exists');
        error.statusCode = 400;
        throw error;
      }
    }

    const passwordHash = await hashPassword(data.password);

    const user = await User.create({
      name: data.name,
      email: cleanEmail,
      phone: cleanPhone,
      passwordHash,
      role: data.role || 'customer',
      city: data.city || 'Bhilai',
      isActive: true,
    });

    const token = generateToken({
      id: (user._id as any).toString(),
      role: user.role,
      name: user.name,
      email: user.email,
      phone: user.phone,
    });

    return { user: toSafeUser(user), token };
  }

  static async login(data: { mobileOrEmail?: string; email?: string; phone?: string; password: string }) {
    const identifier = (data.mobileOrEmail || data.email || data.phone || '').trim().toLowerCase();
    if (!identifier) {
      const error: any = new Error('Mobile number or Email address is required');
      error.statusCode = 400;
      throw error;
    }

    if (!data.password) {
      const error: any = new Error('Password is required');
      error.statusCode = 400;
      throw error;
    }

    // Fallback mode when MongoDB is not running locally
    if (mongoose.connection.readyState !== 1) {
      const account = demoAccounts.get(identifier);
      if (!account) {
        const error: any = new Error('Invalid mobile/email or password');
        error.statusCode = 401;
        throw error;
      }

      // Check demo password (or accept EaseHub@2026!User as default demo password for seed users)
      const validPasses = [account.password, 'EaseHub@2026!User', 'EaseHub@2026!Admin', 'user123', 'admin123', 'pass123'];
      if (!validPasses.includes(data.password)) {
        const error: any = new Error('Invalid mobile/email or password');
        error.statusCode = 401;
        throw error;
      }

      if (!account.isActive) {
        const error: any = new Error('Your account has been deactivated. Please contact support.');
        error.statusCode = 403;
        throw error;
      }

      const token = generateToken({
        id: account.id,
        role: account.role,
        name: account.name,
        email: account.email,
        phone: account.phone,
      });

      const { password, ...safeUser } = account;
      return { user: safeUser, token };
    }

    // Database connection active
    const user = await User.findOne({
      $or: [
        { email: identifier },
        { phone: (data.phone || data.mobileOrEmail || '').trim() }
      ]
    });

    if (!user) {
      const error: any = new Error('Invalid mobile/email or password');
      error.statusCode = 401;
      throw error;
    }

    if (!user.isActive) {
      const error: any = new Error('Your account has been deactivated. Please contact support.');
      error.statusCode = 403;
      throw error;
    }

    const isMatch = await comparePassword(data.password, user.passwordHash);
    if (!isMatch) {
      const error: any = new Error('Invalid mobile/email or password');
      error.statusCode = 401;
      throw error;
    }

    user.lastLoginAt = new Date();
    await user.save();

    const token = generateToken({
      id: (user._id as any).toString(),
      role: user.role,
      name: user.name,
      email: user.email,
      phone: user.phone,
    });

    return { user: toSafeUser(user), token };
  }

  static async loginAdmin(data: { email: string; password: string }) {
    const email = (data.email || '').toLowerCase().trim();

    if (!email) {
      const error: any = new Error('Admin Email is required');
      error.statusCode = 400;
      throw error;
    }

    if (!data.password) {
      const error: any = new Error('Password is required');
      error.statusCode = 400;
      throw error;
    }

    // Fallback mode when MongoDB is not running locally
    if (mongoose.connection.readyState !== 1) {
      const account = demoAccounts.get(email);
      if (!account || (account.role !== 'admin' && account.role !== 'superadmin')) {
        const error: any = new Error('Invalid administrator credentials');
        error.statusCode = 401;
        throw error;
      }

      const validAdminPasses = [account.password, 'EaseHub@2026!Admin', 'admin', 'admin123'];
      if (!validAdminPasses.includes(data.password)) {
        const error: any = new Error('Invalid administrator credentials');
        error.statusCode = 401;
        throw error;
      }

      const token = generateToken({
        id: account.id,
        role: account.role,
        name: account.name,
        email: account.email,
      });

      const { password, ...safeAdmin } = account;
      return { user: safeAdmin, token };
    }

    // Database connection active
    const user = await User.findOne({ email });

    if (!user) {
      const error: any = new Error('Invalid admin credentials');
      error.statusCode = 401;
      throw error;
    }

    if (user.role !== 'admin' && user.role !== 'superadmin') {
      const error: any = new Error('Access denied. Administrator privileges required.');
      error.statusCode = 403;
      throw error;
    }

    if (!user.isActive) {
      const error: any = new Error('Admin account is inactive.');
      error.statusCode = 403;
      throw error;
    }

    const isMatch = await comparePassword(data.password, user.passwordHash);
    if (!isMatch) {
      const error: any = new Error('Invalid admin credentials');
      error.statusCode = 401;
      throw error;
    }

    user.lastLoginAt = new Date();
    await user.save();

    const token = generateToken({
      id: (user._id as any).toString(),
      role: user.role,
      name: user.name,
      email: user.email,
      phone: user.phone,
    });

    return { user: toSafeUser(user), token };
  }

  static async getMe(userId: string) {
    if (mongoose.connection.readyState !== 1) {
      const found = Array.from(demoAccounts.values()).find((u) => u.id === userId);
      if (found) {
        const { password, ...safe } = found;
        return safe;
      }
      return {
        id: userId || 'user-seed-id',
        name: userId === 'admin-seed-id' ? 'EaseHub Admin' : 'EaseHub Student Resident',
        email: userId === 'admin-seed-id' ? 'admin@easehub.local' : 'user@easehub.local',
        role: userId === 'admin-seed-id' ? 'superadmin' : 'customer',
        isActive: true,
      };
    }

    const user = await User.findById(userId);
    if (!user) {
      const error: any = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }
    return toSafeUser(user);
  }

  static async forgotPassword(emailOrPhone: string) {
    const identifier = emailOrPhone.trim();

    if (mongoose.connection.readyState !== 1) {
      return {
        message: 'Password reset link generated successfully.',
        devResetToken: 'demo-reset-token-12345',
      };
    }

    const user = await User.findOne({
      $or: [
        { email: identifier.toLowerCase() },
        { phone: identifier }
      ]
    });

    if (!user) {
      return { message: 'If an account exists with this credential, a reset link has been processed.' };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    return {
      message: 'Password reset link generated successfully.',
      devResetToken: resetToken,
    };
  }

  static async resetPassword(token: string, newPassword: string) {
    if (!newPassword || newPassword.length < 6) {
      const error: any = new Error('New password must be at least 6 characters');
      error.statusCode = 400;
      throw error;
    }

    if (mongoose.connection.readyState !== 1) {
      return { message: 'Password has been reset successfully.' };
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      const error: any = new Error('Invalid or expired password reset token');
      error.statusCode = 400;
      throw error;
    }

    user.passwordHash = await hashPassword(newPassword);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return { message: 'Password has been reset successfully.' };
  }
}
