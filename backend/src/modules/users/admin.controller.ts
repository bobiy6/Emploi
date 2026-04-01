import { Response } from 'express';
import prisma from '../../config/prisma.js';

export const getAdminStats = async (req: any, res: Response) => {
  try {
    const userCount = await prisma.user.count();
    const serviceCount = await prisma.service.count({ where: { status: 'ACTIVE' } });
    const orderCount = await prisma.order.count();
    const totalRevenue = await prisma.invoice.aggregate({
      where: { status: 'PAID' },
      _sum: { amount: true }
    });
    const openTickets = await prisma.ticket.count({ where: { status: 'OPEN' } });

    // Recent data for graphs/lists
    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true } }, product: { select: { name: true } } }
    });

    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, email: true, createdAt: true }
    });

    res.json({
      stats: {
        users: userCount,
        activeServices: serviceCount,
        totalOrders: orderCount,
        revenue: totalRevenue._sum.amount || 0,
        openTickets
      },
      recentOrders,
      recentUsers
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats', error });
  }
};
