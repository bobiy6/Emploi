import express from 'express';
import { getMyServices, getServiceById, powerAction } from './services.controller.js';
import { authMiddleware } from '../../middleware/auth.js';

const router = express.Router();

router.get('/', authMiddleware, getMyServices);
router.get('/:id', authMiddleware, getServiceById);
router.post('/:id/power', authMiddleware, powerAction);

export default router;
