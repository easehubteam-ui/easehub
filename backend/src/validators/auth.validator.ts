import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address').optional().or(z.literal('')),
    phone: z.string().min(10, 'Mobile number must be at least 10 digits').optional().or(z.literal('')),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().optional(),
    city: z.string().optional(),
    terms: z.boolean().optional(),
  }).refine((data) => data.email || data.phone, {
    message: 'Either email or mobile number must be provided',
    path: ['email'],
  }),
});

export const loginSchema = z.object({
  body: z.object({
    mobileOrEmail: z.string().min(1, 'Mobile or Email is required').optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
    password: z.string().min(1, 'Password is required'),
    rememberMe: z.boolean().optional(),
  }),
});

export const adminLoginSchema = z.object({
  body: z.object({
    email: z.string().email('Valid email is required'),
    password: z.string().min(1, 'Password is required'),
    rememberMe: z.boolean().optional(),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    emailOrPhone: z.string().min(1, 'Email or mobile number is required'),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'Reset token is required'),
    newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  }),
});
