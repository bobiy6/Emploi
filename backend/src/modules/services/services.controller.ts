import { Response } from 'express';
import prisma from '../../config/prisma.js';

export const getMyServices = async (req: any, res: Response) => {
  try {
    const services = await prisma.service.findMany({
      where: { userId: req.userId },
      include: { product: true }
    });
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching services', error });
  }
};

export const getServiceById = async (req: any, res: Response) => {
  const { id } = req.params;
  try {
    const service = await prisma.service.findUnique({
      where: { id: parseInt(id as string) },
      include: { product: true }
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

    const serviceConfig = (service.config as any) || {};
    const serverId = serviceConfig.serverId;

    const { getAdapter } = await import('../provisioning/provisioning.service.js');
    const adapter = getAdapter(service.module);

    let server = null;
    if (serverId) {
        server = await prisma.server.findUnique({ where: { id: parseInt(serverId) } });
    }

    if (!server) {
        return res.status(400).json({ message: 'Could not find the original server for this service' });
    }

    if (adapter && service.externalId) {
        await adapter.powerAction(service.externalId, action, server);
    }
    res.json({ message: `Service ${action} successful` });
  } catch (error: any) {
    console.error('Power Action Error:', error.response?.data || error.message);
    res.status(500).json({ message: 'Error performing power action', error: error.message });
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

        const serviceConfig = (service.config as any) || {};
        const serverId = serviceConfig.serverId;
        const server = await prisma.server.findUnique({ where: { id: parseInt(serverId) } });

        if (!server || !service.externalId) throw new Error('Incomplete service or server data');

        const { getAdapter } = await import('../provisioning/provisioning.service.js');
        const adapter: any = getAdapter('pterodactyl');

        // Use the adapter to fetch the latest details
        const details = await adapter.getLatestDetails(service.externalId, server);

        // Update service config with new details (IP, etc.)
        const updatedConfig = { ...serviceConfig, ...details };
        const updatedService = await prisma.service.update({
            where: { id: service.id },
            data: {
                externalId: JSON.stringify(details), // Ensure we update the identifier if needed
                config: updatedConfig
            }
        });

        res.json(updatedService);
    } catch (error: any) {
        res.status(500).json({ message: 'Error refreshing service', error: error.message });
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
