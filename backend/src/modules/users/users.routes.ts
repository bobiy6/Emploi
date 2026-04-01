import express from 'express';
import { getAllUsers, updateUserBalance, impersonateUser } from './users.controller.js';
import { getAdminStats } from './admin.controller.js';
import { authMiddleware, adminMiddleware } from '../../middleware/auth.js';

const router = express.Router();

router.get('/stats', authMiddleware, adminMiddleware, getAdminStats);
router.get('/', authMiddleware, adminMiddleware, getAllUsers);
router.post('/:id/balance', authMiddleware, adminMiddleware, updateUserBalance);
router.post('/:id/impersonate', authMiddleware, adminMiddleware, impersonateUser);

export default router;
