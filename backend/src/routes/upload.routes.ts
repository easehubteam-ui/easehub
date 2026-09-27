import { Router } from 'express';
import { uploadFile } from '../controllers/upload.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/', authenticateUser, uploadFile);

export default router;
