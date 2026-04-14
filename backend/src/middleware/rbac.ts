import { Response, NextFunction } from 'express';

export const staffMiddleware = async (req: any, res: Response, next: NextFunction) => {
  const userId = req.userId;
  const userRole = req.userRole;

  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  // Use the role from the token first
  if (userRole === 'ADMIN' || userRole === 'SUPPORT') {
    return next();
  }

  // Fallback to DB check
  try {
    const prisma = (await import('../config/prisma.js')).default;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPPORT')) {
      return res.status(403).json({ message: 'Forbidden: Staff access only' });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: 'Error checking staff status' });
  }
};

export const superAdminMiddleware = async (req: any, res: Response, next: NextFunction) => {
    const userId = req.userId;
    const userRole = req.userRole;

    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    // Use the role from the token first
    if (userRole === 'ADMIN') {
        return next();
    }

    // Fallback to DB check
    try {
      const prisma = (await import('../config/prisma.js')).default;
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user || user.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Forbidden: Full Administrator access only' });
      }
      next();
    } catch (error) {
      res.status(500).json({ message: 'Error checking admin status' });
    }
  };
