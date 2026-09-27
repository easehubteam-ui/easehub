import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service.js';
import { sendResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { env } from '../config/env.js';

const getCookieOptions = () => ({
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
});

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { user, token } = await AuthService.register(req.body);

  res.cookie('token', token, getCookieOptions());

  return sendResponse({
    res,
    statusCode: 201,
    success: true,
    message: 'Registration successful',
    data: { user, token },
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { user, token } = await AuthService.login(req.body);

  res.cookie('token', token, getCookieOptions());

  return sendResponse({
    res,
    statusCode: 200,
    success: true,
    message: 'Login successful',
    data: { user, token },
  });
});

export const adminLogin = asyncHandler(async (req: Request, res: Response) => {
  const { user, token } = await AuthService.loginAdmin(req.body);

  res.cookie('token', token, getCookieOptions());

  return sendResponse({
    res,
    statusCode: 200,
    success: true,
    message: 'Admin login successful',
    data: { user, token },
  });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
  });

  return sendResponse({
    res,
    statusCode: 200,
    success: true,
    message: 'Logged out successfully',
  });
});

export const getMe = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user?.id) {
    return sendResponse({
      res,
      statusCode: 401,
      success: false,
      message: 'Unauthenticated',
    });
  }

  const user = await AuthService.getMe(req.user.id);

  return sendResponse({
    res,
    statusCode: 200,
    success: true,
    message: 'Authenticated user profile fetched successfully',
    data: { user },
  });
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { emailOrPhone } = req.body;
  const result = await AuthService.forgotPassword(emailOrPhone);

  return sendResponse({
    res,
    statusCode: 200,
    success: true,
    message: result.message,
    data: result.devResetToken ? { devResetToken: result.devResetToken } : undefined,
  });
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;
  const result = await AuthService.resetPassword(token, newPassword);

  return sendResponse({
    res,
    statusCode: 200,
    success: true,
    message: result.message,
  });
});

export const health = asyncHandler(async (req: Request, res: Response) => {
  return sendResponse({
    res,
    statusCode: 200,
    success: true,
    message: 'Authentication service is healthy',
    data: {
      timestamp: new Date().toISOString(),
      service: 'auth',
    },
  });
});
