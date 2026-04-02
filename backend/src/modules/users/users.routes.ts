import express from 'express';
import { getAllUsers, updateUserBalance, impersonateUser, createAdminUser, updateUser, deleteUser } from './users.controller.js';
import { getAdminStats } from './admin.controller.js';
import { getLogs } from './logs.controller.js';
import { getModelData, deleteModelRecord } from './database.controller.js';
import { authMiddleware, adminMiddleware } from '../../middleware/auth.js';

const router = express.Router();

router.get('/stats', authMiddleware, adminMiddleware, getAdminStats);
router.get('/logs', authMiddleware, adminMiddleware, getLogs);
router.get('/db/:model', authMiddleware, adminMiddleware, getModelData);
router.delete('/db/:model/:id', authMiddleware, adminMiddleware, deleteModelRecord);
router.get('/', authMiddleware, adminMiddleware, getAllUsers);
router.post('/admin', authMiddleware, adminMiddleware, createAdminUser);
router.put('/:id', authMiddleware, adminMiddleware, updateUser);
router.delete('/:id', authMiddleware, adminMiddleware, deleteUser);
router.post('/:id/balance', authMiddleware, adminMiddleware, updateUserBalance);
router.post('/:id/impersonate', authMiddleware, adminMiddleware, impersonateUser);

export default router;
