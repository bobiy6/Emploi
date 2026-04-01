import { Response } from 'express';
import prisma from '../../config/prisma.js';

export const getMyInvoices = async (req: any, res: Response) => {
  try {
    const invoices = await prisma.invoice.findMany({
      where: { userId: req.userId },
      include: { order: { include: { product: true } } }
    });
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching invoices', error });
  }
};

export const payInvoice = async (req: any, res: Response) => {
  const { id } = req.params;
  const userId = req.userId;
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: parseInt(id as string) },
      include: { user: true, order: { include: { product: true } } }
    });
    if (!invoice || invoice.userId !== userId) return res.status(404).json({ message: 'Invoice not found' });
    if (invoice.status === 'PAID') return res.status(400).json({ message: 'Invoice already paid' });
    if (invoice.user.balance < invoice.amount) return res.status(400).json({ message: 'Insufficient balance' });

    await prisma.$transaction([
      prisma.user.update({ where: { id: userId }, data: { balance: { decrement: invoice.amount } } }),
      prisma.invoice.update({ where: { id: invoice.id }, data: { status: 'PAID' } }),
      prisma.order.update({ where: { id: invoice.orderId! }, data: { status: 'PAID' } })
    ]);

    const product = invoice.order?.product;
    if (product) {
        const nextDueDate = new Date();
        nextDueDate.setMonth(nextDueDate.getMonth() + 1);
        const module = product.type === 'VPS' ? 'proxmox' : 'pterodactyl';
        const { getAdapter } = await import('../provisioning/provisioning.service.js');
        const adapter = getAdapter(module);
        let externalId = null;
        if (adapter) externalId = await adapter.create(product.config);

        await prisma.service.create({
            data: { userId, productId: product.id, status: 'ACTIVE', module, externalId, config: product.config || {}, nextDueDate }
        });
    }
    res.json({ message: 'Invoice paid and service provisioned' });
  } catch (error) {
    res.status(500).json({ message: 'Error paying invoice', error });
  }
};

export const getAllInvoices = async (req: any, res: Response) => {
  try {
    const invoices = await prisma.invoice.findMany({
      include: { user: { select: { name: true, email: true } }, order: { include: { product: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching all invoices', error });
  }
};

export const downloadInvoicePDF = async (req: any, res: Response) => {
  const { id } = req.params;
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: parseInt(id as string) },
      include: { user: true, order: { include: { product: true } } }
    });

    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

    // Mock PDF Generation
    const pdfContent = `
      INVOICE #${invoice.id}
      -------------------
      Customer: ${invoice.user.name}
      ${invoice.user.isCompany ? `Company: ${invoice.user.companyName}\nVAT: ${invoice.user.vatNumber}` : 'Individual'}
      Address: ${invoice.user.address || 'N/A'}

      Item: ${invoice.order?.product?.name}
      Amount: ${invoice.amount}€
      Status: ${invoice.status}
      Date: ${invoice.createdAt.toLocaleDateString()}
    `;

    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${id}.txt`);
    res.send(pdfContent);
  } catch (error) {
    res.status(500).json({ message: 'Error generating invoice', error });
  }
};
