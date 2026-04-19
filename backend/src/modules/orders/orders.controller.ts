import { Response } from 'express';
import prisma from '../../config/prisma.js';
import { sendEmail } from '../../services/email.service.js';

export const createOrder = async (req: any, res: Response) => {
  const { productId, billingCycle } = req.body;
  const userId = req.userId;
  try {
    const product = await prisma.product.findUnique({ where: { id: parseInt(productId as string) } });
    if (!product) return res.status(404).json({ message: 'Product not found' });

    let finalPrice = product.price;
    const cycles = (product.billingCycles as any) || {};
    if (billingCycle && cycles[billingCycle]) {
        finalPrice = parseFloat(cycles[billingCycle]);
    }

    const order = await prisma.order.create({
      data: {
          userId,
          productId: product.id,
          total: finalPrice,
          billingCycle: billingCycle || 'monthly',
          status: 'PENDING'
      }
    });
    const invoice = await prisma.invoice.create({
      data: { userId, orderId: order.id, amount: finalPrice, status: 'UNPAID' },
      include: { user: true }
    });

    // Send New Invoice Email
    sendEmail({
      to: invoice.user.email,
      subject: `Nouvelle facture #${invoice.id} - Infralyonix`,
      templateName: 'NEW_INVOICE',
      context: {
        name: invoice.user.name,
        invoiceId: invoice.id,
        amount: invoice.amount,
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString() // 3 days
      }
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error creating order', error });
  }
};

export const getMyOrders = async (req: any, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.userId },
      include: { product: true, invoice: true }
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders', error });
  }
};

export const getAllOrders = async (req: any, res: Response) => {
  try {
    const orders = await prisma.order.findMany({ include: { user: true, product: true, invoice: true } });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching all orders', error });
  }
};
