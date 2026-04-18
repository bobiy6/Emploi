import prisma from '../config/prisma.js';
import { getAdapter } from '../modules/provisioning/provisioning.service.js';
import { createLog } from '../utils/logger.js';

export const startAutomation = () => {
    console.log('[AUTOMATION] Starting lifecycle service...');

    // Run every hour
    setInterval(async () => {
        await checkExpiredServices();
    }, 60 * 60 * 1000);

    // Run once at startup
    checkExpiredServices();
};

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

                await prisma.service.update({
                    where: { id: service.id },
                    data: { status: 'SUSPENDED' }
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
            }
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

                await prisma.service.update({
                    where: { id: service.id },
                    data: { status: 'TERMINATED' }
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
