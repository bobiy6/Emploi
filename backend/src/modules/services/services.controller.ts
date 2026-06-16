import { Response } from 'express';
import prisma from '../../config/prisma.js';

export const getMyServices = async (req: any, res: Response) => {
  try {
    const services = await prisma.service.findMany({
      where: { userId: req.userId },
      include: { product: true, user: { select: { email: true } } }
    });
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching services', error });
  }
};

const getServerForService = async (service: any) => {
    const serviceConfig = (service.config as any) || {};
    let serverId = serviceConfig.serverId;

    // Try to find server by ID from config
    if (serverId) {
        const server = await prisma.server.findUnique({ where: { id: parseInt(serverId) } });
        if (server) return server;
    }

    // Fallback: Try to find server by URL if externalId is JSON and has panel_url
    if (service.externalId && service.externalId.startsWith('{')) {
        try {
            const extData = JSON.parse(service.externalId);
            if (extData.panel_url) {
                const servers = await prisma.server.findMany({ where: { type: service.module.toUpperCase() } });
                const matchingServer = servers.find(s => {
                    const sUrl = s.url.replace(/\/+$/, '');
                    const pUrl = extData.panel_url.replace(/\/+$/, '');
                    return sUrl === pUrl || sUrl.includes(pUrl) || pUrl.includes(sUrl);
                });
                if (matchingServer) return matchingServer;
            }
        } catch (e) {
            console.error('Fallback server lookup error:', e);
        }
    }

    // Last resort: If there is only one server for this module, use it
    const moduleServers = await prisma.server.findMany({ where: { type: service.module.toUpperCase() } });
    if (moduleServers.length === 1) {
        return moduleServers[0];
    }

    return null;
};

export const getServiceWebsocket = async (req: any, res: Response) => {
    const { id } = req.params;
    try {
        const service = await prisma.service.findUnique({
            where: { id: parseInt(id) },
            include: { product: true }
        });
        if (!service || service.userId !== req.userId) return res.status(404).json({ message: 'Service not found' });
        if (service.module !== 'pterodactyl') return res.status(400).json({ message: 'Only Pterodactyl services support console' });

        const server = await getServerForService(service);

        if (!server) {
            return res.status(404).json({ message: 'Serveur infrastructure introuvable ou non configuré pour ce service.' });
        }

        if (!service.externalId) {
            return res.status(400).json({ message: 'ID externe Pterodactyl manquant.' });
        }

        const { getAdapter } = await import('../provisioning/provisioning.service.js');
        const adapter: any = getAdapter('pterodactyl');

        const websocketDetails = await adapter.getWebsocketDetails(service.externalId, server);
        res.json(websocketDetails);
    } catch (error: any) {
        console.error('WEBSOCKET ENDPOINT ERROR:', error.response?.data || error.message);
        const msg = error.response?.data?.errors?.[0]?.detail || error.message || 'Unknown websocket error';
        res.status(500).json({ message: msg });
    }
};

export const getServiceById = async (req: any, res: Response) => {
  const { id } = req.params;
  try {
    const service = await prisma.service.findUnique({
      where: { id: parseInt(id as string) },
      include: { product: true, user: { select: { email: true } } }
    });
    if (!service || service.userId !== req.userId) return res.status(404).json({ message: 'Service not found' });
    res.json(service);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching service', error });
  }
};

export const powerAction = async (req: any, res: Response) => {
  const { id } = req.params;
  const { action } = req.body;
  try {
    const service = await prisma.service.findUnique({
        where: { id: parseInt(id as string) },
        include: { product: true }
    });
    if (!service || service.userId !== req.userId) return res.status(404).json({ message: 'Service not found' });

    const { getAdapter } = await import('../provisioning/provisioning.service.js');
    const adapter = getAdapter(service.module);

    const server = await getServerForService(service);

    if (!server) {
        return res.status(400).json({ message: 'Could not find the infrastructure server for this service' });
    }

    if (adapter && service.externalId) {
        await adapter.powerAction(service.externalId, action, server);
    }
    res.json({ message: `Service ${action} successful` });
  } catch (error: any) {
    console.error('Power Action Error:', error.response?.data || error.message);
    const msg = error.response?.data?.errors?.[0]?.detail || error.message || 'Error performing power action';
    res.status(500).json({ message: msg });
  }
};

export const refreshServiceDetails = async (req: any, res: Response) => {
    const { id } = req.params;
    try {
        const service = await prisma.service.findUnique({
            where: { id: parseInt(id as string) },
            include: { product: true }
        });
        if (!service || service.userId !== req.userId) return res.status(404).json({ message: 'Service not found' });
        if (service.module !== 'pterodactyl') return res.status(400).json({ message: 'Only Pterodactyl services can be refreshed' });

        const server = await getServerForService(service);

        if (!server || !service.externalId) throw new Error('Incomplete service or server data');

        const { getAdapter } = await import('../provisioning/provisioning.service.js');
        const adapter: any = getAdapter('pterodactyl');

        // Use the adapter to fetch the latest details
        const details = await adapter.getLatestDetails(service.externalId, server);

        // Update service config with new details (IP, etc.)
        const serviceConfig = (service.config as any) || {};
        const updatedConfig = { ...serviceConfig, ...details };
        const updatedService = await prisma.service.update({
            where: { id: service.id },
            data: {
                externalId: JSON.stringify(details), // Ensure we update the identifier if needed
                config: updatedConfig
            },
            include: { product: true, user: { select: { email: true } } }
        });

        res.json(updatedService);
    } catch (error: any) {
        res.status(500).json({ message: 'Error refreshing service', error: error.message });
    }
};

export const adminServiceAction = async (req: any, res: Response) => {
    const { id } = req.params;
    const { action } = req.body; // 'suspend', 'unsuspend', 'terminate'
    try {
        const service = await prisma.service.findUnique({
            where: { id: parseInt(id) },
            include: { product: true }
        });
        if (!service) return res.status(404).json({ message: 'Service not found' });

        const { getAdapter } = await import('../provisioning/provisioning.service.js');
        const adapter = getAdapter(service.module);

        const server = await getServerForService(service);

        if (adapter && service.externalId && server) {
            if (action === 'suspend') {
                await adapter.suspend(service.externalId, server);
                await prisma.service.update({ where: { id: service.id }, data: { status: 'SUSPENDED' } });
            } else if (action === 'terminate') {
                await adapter.terminate(service.externalId, server);
                await prisma.$transaction([
                    prisma.log.deleteMany({ where: { serviceId: service.id } }),
                    prisma.service.delete({ where: { id: service.id } })
                ]);
                return res.json({ message: 'Service terminated and deleted' });
            } else if (action === 'unsuspend') {
                await adapter.unsuspend(service.externalId, server);
                await prisma.service.update({ where: { id: service.id }, data: { status: 'ACTIVE' } });
            }
        }

        res.json({ message: `Action ${action} completed successfully` });
    } catch (error: any) {
        console.error(`Admin Action ${action} Error:`, error.response?.data || error.message);
        res.status(500).json({ message: `Failed to ${action} service`, error: error.message });
    }
};

export const getAllServices = async (req: any, res: Response) => {
  try {
    const services = await prisma.service.findMany({
      include: { user: { select: { name: true, email: true } }, product: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching all services', error });
  }
};
