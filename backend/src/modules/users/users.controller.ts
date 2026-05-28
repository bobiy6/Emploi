import { Response } from 'express';
import prisma from '../../config/prisma.js';
import { generateToken } from '../../middleware/auth.js';

export const getAllUsers = async (req: any, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true, permissions: true, balance: true, createdAt: true }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error });
  }
};

export const createAdminUser = async (req: any, res: Response) => {
  const { password, name, role, permissions } = req.body;
  const email = req.body.email?.toLowerCase().trim();
  const bcrypt = (await import('bcryptjs')).default;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role, // ADMIN or SUPPORT
        permissions: permissions || []
      }
    });
    res.status(201).json({ id: user.id, email: user.email, name: user.name, role: user.role });
  } catch (error) {
    res.status(500).json({ message: 'Error creating admin user', error });
  }
};

export const updateUser = async (req: any, res: Response) => {
  const { id } = req.params;
  const { name, role, permissions, isCompany, companyName, vatNumber, address, password } = req.body;
  const email = req.body.email?.toLowerCase().trim();
  const updateData: any = { name, email, role, permissions, isCompany, companyName, vatNumber, address };

  try {
    if (password) {
      const bcrypt = (await import('bcryptjs')).default;
      updateData.password = await bcrypt.hash(password, 10);
    }
    const user = await prisma.user.update({
      where: { id: parseInt(id as string) },
      data: updateData
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error updating user', error });
  }
};

export const deleteUser = async (req: any, res: Response) => {
  const { id } = req.params;
  const userId = parseInt(id as string);
  try {
    // Robust manual cascade for account deletion
    // Order matters to satisfy foreign key constraints
    await prisma.$transaction([
      // 1. Delete ticket messages associated with user's tickets OR sent by the user
      prisma.ticketMessage.deleteMany({
        where: {
          OR: [
            { userId },
            { ticket: { userId } }
          ]
        }
      }),
      // 2. Delete tickets owned by user
      prisma.ticket.deleteMany({ where: { userId } }),
      // 3. Delete logs associated with user's services OR linked to the user
      prisma.log.deleteMany({
        where: {
          OR: [
            { userId },
            { service: { userId } }
          ]
        }
      }),
      // 4. Delete invoices owned by user
      prisma.invoice.deleteMany({ where: { userId } }),
      // 5. Delete services owned by user
      prisma.service.deleteMany({ where: { userId } }),
      // 6. Delete orders owned by user
      prisma.order.deleteMany({ where: { userId } }),
      // 7. Finally delete the user
      prisma.user.delete({ where: { id: userId } })
    ]);
    res.json({ message: 'User and all related data deleted successfully' });
  } catch (error: any) {
    console.error('DELETE USER ERROR:', error);
    res.status(500).json({ message: 'Error deleting user record', error: error.message });
  }
};

export const updateUserBalance = async (req: any, res: Response) => {
  const { id } = req.params;
  const { amount } = req.body; // positive to add, negative to subtract
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

    // Original admin info to allow "return"
    const adminId = req.userId;
    const adminUser = await prisma.user.findUnique({ where: { id: adminId } });

    const token = generateToken(user.id, user.role);
    res.json({
      message: 'Impersonation successful',
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      adminToken: req.headers.authorization?.split(' ')[1], // Current admin token
      adminName: adminUser?.name
    });
  } catch (error) {
    res.status(500).json({ message: 'Error during impersonation', error });
  }
};
