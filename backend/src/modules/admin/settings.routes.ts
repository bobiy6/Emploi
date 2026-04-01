import express from 'express';
import { getSystemSettings, updateSystemSetting } from './settings.controller.js';
import { authMiddleware, adminMiddleware } from '../../middleware/auth.js';

const router = express.Router();

router.get('/', authMiddleware, adminMiddleware, getSystemSettings);
router.post('/', authMiddleware, adminMiddleware, updateSystemSetting);

export default router;
