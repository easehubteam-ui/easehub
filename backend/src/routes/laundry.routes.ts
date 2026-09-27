import { Router } from 'express';
import {
  getLaundryProviders,
  getLaundryProviderById,
  createLaundryProvider,
  updateLaundryProvider,
  deleteLaundryProvider,
} from '../controllers/laundry.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import { createLaundrySchema } from '../validators/laundry.validator.js';

const router = Router();

// Public read routes
router.get('/', getLaundryProviders);
router.get('/:id', getLaundryProviderById);

// Protected admin routes
router.post(
  '/',
  authenticateUser,
  requireRole('admin', 'superadmin'),
  validateRequest(createLaundrySchema),
  createLaundryProvider
);
router.put(
  '/:id',
  authenticateUser,
  requireRole('admin', 'superadmin'),
  updateLaundryProvider
);
router.delete(
  '/:id',
  authenticateUser,
  requireRole('admin', 'superadmin'),
  deleteLaundryProvider
);

export default router;
