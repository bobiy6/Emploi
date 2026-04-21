import prisma from '../config/prisma.js';
import { getAdapter } from '../modules/provisioning/provisioning.service.js';
import { createLog } from '../utils/logger.js';
import { sendEmail } from './email.service.js';

export const startAutomation = () => {
    console.log('[AUTOMATION] Starting lifecycle service...');

    // Run every hour
    setInterval(async () => {
        await checkExpiredServices();
        await checkUnpaidInvoices();
    }, 60 * 60 * 1000);

    // Run once at startup
    checkExpiredServices();
    checkUnpaidInvoices();
};

async function checkUnpaidInvoices() {
    console.log('[AUTOMATION] Checking for unpaid invoices...');
    const now = new Date();
    const threeDaysAgo = new Date(now);
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    try {
        const pendingInvoices = await prisma.invoice.findMany({
            where: {
                status: 'UNPAID',
                createdAt: { lte: threeDaysAgo },
            },
            include: { user: true }
        });

        for (const invoice of pendingInvoices) {
            try {
                sendEmail({
                    to: invoice.user.email,
                    subject: `Rappel : Votre facture #${invoice.id} est en attente de paiement`,
                    templateName: 'INVOICE_REMINDER',
                    context: {
                        name: invoice.user.name,
                        invoiceId: invoice.id,
                        amount: invoice.amount
                    }
                });
            } catch (error) {
                console.error(`Failed to send reminder for invoice ${invoice.id}:`, error);
            }
        }
    } catch (err: any) {
        console.error('[AUTOMATION] Error checking unpaid invoices:', err.message);
    }
}

async function checkExpiredServices() {
    const now = new Date();

    try {
        // 1. Find services that should be suspended (nextDueDate passed and still ACTIVE)
        const toSuspend = await prisma.service.findMany({
            where: {
                status: 'ACTIVE',
                nextDueDate: { lt: now }
            }
        });

        for (const service of toSuspend) {
            try {
                const adapter = getAdapter(service.module);
                const config = (service.config as any) || {};

                let server = null;
                if (config.serverId) {
                    server = await prisma.server.findUnique({ where: { id: parseInt(config.serverId) } });
                }

                if (!server) {
                    const { getBestServer } = await import('../modules/provisioning/provisioning.service.js');
                    const product = await prisma.product.findUnique({ where: { id: service.productId } });
                    if (product) server = await getBestServer(product.type);
                }

                if (adapter && server && service.externalId) {
                    await adapter.suspend(service.externalId, server);
                }

                const updatedService = await prisma.service.update({
                    where: { id: service.id },
                    data: { status: 'SUSPENDED' },
                    include: { user: true, product: true }
                });

                // Send Suspension Email
                sendEmail({
                    to: updatedService.user.email,
                    subject: `Suspension de votre service : ${updatedService.product.name}`,
                    templateName: 'SERVICE_SUSPENDED',
                    context: {
                        name: updatedService.user.name,
                        productName: updatedService.product.name,
                        serviceId: updatedService.id
                    }
                });

                await createLog({
                    type: 'SERVICE',
                    level: 'WARN',
                    message: `Service #${service.id} suspended due to expiration.`,
                    userId: service.userId,
                    serviceId: service.id
                });

                console.log(`[AUTOMATION] Suspended service #${service.id}`);
            } catch (err: any) {
                console.error(`[AUTOMATION] Failed to suspend service #${service.id}:`, err.message);
            }
        }

        // 2. Find services that should be terminated (SUSPENDED for more than 3 days)
        const threeDaysAgo = new Date(now);
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

        const toTerminate = await prisma.service.findMany({
            where: {
                status: 'SUSPENDED',
                nextDueDate: { lt: threeDaysAgo }
            },
            include: { user: true, product: true }
        });

        for (const service of toTerminate) {
            try {
                const adapter = getAdapter(service.module);
                const config = (service.config as any) || {};

                let server = null;
                if (config.serverId) {
                    server = await prisma.server.findUnique({ where: { id: parseInt(config.serverId) } });
                }

                if (!server) {
                    const { getBestServer } = await import('../modules/provisioning/provisioning.service.js');
                    const product = await prisma.product.findUnique({ where: { id: service.productId } });
                    if (product) server = await getBestServer(product.type);
                }

                if (adapter && server && service.externalId) {
                    await adapter.terminate(service.externalId, server);
                }

                // Perform deletion after adapter call
                await prisma.$transaction([
                    prisma.log.deleteMany({ where: { serviceId: service.id } }),
                    prisma.service.delete({ where: { id: service.id } })
                ]);

                // Send Termination Email (use original service record as updatedService no longer exists)
                sendEmail({
                    to: (service as any).user.email,
                    subject: `Suppression de votre service : ${(service as any).product.name}`,
                    templateName: 'SERVICE_TERMINATED',
                    context: {
                        name: (service as any).user.name,
                        productName: (service as any).product.name,
                        serviceId: service.id
                    }
                });

                await createLog({
                    type: 'SERVICE',
                    level: 'ERROR',
                    message: `Service #${service.id} terminated after 3 days of suspension.`,
                    userId: service.userId,
                    serviceId: service.id
                });

                console.log(`[AUTOMATION] Terminated service #${service.id}`);
            } catch (err: any) {
                console.error(`[AUTOMATION] Failed to terminate service #${service.id}:`, err.message);
            }
        }
    } catch (error: any) {
        console.error('[AUTOMATION] Error in lifecycle check:', error.message);
    }
}
