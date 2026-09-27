import { Router } from 'express';
import {
  register,
  login,
  adminLogin,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  health,
} from '../controllers/auth.controller.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import {
  registerSchema,
  loginSchema,
  adminLoginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../validators/auth.validator.js';
import { authenticateUser } from '../middleware/auth.middleware.js';

const router = Router();

// Public auth endpoints
router.post('/register', validateRequest(registerSchema), register);
router.post('/login', validateRequest(loginSchema), login);
router.post('/admin/login', validateRequest(adminLoginSchema), adminLogin);
router.post('/logout', logout);
router.post('/forgot-password', validateRequest(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', validateRequest(resetPasswordSchema), resetPassword);
router.get('/health', health);

// Protected user profile endpoint
router.get('/me', authenticateUser, getMe);

export default router;
