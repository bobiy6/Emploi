import { Response } from 'express';
import prisma from '../../config/prisma.js';
import { generateToken } from '../../middleware/auth.js';

export const getAllUsers = async (req: any, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true, balance: true, createdAt: true }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error });
  }
};

export const updateUserBalance = async (req: any, res: Response) => {
  const { id } = req.params;
  const { amount } = req.body;
  try {
    const user = await prisma.user.update({
      where: { id: parseInt(id as string) },
      data: { balance: { increment: amount } }
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error updating balance', error });
  }
};

export const impersonateUser = async (req: any, res: Response) => {
  const { id } = req.params;
  try {
    const user = await prisma.user.findUnique({ where: { id: parseInt(id as string) } });
    if (!user) return res.status(404).json({ message: 'User not found' });
    const token = generateToken(user.id, user.role);
    res.json({ message: 'Impersonation successful', token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: 'Error during impersonation', error });
  }
};
