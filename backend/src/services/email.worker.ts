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
            });

            await createLog({
                type: 'API',
                level: 'INFO',
                message: `Email sent to ${to} [${templateName}]`,
                details: { subject, to, templateName }
            });

            console.log(`Email sent successfully to ${to} [Template: ${templateName}]`);
        } catch (error: any) {
            console.error(`Failed to send email to ${to}:`, error);
            await createLog({
                type: 'ERROR',
                level: 'ERROR',
                message: `Failed to send email to ${to} [${templateName}]`,
                details: { error: error.message }
            });
            throw error;
        }
    },
    {
        connection: redisConnection,
    }
);

emailWorker.on('completed', (job) => {
    console.log(`Job ${job.id} completed successfully`);
});

emailWorker.on('failed', (job, err) => {
    console.error(`Job ${job?.id} failed with error: ${err.message}`);
});
