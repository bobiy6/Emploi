import { Worker, Job } from 'bullmq';
import { Redis } from 'ioredis';
import { getTransporter, renderTemplate, EmailOptions } from './email.service.js';
import prisma from '../config/prisma.js';
import { createLog } from '../utils/logger.js';
const redisConnection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: null,
});

export const emailWorker = new Worker(
    'email-queue',
    async (job: Job<EmailOptions>) => {
        const { to, templateName, context, isMarketing } = job.data;

        try {
            // Check if user is unsubscribed for marketing emails
            if (isMarketing) {
                const user = await prisma.user.findUnique({ where: { email: to } });
                if (user?.unsubscribed) {
                    console.log(`Skipping marketing email for unsubscribed user: ${to}`);
                    return;
                }
            }

            const { subject, html } = await renderTemplate(templateName, context);
            const transporter = await getTransporter();

            const smtpSetting = await prisma.systemSetting.findUnique({
                where: { key: 'smtp_config' }
            });
            const from = (smtpSetting?.value as any)?.from || 'Infralyonix <noreply@infralyonix.com>';

            await transporter.sendMail({
                from,
                to,
                subject,
                html,
                attachments: job.data.attachments,
            });

            await createLog({
                type: 'EMAIL',
                level: 'INFO',
                message: `Email sent successfully: ${to} [${templateName}]`,
                details: { subject, to, templateName, status: 'DELIVERED' }
            });

            console.log(`[EMAIL] Successfully sent to ${to} using template ${templateName}`);
        } catch (error: any) {
            console.error(`[EMAIL ERROR] Failed to send to ${to}:`, error);
            await createLog({
                type: 'EMAIL',
                level: 'ERROR',
                message: `Failed to send email: ${to} [${templateName}]`,
                details: { error: error.message, to, templateName, status: 'FAILED' }
            });
            throw error;
        }
    },
    {
        connection: redisConnection,
    }
);

emailWorker.on('completed', (job) => {
    console.log(`[EMAIL WORKER] Job ${job.id} (${job.data.templateName}) completed`);
});

emailWorker.on('failed', (job, err) => {
    console.error(`[EMAIL WORKER] Job ${job?.id} failed: ${err.message}`);
});
