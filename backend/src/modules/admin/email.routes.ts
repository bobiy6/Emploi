import { Router, Response } from 'express';
import prisma from '../../config/prisma.js';
import { adminMiddleware } from '../../middleware/auth.js';
import { getTransporter, sendEmail } from '../../services/email.service.js';

const router = Router();

// --- SMTP SETTINGS ---
router.get('/settings', adminMiddleware, async (req, res) => {
    const setting = await prisma.systemSetting.findUnique({ where: { key: 'smtp_config' } });
    res.json(setting?.value || {});
});

router.post('/settings', adminMiddleware, async (req, res) => {
    const value = req.body;
    await prisma.systemSetting.upsert({
        where: { key: 'smtp_config' },
        update: { value },
        create: { key: 'smtp_config', value }
    });
    res.json({ message: 'SMTP settings updated' });
});

router.post('/settings/test', adminMiddleware, async (req, res) => {
    try {
        const transporter = await getTransporter();
        await transporter.verify();
        res.json({ message: 'SMTP connection successful' });
    } catch (error: any) {
        res.status(500).json({ message: 'SMTP connection failed', error: error.message });
    }
});

// --- TEMPLATES ---
router.get('/templates', adminMiddleware, async (req, res) => {
    const templates = await prisma.emailTemplate.findMany();
    res.json(templates);
});

router.post('/templates', adminMiddleware, async (req, res) => {
    const { name, subject, content, type } = req.body;
    const template = await prisma.emailTemplate.create({
        data: { name, subject, content, type }
    });
    res.json(template);
});

router.put('/templates/:id', adminMiddleware, async (req, res) => {
    const { name, subject, content, type } = req.body;
    const template = await prisma.emailTemplate.update({
        where: { id: parseInt(req.params.id) },
        data: { name, subject, content, type }
    });
    res.json(template);
});

router.delete('/templates/:id', adminMiddleware, async (req, res) => {
    await prisma.emailTemplate.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'Template deleted' });
});

// --- CAMPAIGNS ---
router.get('/campaigns', adminMiddleware, async (req, res) => {
    const campaigns = await prisma.emailCampaign.findMany();
    res.json(campaigns);
});

router.post('/campaigns', adminMiddleware, async (req, res) => {
    const { name, templateId, target } = req.body;
    const campaign = await prisma.emailCampaign.create({
        data: { name, templateId, target, status: 'DRAFT' }
    });
    res.json(campaign);
});

router.post('/campaigns/:id/send', adminMiddleware, async (req, res) => {
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

    // Queue emails
    for (const user of users) {
        await sendEmail({
            to: user.email,
            subject: template.subject, // Template engine handles context
            templateName: template.name,
            context: { name: user.name },
            isMarketing: true
        });
    }

    await prisma.emailCampaign.update({
        where: { id: campaign.id },
        data: { status: 'SENT' }
    });

    res.json({ message: `Campaign queued for ${users.length} users` });
});

export default router;
