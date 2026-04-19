import express from 'express';
import { register, login, getProfile, updateProfile, unsubscribe } from './auth.controller.js';
import { authMiddleware } from '../../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, updateProfile);
router.post('/unsubscribe', unsubscribe);

export default router;
