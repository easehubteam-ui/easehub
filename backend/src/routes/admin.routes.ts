import { Router } from 'express';
import { getAdminStats } from '../controllers/admin.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';

const router = Router();

router.get('/stats', authenticateUser, requireRole('admin', 'superadmin'), getAdminStats);

export default router;
