import { Router } from 'express';
import { getUsers } from '../controllers/user.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';

const router = Router();

router.get('/', authenticateUser, requireRole('admin', 'superadmin'), getUsers);

export default router;
