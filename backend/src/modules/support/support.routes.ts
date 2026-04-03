import express from 'express';
import { createTicket, getMyTickets, getTicketById, replyToTicket, getAllTicketsAdmin, closeTicket, deleteTicket } from './support.controller.js';
import { authMiddleware, adminMiddleware } from '../../middleware/auth.js';

const router = express.Router();

router.get('/', authMiddleware, getMyTickets);
router.get('/all', authMiddleware, adminMiddleware, getAllTicketsAdmin);
router.get('/:id', authMiddleware, getTicketById);
router.post('/', authMiddleware, createTicket);
router.post('/:id/reply', authMiddleware, replyToTicket);
router.post('/:id/close', authMiddleware, closeTicket);
router.delete('/:id', authMiddleware, adminMiddleware, deleteTicket);

export default router;
