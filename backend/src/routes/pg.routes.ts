import { Router } from 'express';
import {
  getPGs,
  getPGById,
  createPG,
  updatePG,
  deletePG,
  updatePGLocation,
} from '../controllers/pg.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';

const router = Router();

router.get('/', getPGs);
router.get('/:id', getPGById);
router.post('/', authenticateUser, requireRole('admin', 'superadmin'), createPG);
router.put('/:id', authenticateUser, requireRole('admin', 'superadmin'), updatePG);
router.delete('/:id', authenticateUser, requireRole('admin', 'superadmin'), deletePG);
router.put('/:id/location', authenticateUser, requireRole('admin', 'superadmin'), updatePGLocation);
router.put('/admin/pg/:id/location', authenticateUser, requireRole('admin', 'superadmin'), updatePGLocation);

export default router;
