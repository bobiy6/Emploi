import nodemailer from 'nodemailer';
import handlebars from 'handlebars';
import { Queue } from 'bullmq';
import { Redis } from 'ioredis';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const redisConnection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: null,
});

export const emailQueue = new Queue('email-queue', {
    connection: redisConnection,
});

export interface EmailOptions {
    to: string;
    subject: string;
    templateName: string;
    context: any;
    isMarketing?: boolean;
    delay?: number;
}

export const sendEmail = async (options: EmailOptions) => {
    await emailQueue.add('send-email', options, {
        attempts: 3,
        delay: options.delay || 0,
        backoff: {
            type: 'exponential',
            delay: 1000,
        },
    });
};

export const getTransporter = async () => {
    const smtpSetting = await prisma.systemSetting.findUnique({
        where: { key: 'smtp_config' }
    });

    if (!smtpSetting) {
        throw new Error('SMTP configuration not found');
    }

    const config = smtpSetting.value as any;

    return nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.secure,
        auth: {
            user: config.user,
            pass: config.pass,
        },
    });
};

export const renderTemplate = async (templateName: string, context: any) => {
    const template = await prisma.emailTemplate.findUnique({
        where: { name: templateName }
    });

    if (!template) {
        // Fallback or error
        throw new Error(`Email template ${templateName} not found`);
    }

    const compiledTemplate = handlebars.compile(template.content);
    return {
        subject: handlebars.compile(template.subject)(context),
        html: compiledTemplate(context),
    };
};
