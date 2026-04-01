import express from 'express';
import { getMyInvoices, payInvoice } from './billing.controller.js';
import { authMiddleware } from '../../middleware/auth.js';

const router = express.Router();

router.get('/', authMiddleware, getMyInvoices);
router.post('/:id/pay', authMiddleware, payInvoice);

export default router;
