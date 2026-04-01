import jwt from 'jsonwebtoken';
import { Response, NextFunction } from 'express';

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
    res.status(401).json({ message: 'Invalid token' });
  }
};

export const adminMiddleware = async (req: any, res: Response, next: NextFunction) => {
  const userId = req.userId;
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const user = await import('../config/prisma.js').then(m => m.default.user.findUnique({ where: { id: userId } }));
    if (user?.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Forbidden: Admin access only' });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: 'Error checking admin status' });
  }
};
