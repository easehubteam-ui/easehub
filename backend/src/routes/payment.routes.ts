import { Router } from 'express';
import {
  getPayments,
  submitPaymentProof,
  verifyPayment,
  rejectPayment,
  getPaymentStats,
} from '../controllers/payment.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';

const router = Router();

router.get('/', authenticateUser, getPayments);
router.get('/stats', authenticateUser, requireRole('admin', 'superadmin'), getPaymentStats);
router.post('/submit', authenticateUser, submitPaymentProof);
router.put('/:id/verify', authenticateUser, requireRole('admin', 'superadmin'), verifyPayment);
router.put('/:id/reject', authenticateUser, requireRole('admin', 'superadmin'), rejectPayment);

export default router;
