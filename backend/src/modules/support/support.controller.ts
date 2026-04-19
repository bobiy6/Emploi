import { Response } from 'express';
import prisma from '../../config/prisma.js';
import { createLog } from '../../utils/logger.js';
import { sendEmail } from '../../services/email.service.js';

/**
 * Client: Create a new ticket
 */
export const createTicket = async (req: any, res: Response) => {
  const { subject, message } = req.body;
  const userId = req.userId;

  if (!subject || !message) {
    return res.status(400).json({ message: 'Subject and message are required' });
  }

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
      include: {
        messages: { orderBy: { createdAt: 'asc' } },
        user: { select: { name: true, email: true } }
      }
    });

    await createLog({ type: 'SERVICE', level: 'INFO', message: `New ticket created: ${subject}`, userId });

    // Notify user of ticket creation
    await sendEmail({
      to: ticket.user.email,
      subject: `Confirmation de votre ticket : ${subject}`,
      templateName: 'TICKET_CREATED',
      context: {
        name: ticket.user.name,
        subject: ticket.subject,
        ticketId: ticket.id
      }
    });

    res.status(201).json(ticket);
  } catch (error: any) {
    console.error('TICKET CREATE ERROR:', error);
    res.status(500).json({ message: 'Error creating ticket', error: error.message });
  }
};

/**
 * Client: Get own tickets
 */
export const getMyTickets = async (req: any, res: Response) => {
  try {
    const tickets = await prisma.ticket.findMany({
      where: { userId: req.userId },
      orderBy: { updatedAt: 'desc' },
      include: { user: { select: { name: true } } }
    });
    res.json(tickets);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching tickets', error: error.message });
  }
};

/**
 * Admin/Client: Get single ticket by ID
 */
export const getTicketById = async (req: any, res: Response) => {
  const { id } = req.params;
  const userId = req.userId;
  const isStaff = req.userRole === 'ADMIN' || req.userRole === 'SUPPORT';

  try {
    const ticketId = parseInt(id);
    if (isNaN(ticketId)) return res.status(400).json({ message: 'Invalid ID' });

    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          include: { user: { select: { name: true, role: true } } }
        },
        user: { select: { name: true, email: true, role: true } }
      }
    });

    if (!ticket || (ticket.userId !== userId && !isStaff)) {
      return res.status(404).json({ message: 'Ticket not found or access denied' });
    }

    res.json(ticket);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching ticket details', error: error.message });
  }
};

/**
 * Admin/Client: Reply to a ticket
 */
export const replyToTicket = async (req: any, res: Response) => {
  const { id } = req.params;
  const { message } = req.body;
  const userId = req.userId;
  const isStaff = req.userRole === 'ADMIN' || req.userRole === 'SUPPORT';

  if (!message || message.trim() === '') {
    return res.status(400).json({ message: 'Message is required' });
  }

  try {
    const ticketId = parseInt(id);
    if (isNaN(ticketId)) return res.status(400).json({ message: 'Invalid ID' });

    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: { user: { select: { email: true, name: true } } }
    });
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    // Client can only reply to their own tickets
    if (!isStaff && ticket.userId !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const newMessage = await prisma.ticketMessage.create({
      data: {
        ticketId: ticket.id,
        userId,
        message,
        isAdmin: isStaff
      },
      include: { user: { select: { name: true, role: true } } }
    });

    await prisma.ticket.update({
      where: { id: ticket.id },
      data: {
        status: isStaff ? 'ANSWERED' : 'OPEN',
        updatedAt: new Date()
      }
    });

    if (isStaff) {
      // Notify user of staff reply
      await sendEmail({
        to: ticket.user.email,
        subject: `Nouvelle réponse à votre ticket : ${ticket.subject}`,
        templateName: 'TICKET_REPLY',
        context: {
          name: ticket.user.name,
          subject: ticket.subject,
          ticketId: ticket.id,
          message: message
        }
      });
    }

    res.status(201).json(newMessage);
  } catch (error: any) {
    res.status(500).json({ message: 'Error sending reply', error: error.message });
  }
};

/**
 * Admin/Client: Close a ticket
 */
export const closeTicket = async (req: any, res: Response) => {
  const { id } = req.params;
  const userId = req.userId;
  const isStaff = req.userRole === 'ADMIN' || req.userRole === 'SUPPORT';

  try {
    const ticketId = parseInt(id);
    if (isNaN(ticketId)) return res.status(400).json({ message: 'Invalid ID' });

    const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    if (!isStaff && ticket.userId !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const updatedTicket = await prisma.ticket.update({
      where: { id: ticketId },
      data: { status: 'CLOSED' }
    });

    res.json(updatedTicket);
  } catch (error: any) {
    res.status(500).json({ message: 'Error closing ticket', error: error.message });
  }
};

/**
 * Admin: Delete a ticket
 */
export const deleteTicket = async (req: any, res: Response) => {
  const { id } = req.params;

  try {
    const ticketId = parseInt(id);
    if (isNaN(ticketId)) return res.status(400).json({ message: 'Invalid ID' });

    // Delete related messages first (manual cascade to be safe)
    await prisma.ticketMessage.deleteMany({ where: { ticketId } });

    await prisma.ticket.delete({
      where: { id: ticketId }
    });

    res.json({ message: 'Ticket deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Error deleting ticket', error: error.message });
  }
};

/**
 * Admin: Get all tickets
 */
export const getAllTicketsAdmin = async (req: any, res: Response) => {
  try {
    const tickets = await prisma.ticket.findMany({
      include: { user: { select: { name: true, email: true } } },
      orderBy: { updatedAt: 'desc' }
    });
    res.json(tickets);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching all tickets', error: error.message });
  }
};
