import express from 'express';
import { getMyInvoices, payInvoice, getAllInvoices } from './billing.controller.js';
import { authMiddleware, adminMiddleware } from '../../middleware/auth.js';

const router = express.Router();

router.get('/', authMiddleware, getMyInvoices);
router.get('/all', authMiddleware, adminMiddleware, getAllInvoices);
router.post('/:id/pay', authMiddleware, payInvoice);

export default router;
