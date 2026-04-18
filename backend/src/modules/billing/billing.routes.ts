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

router.post('/create-checkout-session', authMiddleware, async (req: any, res: any) => {
    const { amount } = req.body; // Requested CREDITS
    const stripe = (await import('stripe')).default;
    const prisma = (await import('../../config/prisma.js')).default;
    const { createLog } = await import('../../utils/logger.js');

    const [stripeSettings, creditSettings] = await Promise.all([
        prisma.systemSetting.findUnique({ where: { key: 'stripe' } }),
        prisma.systemSetting.findUnique({ where: { key: 'credit_config' } })
    ]);

    const stripeConfig = stripeSettings?.value as any;
    const creditConfig = creditSettings?.value as any || { min: 5, max: 500, pricePerCredit: 1.0 };

    if (!stripeConfig?.secretKey) return res.status(500).json({ message: 'Stripe not configured' });

    const requestedCredits = parseFloat(amount);
    if (isNaN(requestedCredits) || requestedCredits < creditConfig.min || requestedCredits > creditConfig.max) {
        return res.status(400).json({ message: `Amount must be between ${creditConfig.min} and ${creditConfig.max} credits.` });
    }

    const finalEurAmount = requestedCredits * creditConfig.pricePerCredit;
    const stripeInstance = new stripe(stripeConfig.secretKey);

    try {
        const session = await stripeInstance.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'eur',
                    product_data: {
                        name: `${requestedCredits} Credits - Infralyonix Balance`,
                        description: 'Top up your account balance to pay for hosting services.',
                    },
                    unit_amount: Math.round(finalEurAmount * 100),
                },
                quantity: 1,
            }],
            mode: 'payment',
            success_url: `${req.headers.origin}/billing?success=true`,
            cancel_url: `${req.headers.origin}/billing?canceled=true`,
            metadata: {
                userId: req.userId.toString(),
                credits: requestedCredits.toString()
            }
        });

        await createLog({
            type: 'BILLING',
            level: 'INFO',
            message: `User created a checkout session for ${requestedCredits} credits.`,
            userId: req.userId,
            details: { sessionId: session.id, amountEur: finalEurAmount }
        });

        res.json({ url: session.url });
    } catch (err: any) {
        console.error('STRIPE SESSION ERROR:', err);
        res.status(500).json({ message: 'Failed to create Stripe session', error: err.message });
    }
});

export default router;
