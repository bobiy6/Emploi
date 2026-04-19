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

        // If an email is provided in body, send a test email
        if (req.body.testEmail) {
            const smtpSetting = await prisma.systemSetting.findUnique({ where: { key: 'smtp_config' } });
            const from = (smtpSetting?.value as any)?.from || 'Infralyonix <noreply@infralyonix.com>';

            await transporter.sendMail({
                from,
                to: req.body.testEmail,
                subject: 'Email de test Infralyonix',
                html: '<h1>Ceci est un test</h1><p>Si vous recevez cet email, votre configuration SMTP est correcte.</p>'
            });
            return res.json({ message: `SMTP connection successful and test email sent to ${req.body.testEmail}` });
        }

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

router.post('/templates/sync', authMiddleware, adminMiddleware, async (req, res) => {
    const defaultTemplates = [
        {
          name: 'WELCOME_VERIFICATION',
          subject: 'Bienvenue chez Infralyonix !',
          content: '<h1>Bonjour {{name}}</h1><p>Merci de vous être inscrit. Veuillez vérifier votre email en cliquant ici : <a href="{{verificationUrl}}">{{verificationUrl}}</a></p>',
          type: 'TRANSACTIONAL'
        },
        {
          name: 'SERVICE_READY',
          subject: 'Votre service {{productName}} est prêt',
          content: '<h1>Bonne nouvelle !</h1><p>Votre service {{productName}} a été provisionné avec succès.</p><p>ID externe : {{externalId}}</p>',
          type: 'TRANSACTIONAL'
        },
        {
          name: 'NEW_INVOICE',
          subject: 'Nouvelle facture #{{invoiceId}}',
          content: '<h1>Nouvelle facture</h1><p>Une nouvelle facture de {{amount}}€ a été générée. Date limite : {{dueDate}}</p>',
          type: 'TRANSACTIONAL'
        },
        {
          name: 'INVOICE_PAID',
          subject: 'Facture #{{invoiceId}} payée',
          content: '<h1>Merci !</h1><p>Votre paiement de {{amount}}€ pour la facture #{{invoiceId}} a bien été reçu.</p>',
          type: 'TRANSACTIONAL'
        },
        {
          name: 'INVOICE_REMINDER',
          subject: 'Rappel : Facture #{{invoiceId}} impayée',
          content: '<h1>Rappel</h1><p>Votre facture #{{invoiceId}} est toujours en attente de paiement ({{amount}}€).</p>',
          type: 'TRANSACTIONAL'
        },
        {
          name: 'SERVICE_SUSPENDED',
          subject: 'Service suspendu : {{productName}}',
          content: '<h1>Service suspendu</h1><p>Votre service {{productName}} a été suspendu faute de paiement.</p>',
          type: 'TRANSACTIONAL'
        },
        {
          name: 'SERVICE_TERMINATED',
          subject: 'Service supprimé : {{productName}}',
          content: '<h1>Service supprimé</h1><p>Votre service {{productName}} a été définitivement supprimé.</p>',
          type: 'TRANSACTIONAL'
        },
        {
          name: 'TICKET_CREATED',
          subject: 'Ticket reçu : {{subject}}',
          content: '<h1>Ticket ouvert</h1><p>Nous avons bien reçu votre ticket #{{ticketId}} : {{subject}}</p>',
          type: 'TRANSACTIONAL'
        },
        {
          name: 'TICKET_REPLY',
          subject: 'Réponse à votre ticket : {{subject}}',
          content: '<h1>Nouvelle réponse</h1><p>Un agent a répondu à votre ticket #{{ticketId}}.</p><hr><p>{{message}}</p>',
          type: 'TRANSACTIONAL'
        }
    ];

    for (const t of defaultTemplates) {
        await prisma.emailTemplate.upsert({
            where: { name: t.name },
            update: {},
            create: t
        });
    }

    res.json({ message: 'Default templates synchronized' });
});

router.get('/logs', authMiddleware, adminMiddleware, async (req, res) => {
    const logs = await prisma.log.findMany({
        where: { OR: [{ message: { contains: 'Email' } }, { type: 'API', message: { contains: 'Email' } }] },
        orderBy: { createdAt: 'desc' },
        take: 50,
        include: { user: { select: { name: true, email: true } } }
    });
    res.json(logs);
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
