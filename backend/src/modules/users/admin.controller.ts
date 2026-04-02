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

    // Revenue breakdown by month
    const allInvoices = await prisma.invoice.findMany({
      where: { status: 'PAID' },
      select: { amount: true, createdAt: true }
    });

    const revenueByMonth = allInvoices.reduce((acc: any, inv) => {
      const month = inv.createdAt.toLocaleString('default', { month: 'short' });
      acc[month] = (acc[month] || 0) + inv.amount;
      return acc;
    }, {});

    // New Log stats
    const recentLogs = await prisma.log.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true } } }
    });

    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const errorCount24h = await prisma.log.count({
      where: {
        level: 'ERROR',
        createdAt: { gte: last24h }
      }
    });

    const provisioningErrors = await prisma.log.count({
      where: {
        type: 'PROVISIONING',
        level: 'ERROR'
      }
    });

    res.json({
      stats: {
        users: userCount,
        activeServices: serviceCount,
        totalOrders: orderCount,
        revenue: totalRevenue._sum.amount || 0,
        openTickets,
        revenueByMonth,
        errorCount24h,
        provisioningErrors
      },
      recentOrders,
      recentUsers,
      recentLogs
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats', error });
  }
};
