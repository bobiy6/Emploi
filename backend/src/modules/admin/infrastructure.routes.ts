import express from 'express';
import { getAllServers, createServer, updateServer, deleteServer, testServerConnection, testRawConnection } from './infrastructure.controller.js';
import { authMiddleware, adminMiddleware } from '../../middleware/auth.js';

const router = express.Router();

router.get('/', authMiddleware, adminMiddleware, getAllServers);
router.post('/', authMiddleware, adminMiddleware, createServer);
router.put('/:id', authMiddleware, adminMiddleware, updateServer);
router.delete('/:id', authMiddleware, adminMiddleware, deleteServer);
router.post('/test-raw', authMiddleware, adminMiddleware, testRawConnection);
router.post('/:id/test', authMiddleware, adminMiddleware, testServerConnection);

export default router;
