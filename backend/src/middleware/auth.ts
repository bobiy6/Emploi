import jwt from 'jsonwebtoken';
import { Response, NextFunction } from 'express';
import { createLog } from '../utils/logger.js';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

export const generateToken = (userId: number, role: string) => {
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: '7d' });
};

export const authMiddleware = (req: any, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number, role: string };
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    createLog({ type: 'AUTH', level: 'WARN', message: 'Failed authentication attempt', details: { error } });
    res.status(401).json({ message: 'Invalid token' });
  }
};

export const adminMiddleware = async (req: any, res: Response, next: NextFunction) => {
  const userId = req.userId;
  const userRole = req.userRole;

  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  // Optimization: use the role from the token first
  if (userRole === 'ADMIN' || userRole === 'SUPPORT') {
    return next();
  }

  // Fallback check in DB if needed (unlikely if token is valid and not tampered)
  try {
    const prisma = (await import('../config/prisma.js')).default;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user && (user.role === 'ADMIN' || user.role === 'SUPPORT')) {
      return next();
    }
    return res.status(403).json({ message: 'Forbidden: Admin access only' });
  } catch (error) {
    res.status(500).json({ message: 'Error checking admin status' });
  }
};
