import mongoose, { Schema, Document } from 'mongoose';

export type UserRole = 'customer' | 'vendor' | 'admin' | 'superadmin';

export interface IUser extends Document {
  name: string;
  email?: string;
  phone?: string;
  passwordHash: string;
  role: UserRole;
  avatar?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  isActive: boolean;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  lastLoginAt?: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      index: { unique: true, sparse: true },
    },
    phone: {
      type: String,
      trim: true,
      index: { unique: true, sparse: true },
    },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ['customer', 'vendor', 'admin', 'superadmin'],
      default: 'customer',
      required: true,
    },
    avatar: { type: String },
    address: { type: String },
    city: { type: String },
    state: { type: String },
    pincode: { type: String },
    isActive: { type: Boolean, default: true },
    isEmailVerified: { type: Boolean, default: false },
    isPhoneVerified: { type: Boolean, default: false },
    lastLoginAt: { type: Date },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', UserSchema);
