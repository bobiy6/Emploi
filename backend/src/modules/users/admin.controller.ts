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

    res.json({
      users: userCount,
      activeServices: serviceCount,
      totalOrders: orderCount,
      revenue: totalRevenue._sum.amount || 0,
      openTickets
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats', error });
  }
};
