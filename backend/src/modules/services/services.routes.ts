import express from 'express';
import { getMyServices, getServiceById, powerAction, getAllServices, refreshServiceDetails, adminServiceAction } from './services.controller.js';
import { authMiddleware, adminMiddleware } from '../../middleware/auth.js';

const router = express.Router();

router.get('/', authMiddleware, getMyServices);
router.get('/all', authMiddleware, adminMiddleware, getAllServices);
router.get('/:id', authMiddleware, getServiceById);
router.post('/:id/power', authMiddleware, powerAction);
router.get('/:id/websocket', authMiddleware, async (req: any, res: any) => {
    const { getServiceWebsocket } = await import('./services.controller.js');
    return getServiceWebsocket(req, res);
});
router.post('/:id/refresh', authMiddleware, refreshServiceDetails);
router.post('/:id/admin-action', authMiddleware, adminMiddleware, adminServiceAction);

export default router;
