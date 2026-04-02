import { Response } from 'express';
import prisma from '../../config/prisma.js';

const ALLOWED_MODELS = ['user', 'product', 'category', 'order', 'service', 'invoice', 'ticket', 'server', 'log'];

export const getModelData = async (req: any, res: Response) => {
  const { model } = req.params;
  const { limit = 100, page = 1 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  if (!ALLOWED_MODELS.includes(model.toLowerCase())) {
    return res.status(400).json({ message: 'Invalid model' });
  }

  try {
    const prismaModel = (prisma as any)[model.toLowerCase()];
    const [data, total] = await Promise.all([
      prismaModel.findMany({
        take: Number(limit),
        skip,
        orderBy: { id: 'desc' }
      }),
      prismaModel.count()
    ]);

    res.json({
      data,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ message: `Error fetching ${model} data`, error });
  }
};

export const deleteModelRecord = async (req: any, res: Response) => {
  const { model, id } = req.params;
  const recordId = parseInt(id);

  if (!ALLOWED_MODELS.includes(model.toLowerCase())) {
    return res.status(400).json({ message: 'Invalid model' });
  }

  try {
    const modelName = model.toLowerCase();
    // Manual Cascade for specific models to allow "Force Delete"
    if (modelName === 'ticket') {
      await prisma.ticketMessage.deleteMany({ where: { ticketId: recordId } });
    } else if (modelName === 'user') {
      // Very dangerous but requested: cleanup user-related data
      await prisma.ticketMessage.deleteMany({ where: { userId: recordId } });
      await prisma.ticket.deleteMany({ where: { userId: recordId } });
      await prisma.log.deleteMany({ where: { userId: recordId } });
      await prisma.invoice.deleteMany({ where: { userId: recordId } });
      await prisma.service.deleteMany({ where: { userId: recordId } });
      await prisma.order.deleteMany({ where: { userId: recordId } });
    } else if (modelName === 'product') {
      await prisma.order.deleteMany({ where: { productId: recordId } });
      await prisma.service.deleteMany({ where: { productId: recordId } });
    } else if (modelName === 'order') {
       await prisma.invoice.deleteMany({ where: { orderId: recordId } });
    } else if (modelName === 'service') {
       await prisma.log.deleteMany({ where: { serviceId: recordId } });
    }

    const prismaModel = (prisma as any)[modelName];
    await prismaModel.delete({
      where: { id: recordId }
    });
    res.json({ message: 'Record deleted successfully' });
  } catch (error: any) {
    console.error('DB DELETE ERROR:', error);
    res.status(500).json({ message: `Error deleting ${model} record`, error: error.message });
  }
};
