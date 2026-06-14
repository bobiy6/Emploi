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
          content: '<h1>Bonjour {{name}},</h1><p>Merci d\'avoir rejoint Infralyonix. Nous sommes ravis de vous compter parmi nos clients.</p><p>Pour commencer à utiliser nos services, veuillez confirmer votre adresse email en cliquant sur le bouton ci-dessous :</p><p style="text-align: center;"><a href="{{verificationUrl}}" class="button">Vérifier mon compte</a></p><p>Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :<br>{{verificationUrl}}</p>',
          type: 'TRANSACTIONAL'
        },
        {
          name: 'SERVICE_READY',
          subject: 'Votre service {{productName}} est prêt',
          content: '<h1>Votre service est actif !</h1><p>Bonne nouvelle ! Votre service <strong>{{productName}}</strong> a été provisionné avec succès et est maintenant prêt à l\'emploi.</p><p>Vous pouvez gérer votre service directement depuis votre espace client.</p><p style="text-align: center;"><a href="{{dashboardUrl}}" class="button">Accéder à mon service</a></p>',
          type: 'TRANSACTIONAL'
        },
        {
          name: 'NEW_INVOICE',
          subject: 'Nouvelle facture #{{invoiceId}}',
          content: '<h1>Nouvelle facture disponible</h1><p>Une nouvelle facture d\'un montant de <strong>{{amount}}€</strong> vient d\'être générée pour votre compte.</p><p>Échéance : {{dueDate}}</p><p style="text-align: center;"><a href="{{invoiceUrl}}" class="button">Consulter la facture</a></p>',
          type: 'TRANSACTIONAL'
        },
        {
          name: 'INVOICE_PAID',
          subject: 'Paiement reçu - Facture #{{invoiceId}}',
          content: '<h1>Merci pour votre paiement !</h1><p>Nous vous confirmons la réception de votre paiement de <strong>{{amount}}€</strong> pour la facture #{{invoiceId}}.</p><p>Votre facture acquittée est disponible en pièce jointe de cet email.</p>',
          type: 'TRANSACTIONAL'
        },
        {
          name: 'INVOICE_REMINDER',
          subject: 'Rappel : Facture #{{invoiceId}} en attente',
          content: '<h1>Rappel de paiement</h1><p>Sauf erreur de notre part, votre facture #{{invoiceId}} d\'un montant de <strong>{{amount}}€</strong> est toujours en attente de règlement.</p><p>Nous vous invitons à régulariser votre situation au plus vite pour éviter toute interruption de service.</p><p style="text-align: center;"><a href="{{invoiceUrl}}" class="button">Régler ma facture</a></p>',
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
          subject: 'Ticket ouvert - #{{ticketId}}',
          content: '<h1>Confirmation d\'ouverture de ticket</h1><p>Nous avons bien reçu votre demande concernant : <strong>{{subject}}</strong>.</p><p>Un membre de notre équipe technique va l\'étudier et vous répondra dans les plus brefs délais. Votre numéro de ticket est le <strong>#{{ticketId}}</strong>.</p><p style="text-align: center;"><a href="{{ticketUrl}}" class="button">Voir mon ticket</a></p>',
          type: 'TRANSACTIONAL'
        },
        {
          name: 'TICKET_REPLY',
          subject: 'Nouvelle réponse - Ticket #{{ticketId}}',
          content: '<h1>Nouvelle réponse de notre support</h1><p>Un agent a apporté une réponse à votre ticket #{{ticketId}} ({{subject}}).</p><div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0050d7;">{{message}}</div><p style="text-align: center;"><a href="{{ticketUrl}}" class="button">Répondre au ticket</a></p>',
          type: 'TRANSACTIONAL'
        },
        {
          name: 'CREDIT_REFILL_CONFIRMATION',
          subject: 'Confirmation de rechargement - {{amount}}€',
          content: '<h1>Rechargement réussi !</h1><p>Bonjour {{name}},</p><p>Nous vous confirmons que votre compte a été crédité de <strong>{{amount}}€</strong>.</p><p>Votre nouveau solde est de <strong>{{balance}}€</strong>.</p><p>Merci de votre confiance.</p><p style="text-align: center;"><a href="{{dashboardUrl}}" class="button">Voir mon compte</a></p>',
          type: 'TRANSACTIONAL'
        },
        {
          name: 'PASSWORD_RESET',
          subject: 'Réinitialisation de votre mot de passe',
          content: '<h1>Réinitialisation de mot de passe</h1><p>Bonjour {{name}},</p><p>Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte Infralyonix.</p><p>Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe :</p><p style="text-align: center;"><a href="{{resetUrl}}" class="button">Réinitialiser mon mot de passe</a></p><p>Si vous n\'êtes pas à l\'origine de cette demande, vous pouvez ignorer cet email.</p>',
          type: 'TRANSACTIONAL'
        },
        {
          name: 'PASSWORD_CHANGED',
          subject: 'Votre mot de passe a été modifié',
          content: '<h1>Sécurité de votre compte</h1><p>Bonjour {{name}},</p><p>Nous vous informons que le mot de passe de votre compte Infralyonix a été modifié avec succès.</p><p><strong>Détails de l\'action :</strong></p><ul><li>Date : {{date}}</li><li>Adresse IP : {{ip}}</li></ul><p>Si vous n\'êtes pas à l\'origine de cette modification, nous vous recommandons de réinitialiser votre mot de passe immédiatement et de contacter notre support.</p>',
          type: 'TRANSACTIONAL'
        },
        {
          name: 'NEW_DEVICE_LOGIN',
          subject: 'Alerte de sécurité : Nouvelle connexion détectée',
          content: '<h1>Alerte de sécurité</h1><p>Bonjour {{name}},</p><p>Une connexion à votre compte vient d\'être détectée.</p><p><strong>Détails de la connexion :</strong></p><ul><li>Date et heure : {{date}}</li><li>Adresse IP : {{ip}}</li><li>Appareil : {{userAgent}}</li></ul><p>Si vous n\'êtes pas à l\'origine de cette connexion, veuillez modifier immédiatement votre mot de passe et vérifier les paramètres de sécurité de votre compte.</p>',
          type: 'TRANSACTIONAL'
        },
        {
          name: '2FA_CODE',
          subject: 'Votre code de vérification',
          content: '<h1>Vérification de sécurité</h1><p>Bonjour {{name}},</p><p>Pour finaliser votre connexion, veuillez utiliser le code de vérification suivant :</p><div style="background: #f1f5f9; padding: 20px; text-align: center; border-radius: 12px; margin: 20px 0;"><span style="font-size: 32px; font-weight: 900; letter-spacing: 5px; color: #001747;">{{code}}</span></div><p>Ce code est valable pendant 10 minutes. Ne le partagez jamais.</p>',
          type: 'TRANSACTIONAL'
        }
    ];

    for (const t of defaultTemplates) {
        await prisma.emailTemplate.upsert({
            where: { name: t.name },
            update: {
                subject: t.subject,
                content: t.content
            },
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
