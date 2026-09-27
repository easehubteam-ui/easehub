import { Router } from 'express';
import { getReviews, createReview } from '../controllers/review.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', getReviews);
router.post('/', authenticateUser, createReview);

export default router;
