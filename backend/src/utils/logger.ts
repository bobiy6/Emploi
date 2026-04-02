import prisma from '../config/prisma.js';

export const createLog = async (data: {
  type: 'API' | 'PROVISIONING' | 'SERVICE' | 'ERROR' | 'AUTH';
  level: 'INFO' | 'WARN' | 'ERROR';
  message: string;
  details?: any;
  userId?: number;
  serviceId?: number;
}) => {
  try {
    await prisma.log.create({
      data: {
        type: data.type,
        level: data.level,
        message: data.message,
        details: data.details || {},
        userId: data.userId,
        serviceId: data.serviceId
      }
    });
  } catch (err) {
    console.error('Failed to save log to DB:', err);
  }
};
