import express from 'express';
import { getAllUsers, updateUserBalance, impersonateUser, createAdminUser, updateUser, deleteUser } from './users.controller.js';
import { getAdminStats } from './admin.controller.js';
import { getLogs } from './logs.controller.js';
import { getModelData, deleteModelRecord } from './database.controller.js';
import { authMiddleware } from '../../middleware/auth.js';
import { staffMiddleware, superAdminMiddleware } from '../../middleware/rbac.js';

const router = express.Router();

router.get('/stats', authMiddleware, staffMiddleware, getAdminStats);
router.get('/logs', authMiddleware, staffMiddleware, getLogs);
router.get('/db/:model', authMiddleware, superAdminMiddleware, getModelData);
router.delete('/db/:model/:id', authMiddleware, superAdminMiddleware, deleteModelRecord);
router.get('/', authMiddleware, superAdminMiddleware, getAllUsers);
router.post('/admin', authMiddleware, superAdminMiddleware, createAdminUser);
router.put('/:id', authMiddleware, superAdminMiddleware, updateUser);
router.delete('/:id', authMiddleware, superAdminMiddleware, deleteUser);
router.post('/:id/balance', authMiddleware, superAdminMiddleware, updateUserBalance);
router.post('/:id/impersonate', authMiddleware, superAdminMiddleware, impersonateUser);

export default router;
