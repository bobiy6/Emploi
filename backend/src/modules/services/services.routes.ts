import express from 'express';
import { getMyServices, getServiceById, powerAction, getAllServices, refreshServiceDetails } from './services.controller.js';
import { authMiddleware, adminMiddleware } from '../../middleware/auth.js';

const router = express.Router();

router.get('/', authMiddleware, getMyServices);
router.get('/all', authMiddleware, adminMiddleware, getAllServices);
router.get('/:id', authMiddleware, getServiceById);
router.post('/:id/power', authMiddleware, powerAction);
router.post('/:id/refresh', authMiddleware, refreshServiceDetails);

export default router;
