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

  if (!ALLOWED_MODELS.includes(model.toLowerCase())) {
    return res.status(400).json({ message: 'Invalid model' });
  }

  try {
    const prismaModel = (prisma as any)[model.toLowerCase()];
    await prismaModel.delete({
      where: { id: parseInt(id) }
    });
    res.json({ message: 'Record deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: `Error deleting ${model} record`, error });
  }
};
