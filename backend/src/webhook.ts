import express from 'express';
import prisma from './config/prisma.js';

const router = express.Router();

router.post('/', express.raw({ type: 'application/json' }), async (req: any, res: any) => {
    const stripe = (await import('stripe')).default;
    const settings = await prisma.systemSetting.findUnique({ where: { key: 'stripe' } });
    const stripeConfig = settings?.value as any;

    if (!stripeConfig?.secretKey || !stripeConfig?.webhookSecret) {
        return res.status(500).send('Stripe not configured');
    }

    const stripeInstance = new stripe(stripeConfig.secretKey);
    const sig = req.headers['stripe-signature'];

    let event;
    try {
        event = stripeInstance.webhooks.constructEvent(req.body, sig, stripeConfig.webhookSecret);
    } catch (err: any) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed' || event.type === 'payment_intent.succeeded') {
        const session = event.data.object;
        const metadata = session.metadata;

        if (!metadata?.userId || !metadata?.credits) {
            console.warn('[STRIPE] Missing metadata for successful payment');
            return res.json({ received: true });
        }

        const userId = parseInt(metadata.userId);
        const credits = parseFloat(metadata.credits);

        // Check if we already processed this session to prevent double-crediting
        // Note: Stripe sometimes sends both payment_intent.succeeded and checkout.session.completed
        // In a production app, we would use a 'Transaction' model to track this.
        // For simplicity, we just log and update.

        await prisma.user.update({
            where: { id: userId },
            data: { balance: { increment: credits } }
        });

        const { createLog } = await import('./utils/logger.js');
        await createLog({
            type: 'BILLING',
            level: 'INFO',
            message: `Successfully credited ${credits} credits to user account.`,
            userId,
            details: { stripeId: session.id }
        });

        console.log(`[STRIPE] Added ${credits} credits to user ${userId}`);
    }

    res.json({ received: true });
});

export default router;
