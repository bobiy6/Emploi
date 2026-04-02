import { Response } from 'express';
import prisma from '../../config/prisma.js';

export const getSystemSettings = async (req: any, res: Response) => {
  try {
    const settings = await prisma.systemSetting.findMany();
    const settingsMap = settings.reduce((acc: any, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});
    res.json(settingsMap);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching settings', error });
  }
};

export const updateSystemSetting = async (req: any, res: Response) => {
  const { key, value } = req.body;
  try {
    const setting = await prisma.systemSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value }
    });
    res.json(setting);
  } catch (error) {
    res.status(500).json({ message: 'Error updating setting', error });
  }
};

export const testStripeConnection = async (req: any, res: Response) => {
  const stripe = (await import('stripe')).default;
  const { secretKey } = req.body;
  try {
    const stripeInstance = new stripe(secretKey);
    await stripeInstance.paymentIntents.list({ limit: 1 });
    res.json({ success: true, message: 'Stripe API connection successful!' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: `Stripe connection failed: ${error.message}` });
  }
};
