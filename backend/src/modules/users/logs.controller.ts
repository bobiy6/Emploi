import { Response } from 'express';
import prisma from '../../config/prisma.js';

export const getLogs = async (req: any, res: Response) => {
  const { type, level, userId, serviceId, search, limit = 50, page = 1 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  try {
    const where: any = {};
    if (type) where.type = type;
    if (level) where.level = level;
    if (userId) where.userId = Number(userId);
    if (serviceId) where.serviceId = Number(serviceId);
    if (search) {
      where.OR = [
        { message: { contains: search, mode: 'insensitive' } },
        { type: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [logs, total] = await Promise.all([
      prisma.log.findMany({
        where,
        take: Number(limit),
        skip,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, email: true } },
          service: { select: { id: true, module: true } }
        }
      }),
      prisma.log.count({ where })
    ]);

    res.json({
      logs,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching logs', error });
  }
};
