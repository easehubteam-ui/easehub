import { Router } from 'express';
import {
  getBookings,
  getMyBookings,
  createBooking,
  updateBookingStatus,
  cancelBooking,
} from '../controllers/booking.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';

const router = Router();

router.get('/', authenticateUser, getBookings);
router.get('/my', authenticateUser, getMyBookings);
router.post('/', authenticateUser, createBooking);
router.put('/:id/status', authenticateUser, requireRole('admin', 'superadmin'), updateBookingStatus);
router.put('/:id/cancel', authenticateUser, cancelBooking);

export default router;
