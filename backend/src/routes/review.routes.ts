import { Router } from 'express';
import {
  getReviews,
  getAdminReviews,
  createReview,
  updateReviewStatus,
  deleteReview,
} from '../controllers/review.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';

const router = Router();

// Public: get published reviews
router.get('/', getReviews);

// Admin: get all reviews for moderation
router.get('/admin/all', authenticateUser, requireRole('admin', 'superadmin'), getAdminReviews);

// Public/Customer: submit review
router.post('/', authenticateUser, createReview);

// Admin: approve / reject review status
router.patch('/:id/status', authenticateUser, requireRole('admin', 'superadmin'), updateReviewStatus);

// Admin: delete review
router.delete('/:id', authenticateUser, requireRole('admin', 'superadmin'), deleteReview);

export default router;
