import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../../config/prisma.js';
import { generateToken } from '../../middleware/auth.js';
import { createLog } from '../../utils/logger.js';
import { sendEmail } from '../../services/email.service.js';
import crypto from 'crypto';

export const register = async (req: Request, res: Response) => {
  const { password, name, isCompany, companyName, vatNumber } = req.body;
  const email = req.body.email?.toLowerCase().trim();

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        isCompany,
        companyName,
        vatNumber,
        emailVerificationToken: verificationToken
      },
    });

    // Trigger Welcome & Verification Email
    sendEmail({
      to: user.email,
      subject: 'Bienvenue chez Infralyonix - Vérifiez votre email',
      templateName: 'WELCOME_VERIFICATION',
      context: {
        name: user.name,
        verificationUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`
      }
    });

    await createLog({
      type: 'AUTH',
      level: 'INFO',
      message: `New user registered: ${email}`,
      userId: user.id
    });

    const token = generateToken(user.id, user.role);
    res.status(201).json({ user: { id: user.id, email: user.email, name: user.name, role: user.role }, token });
  } catch (error: any) {
    await createLog({
      type: 'AUTH',
      level: 'ERROR',
      message: `Registration failed for ${email}`,
      details: { error: error.message }
    });
    res.status(500).json({ message: 'Registration failed', error });
  }
};

export const login = async (req: Request, res: Response) => {
  const email = req.body.email?.toLowerCase().trim();
  const { password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      await createLog({
        type: 'AUTH',
        level: 'WARN',
        message: `Failed login attempt for non-existent email: ${email}`,
      });
      return res.status(404).json({ message: 'User not found' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      await createLog({
        type: 'AUTH',
        level: 'WARN',
        message: `Failed login attempt for user: ${email}`,
        userId: user.id
      });
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    await createLog({
      type: 'AUTH',
      level: 'INFO',
      message: `User logged in: ${email}`,
      userId: user.id
    });

    const token = generateToken(user.id, user.role);
    res.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role }, token });
  } catch (error: any) {
    await createLog({
      type: 'AUTH',
      level: 'ERROR',
      message: `Login error for ${email}`,
      details: { error: error.message }
    });
    res.status(500).json({ message: 'Login failed', error });
  }
};

export const getProfile = async (req: any, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true, email: true, name: true, role: true, balance: true,
        isCompany: true, companyName: true, vatNumber: true, address: true,
        createdAt: true
      },
    });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Could not fetch profile', error });
  }
};

export const updateProfile = async (req: any, res: Response) => {
  const { name, isCompany, companyName, vatNumber, address, password } = req.body;
  const email = req.body.email?.toLowerCase().trim();
  const updateData: any = { name, email, isCompany, companyName, vatNumber, address };

  try {
    if (password) {
      const bcrypt = (await import('bcryptjs')).default;
      updateData.password = await bcrypt.hash(password, 10);
    }

    const user = await prisma.user.update({
      where: { id: req.userId },
      data: updateData,
    });

    res.json({ message: 'Profile updated', user: { id: user.id, email: user.email, name: user.name } });
  } catch (error) {
    res.status(500).json({ message: 'Update failed', error });
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  const { token } = req.body;
  try {
    const user = await prisma.user.findFirst({
      where: { emailVerificationToken: token }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerificationToken: null
      }
    });

    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Verification failed', error });
  }
};

export const unsubscribe = async (req: Request, res: Response) => {
  const { email } = req.body;
  try {
    await prisma.user.update({
      where: { email },
      data: { unsubscribed: true }
    });
    res.json({ message: 'Unsubscribed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Unsubscribe failed', error });
  }
};
