import express from 'express';
import { getMyInvoices, payInvoice, getAllInvoices, downloadInvoicePDF } from './billing.controller.js';
import { authMiddleware, adminMiddleware } from '../../middleware/auth.js';

const router = express.Router();

router.get('/', authMiddleware, getMyInvoices);
router.get('/all', authMiddleware, adminMiddleware, getAllInvoices);
router.get('/:id/download', authMiddleware, downloadInvoicePDF);
router.post('/:id/pay', authMiddleware, payInvoice);
router.get('/config', authMiddleware, async (req: any, res: any) => {
    const prisma = (await import('../../config/prisma.js')).default;
    const settings = await prisma.systemSetting.findUnique({ where: { key: 'stripe' } });
    const config = settings?.value as any;
    res.json({ publicKey: config?.publicKey });
});

router.post('/create-payment-intent', authMiddleware, async (req: any, res: any) => {
    const { amount } = req.body;
    const stripe = (await import('stripe')).default;
    const prisma = (await import('../../config/prisma.js')).default;
    const settings = await prisma.systemSetting.findUnique({ where: { key: 'stripe' } });
    const stripeConfig = settings?.value as any;

    if (!stripeConfig?.secretKey) return res.status(500).json({ message: 'Stripe not configured' });

    const stripeInstance = new stripe(stripeConfig.secretKey);
    const intent = await stripeInstance.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: 'eur',
        metadata: { userId: req.userId }
    });
    res.json({ clientSecret: intent.client_secret });
});

export default router;
