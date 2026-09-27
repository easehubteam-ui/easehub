import { Router } from 'express';
import {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  updateServiceLocation,
} from '../controllers/service.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';

const router = Router();

router.get('/', getServices);
router.get('/:id', getServiceById);
router.post('/', authenticateUser, requireRole('admin', 'superadmin'), createService);
router.put('/:id', authenticateUser, requireRole('admin', 'superadmin'), updateService);
router.delete('/:id', authenticateUser, requireRole('admin', 'superadmin'), deleteService);
router.put('/:id/location', authenticateUser, requireRole('admin', 'superadmin'), updateServiceLocation);
router.put('/admin/service/:id/location', authenticateUser, requireRole('admin', 'superadmin'), updateServiceLocation);

export default router;
