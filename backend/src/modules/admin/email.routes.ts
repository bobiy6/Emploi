import { Router, Response } from 'express';
import prisma from '../../config/prisma.js';
import { authMiddleware, adminMiddleware } from '../../middleware/auth.js';
import { getTransporter, sendEmail } from '../../services/email.service.js';

const router = Router();

// --- SMTP SETTINGS ---
router.get('/settings', authMiddleware, adminMiddleware, async (req, res) => {
    const setting = await prisma.systemSetting.findUnique({ where: { key: 'smtp_config' } });
    res.json(setting?.value || {});
});

router.post('/settings', authMiddleware, adminMiddleware, async (req, res) => {
    const value = req.body;
    await prisma.systemSetting.upsert({
        where: { key: 'smtp_config' },
        update: { value },
        create: { key: 'smtp_config', value }
    });
    res.json({ message: 'SMTP settings updated' });
});

router.post('/settings/test', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const transporter = await getTransporter();
        await transporter.verify();
        res.json({ message: 'SMTP connection successful' });
    } catch (error: any) {
        res.status(500).json({ message: 'SMTP connection failed', error: error.message });
    }
});

// --- TEMPLATES ---
router.get('/templates', authMiddleware, adminMiddleware, async (req, res) => {
    const templates = await prisma.emailTemplate.findMany();
    res.json(templates);
});

router.post('/templates', authMiddleware, adminMiddleware, async (req, res) => {
    const { name, subject, content, type } = req.body;
    const template = await prisma.emailTemplate.create({
        data: { name, subject, content, type }
    });
    res.json(template);
});

router.put('/templates/:id', authMiddleware, adminMiddleware, async (req, res) => {
    const { name, subject, content, type } = req.body;
    const template = await prisma.emailTemplate.update({
        where: { id: parseInt(req.params.id) },
        data: { name, subject, content, type }
    });
    res.json(template);
});

router.delete('/templates/:id', authMiddleware, adminMiddleware, async (req, res) => {
    await prisma.emailTemplate.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'Template deleted' });
});

// --- CAMPAIGNS ---
router.get('/campaigns', authMiddleware, adminMiddleware, async (req, res) => {
    const campaigns = await prisma.emailCampaign.findMany();
    res.json(campaigns);
});

router.post('/campaigns', authMiddleware, adminMiddleware, async (req, res) => {
    const { name, templateId, target } = req.body;
    const campaign = await prisma.emailCampaign.create({
        data: { name, templateId, target, status: 'DRAFT' }
    });
    res.json(campaign);
});

router.post('/campaigns/:id/send', authMiddleware, adminMiddleware, async (req, res) => {
    const campaign = await prisma.emailCampaign.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!campaign) return res.status(404).json({ message: 'Campaign not found' });

    const template = await prisma.emailTemplate.findUnique({ where: { id: campaign.templateId } });
    if (!template) return res.status(404).json({ message: 'Template not found' });

    // Target filtering
    let users: any[] = [];
    if (campaign.target === 'ALL') {
        users = await prisma.user.findMany({ where: { unsubscribed: false } });
    } else if (campaign.target === 'ACTIVE_SERVICES') {
        users = await prisma.user.findMany({
            where: { unsubscribed: false, services: { some: { status: 'ACTIVE' } } }
        });
    } else if (campaign.target === 'NO_SERVICES') {
        users = await prisma.user.findMany({
            where: { unsubscribed: false, services: { none: {} } }
        });
    }

    // Planification
    let delay = 0;
    if (campaign.scheduledAt) {
        delay = Math.max(0, new Date(campaign.scheduledAt).getTime() - Date.now());
    }

    // Queue emails
    for (const user of users) {
        sendEmail({
            to: user.email,
            subject: template.subject, // Template engine handles context
            templateName: template.name,
            context: {
                name: user.name,
                unsubscribeUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/unsubscribe?email=${encodeURIComponent(user.email)}`
            },
            isMarketing: true,
            delay
        });
    }

    await prisma.emailCampaign.update({
        where: { id: campaign.id },
        data: { status: 'SENT' }
    });

    res.json({ message: `Campaign queued for ${users.length} users` });
});

export default router;
