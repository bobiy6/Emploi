import { Response } from 'express';
import prisma from '../../config/prisma.js';

export const createOrder = async (req: any, res: Response) => {
  const { productId } = req.body;
  const userId = req.userId;
  try {
    const product = await prisma.product.findUnique({ where: { id: parseInt(productId as string) } });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    const order = await prisma.order.create({
      data: { userId, productId: product.id, total: product.price, status: 'PENDING' }
    });
    await prisma.invoice.create({
      data: { userId, orderId: order.id, amount: product.price, status: 'UNPAID' }
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
