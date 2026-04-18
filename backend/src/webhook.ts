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

    if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;
        const userId = parseInt(paymentIntent.metadata.userId);

        // Use the 'credits' metadata if available, fallback to EUR amount
        const credits = paymentIntent.metadata.credits
            ? parseFloat(paymentIntent.metadata.credits)
            : (paymentIntent.amount / 100);

        await prisma.user.update({
            where: { id: userId },
            data: { balance: { increment: credits } }
        });

        console.log(`[STRIPE] Added ${credits} credits to user ${userId}`);
    }

    res.json({ received: true });
});

export default router;
