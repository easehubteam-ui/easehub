import { Router } from 'express';
import { getNotifications, markNotificationRead } from '../controllers/notification.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', authenticateUser, getNotifications);
router.put('/:id/read', authenticateUser, markNotificationRead);

export default router;
