import { Worker, Job } from 'bullmq';
import { Redis } from 'ioredis';
import { getTransporter, renderTemplate, EmailOptions } from './email.service.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
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
            const from = (smtpSetting?.value as any)?.from || 'noreply@infralyonix.com';

            await transporter.sendMail({
                from,
                to,
                subject,
                html,
            });

            console.log(`Email sent successfully to ${to} [Template: ${templateName}]`);
        } catch (error) {
            console.error(`Failed to send email to ${to}:`, error);
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
