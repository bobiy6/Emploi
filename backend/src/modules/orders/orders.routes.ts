import express from 'express';
import { createOrder, getMyOrders, getAllOrders } from './orders.controller.js';
import { authMiddleware, adminMiddleware } from '../../middleware/auth.js';

const router = express.Router();

router.get('/', authMiddleware, getMyOrders);
router.post('/', authMiddleware, createOrder);
router.get('/all', authMiddleware, adminMiddleware, getAllOrders);

export default router;
