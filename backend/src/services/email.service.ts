import nodemailer from 'nodemailer';
import handlebars from 'handlebars';
import { Queue } from 'bullmq';
import { Redis } from 'ioredis';
import prisma from '../config/prisma.js';
const redisConnection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: null,
    connectTimeout: 5000,
    reconnectOnError: (err) => {
        const targetError = 'READONLY';
        if (err.message.includes(targetError)) {
            return true;
        }
        return false;
    },
});

redisConnection.on('error', (err) => {
    console.error('[REDIS ERROR]:', err.message);
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
    try {
        await emailQueue.add('send-email', options, {
            attempts: 3,
            delay: options.delay || 0,
            backoff: {
                type: 'exponential',
                delay: 1000,
            },
        });
    } catch (error) {
        console.error('[EMAIL QUEUE ERROR]:', error);
        // Do not throw to prevent breaking the main request flow
    }
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
