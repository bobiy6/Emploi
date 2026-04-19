import express from 'express';
import { getSystemSettings, updateSystemSetting, testStripeConnection } from './settings.controller.js';
import { authMiddleware, adminMiddleware } from '../../middleware/auth.js';

const router = express.Router();

router.get('/', authMiddleware, getSystemSettings);
router.post('/', authMiddleware, adminMiddleware, updateSystemSetting);
router.post('/test-stripe', authMiddleware, adminMiddleware, testStripeConnection);

export default router;
