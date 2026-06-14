import express from 'express';
import { register, login, getProfile, updateProfile, unsubscribe, verifyEmail, forgotPassword, resetPassword, verify2FA } from './auth.controller.js';
import { authMiddleware } from '../../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/verify-2fa', verify2FA);
router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, updateProfile);
router.post('/verify-email', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/unsubscribe', unsubscribe);

export default router;
