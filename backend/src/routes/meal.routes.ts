import { Router } from 'express';
import {
  getMealProviders,
  getMealProviderById,
  createMealProvider,
  updateMealProvider,
  deleteMealProvider,
  updateMealProviderLocation,
} from '../controllers/meal.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';

const router = Router();

router.get('/', getMealProviders);
router.get('/:id', getMealProviderById);
router.post('/', authenticateUser, requireRole('admin', 'superadmin'), createMealProvider);
router.put('/:id', authenticateUser, requireRole('admin', 'superadmin'), updateMealProvider);
router.delete('/:id', authenticateUser, requireRole('admin', 'superadmin'), deleteMealProvider);
router.put('/:id/location', authenticateUser, requireRole('admin', 'superadmin'), updateMealProviderLocation);
router.put('/admin/meal/:id/location', authenticateUser, requireRole('admin', 'superadmin'), updateMealProviderLocation);

export default router;
