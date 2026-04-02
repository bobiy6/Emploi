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

    const { getAdapter, getBestServer } = await import('../provisioning/provisioning.service.js');
    const adapter = getAdapter(service.module);
    const server = await getBestServer(service.product.type);

    if (adapter && service.externalId && server) {
        await adapter.powerAction(service.externalId, action, server);
    }
    res.json({ message: `Service ${action} successful` });
  } catch (error) {
    res.status(500).json({ message: 'Error performing power action', error });
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
