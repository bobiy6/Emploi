import express from 'express';
import { register, login, getProfile } from './auth.controller.js';
import { authMiddleware } from '../../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', authMiddleware, getProfile);

export default router;
