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
    attachments?: {
        filename: string;
        content: any;
        contentType?: string;
    }[];
}

export const sendEmail = async (options: EmailOptions) => {
    try {
        const job = await emailQueue.add('send-email', options, {
            attempts: 5, // Increased attempts for reliability
            delay: options.delay || 0,
            removeOnComplete: true, // Keep DB clean
            removeOnFail: false, // Keep failed for manual retry/analysis
            backoff: {
                type: 'exponential',
                delay: 5000, // Longer initial delay for rate limits
            },
        });
        console.log(`[EMAIL] Enqueued job ${job.id} for ${options.to} [${options.templateName}]`);
    } catch (error) {
        console.error('[EMAIL QUEUE ERROR]:', error);
        // Fallback: log to DB immediately if queue fails
        const { createLog } = await import('../utils/logger.js');
        createLog({
            type: 'EMAIL',
            level: 'ERROR',
            message: `Queue failure: Could not enqueue email for ${options.to}`,
            details: { error: (error as Error).message, options }
        });
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

const baseLayout = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f7f9; }
        .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
        .header { background-color: #001747; padding: 30px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 1px; }
        .content { padding: 40px; }
        .footer { background-color: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
        .button { display: inline-block; padding: 12px 30px; background-color: #0050d7; color: #ffffff !important; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 20px; }
        .footer a { color: #0050d7; text-decoration: none; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>INFRALYONIX</h1>
        </div>
        <div class="content">
            {{{content}}}
        </div>
        <div class="footer">
            <p>&copy; {{year}} Infralyonix. Tous droits réservés.</p>
            <p>Infrastructure & Cloud Services Haute Performance</p>
            <p><a href="{{unsubscribeUrl}}">Se désabonner</a></p>
        </div>
    </div>
</body>
</html>
`;

export const renderTemplate = async (templateName: string, context: any) => {
    const template = await prisma.emailTemplate.findUnique({
        where: { name: templateName }
    });

    if (!template) {
        console.error(`[CRITICAL] Email template ${templateName} not found in database.`);
        return {
            subject: `Info - ${templateName}`,
            html: `<h1>Infralyonix</h1><p>${JSON.stringify(context)}</p>`
        };
    }

    const currentYear = new Date().getFullYear();
    const extendedContext = { ...context, year: currentYear };

    const bodyCompiled = handlebars.compile(template.content)(extendedContext);
    const fullHtml = handlebars.compile(baseLayout)({ ...extendedContext, content: bodyCompiled });

    return {
        subject: handlebars.compile(template.subject)(extendedContext),
        html: fullHtml,
    };
};
