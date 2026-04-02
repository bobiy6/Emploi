import { Response } from 'express';
import prisma from '../../config/prisma.js';

export const createTicket = async (req: any, res: Response) => {
  const { subject, message } = req.body;
  const userId = req.userId;

  try {
    const ticket = await prisma.ticket.create({
      data: {
        userId,
        subject,
        status: 'OPEN',
        messages: {
          create: {
            userId,
            message,
            isAdmin: false
          }
        }
      },
      include: { messages: true }
    });
    res.status(201).json(ticket);
  } catch (error) {
    res.status(500).json({ message: 'Error creating ticket', error });
  }
};

export const getMyTickets = async (req: any, res: Response) => {
  try {
    const tickets = await prisma.ticket.findMany({
      where: { userId: req.userId },
      orderBy: { updatedAt: 'desc' }
    });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tickets', error });
  }
};

export const getTicketById = async (req: any, res: Response) => {
  const { id } = req.params;
  try {
    const ticketId = parseInt(id as string);
    if (isNaN(ticketId)) return res.status(400).json({ message: 'Invalid Ticket ID' });

    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          include: { user: { select: { name: true, role: true } } }
        },
        user: { select: { name: true, email: true } }
      }
    });
    const isStaff = req.userRole === 'ADMIN' || req.userRole === 'SUPPORT';
    if (!ticket || (ticket.userId !== req.userId && !isStaff)) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching ticket', error });
  }
};

export const replyToTicket = async (req: any, res: Response) => {
  const { id } = req.params;
  const { message } = req.body;
  const userId = req.userId;

  try {
    const ticketId = parseInt(id as string);
    if (isNaN(ticketId)) return res.status(400).json({ message: 'Invalid Ticket ID' });

    const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ message: 'User not found' });
    const isStaff = user.role === 'ADMIN' || user.role === 'SUPPORT';

    // Staff can reply to any ticket, clients only to their own
    if (!isStaff && ticket.userId !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const newMessage = await prisma.ticketMessage.create({
      data: {
        ticketId: ticket.id,
        userId,
        message,
        isAdmin: isStaff
      }
    });

    await prisma.ticket.update({
      where: { id: ticket.id },
      data: {
        status: isStaff ? 'ANSWERED' : 'OPEN',
        updatedAt: new Date()
      }
    });

    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: 'Error replying to ticket', error });
  }
};

export const getAllTicketsAdmin = async (req: any, res: Response) => {
  try {
    const tickets = await prisma.ticket.findMany({
      include: { user: { select: { name: true, email: true } } },
      orderBy: { updatedAt: 'desc' }
    });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching all tickets', error });
  }
};
