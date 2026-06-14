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
      subject: 'Bienvenue chez Infralyonix - Vérifiez votre compte',
      templateName: 'WELCOME_VERIFICATION',
      context: {
        name: user.name,
        verificationUrl: `${req.headers.origin || process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`
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

const parseUA = (ua: string) => {
    let os = "Inconnu";
    let browser = "Inconnu";

    if (ua.includes("Windows NT 10.0")) os = "Windows 10/11";
    else if (ua.includes("Windows NT 6.1")) os = "Windows 7";
    else if (ua.includes("Macintosh")) os = "macOS";
    else if (ua.includes("iPhone")) os = "iOS (iPhone)";
    else if (ua.includes("Android")) os = "Android";
    else if (ua.includes("Linux")) os = "Linux";

    if (ua.includes("Firefox")) browser = "Firefox";
    else if (ua.includes("Edg")) browser = "Microsoft Edge";
    else if (ua.includes("Chrome")) browser = "Google Chrome";
    else if (ua.includes("Safari") && !ua.includes("Chrome")) browser = "Safari";
    else if (ua.includes("OPR") || ua.includes("Opera")) browser = "Opera";

    return `${browser} sur ${os}`;
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

    const userIp = (req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').toString().replace('::ffff:', '');
    const userAgentRaw = req.headers['user-agent'] || 'Inconnu';
    const userAgent = parseUA(userAgentRaw);

    // IP Security Alert Logic - Always notify
    let currentIps = (user.lastIps as string[]) || [];
    if (!currentIps.includes(userIp)) {
      currentIps.push(userIp);
      if (currentIps.length > 10) currentIps.shift(); // Keep last 10

      await prisma.user.update({
        where: { id: user.id },
        data: { lastIps: currentIps }
      });
    }

    sendEmail({
      to: user.email,
      subject: 'Alerte de sécurité : Nouvelle connexion à votre compte Infralyonix',
      templateName: 'NEW_DEVICE_LOGIN',
      context: {
        name: user.name,
        ip: userIp,
        userAgent,
        date: new Date().toLocaleString('fr-FR')
      }
    });

    if (user.twoFactorEnabled) {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expires = new Date(Date.now() + 600000); // 10 min

      await prisma.user.update({
        where: { id: user.id },
        data: { twoFactorCode: code, twoFactorExpires: expires }
      });

      sendEmail({
        to: user.email,
        subject: 'Votre code de vérification - Infralyonix',
        templateName: '2FA_CODE',
        context: {
          name: user.name,
          code
        }
      });

      return res.json({ require2FA: true, userId: user.id });
    }

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
        twoFactorEnabled: true,
        emailVerified: true,
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
  const { name, isCompany, companyName, vatNumber, address, password, twoFactorEnabled } = req.body;
  const email = req.body.email?.toLowerCase().trim();
  const updateData: any = { name, email, isCompany, companyName, vatNumber, address, twoFactorEnabled };

  try {
    const userIp = (req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').toString().replace('::ffff:', '');
    let passwordChanged = false;

    if (password) {
      const bcrypt = (await import('bcryptjs')).default;
      updateData.password = await bcrypt.hash(password, 10);
      passwordChanged = true;
    }

    const user = await prisma.user.update({
      where: { id: req.userId },
      data: updateData,
    });

    if (passwordChanged) {
      sendEmail({
        to: user.email,
        subject: 'Votre mot de passe a été modifié - Infralyonix',
        templateName: 'PASSWORD_CHANGED',
        context: {
          name: user.name,
          ip: userIp,
          date: new Date().toLocaleString('fr-FR')
        }
      });
    }

    res.json({ message: 'Profile updated', user: { id: user.id, email: user.email, name: user.name } });
  } catch (error) {
    res.status(500).json({ message: 'Update failed', error });
  }
};

export const resendVerificationEmail = async (req: any, res: Response) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.emailVerified) return res.status(400).json({ message: 'Email already verified' });

    const verificationToken = crypto.randomBytes(32).toString('hex');
    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerificationToken: verificationToken }
    });

    sendEmail({
      to: user.email,
      subject: 'Vérifiez votre compte Infralyonix',
      templateName: 'WELCOME_VERIFICATION',
      context: {
        name: user.name,
        verificationUrl: `${req.headers.origin || process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`
      }
    });

    res.json({ message: 'Email de vérification envoyé avec succès.' });
  } catch (error) {
    res.status(500).json({ message: 'Error resending verification', error });
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

export const forgotPassword = async (req: Request, res: Response) => {
  const email = req.body.email?.toLowerCase().trim();
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Don't reveal if user exists for security, but we can't send email
      return res.json({ message: 'Si un compte existe pour cet email, vous recevrez un lien de réinitialisation.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpires: resetExpires
      }
    });

    const resetUrl = `${req.headers.origin || process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    sendEmail({
      to: user.email,
      subject: 'Réinitialisation de votre mot de passe - Infralyonix',
      templateName: 'PASSWORD_RESET',
      context: {
        name: user.name,
        resetUrl
      }
    });

    res.json({ message: 'Si un compte existe pour cet email, vous recevrez un lien de réinitialisation.' });
  } catch (error: any) {
    res.status(500).json({ message: 'Error sending reset email', error: error.message });
  }
};

export const verify2FA = async (req: Request, res: Response) => {
  const { userId, code } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { id: parseInt(userId) } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.twoFactorCode !== code || (user.twoFactorExpires && user.twoFactorExpires < new Date())) {
      return res.status(400).json({ message: 'Code invalide ou expiré.' });
    }

    // Clear code
    await prisma.user.update({
      where: { id: user.id },
      data: { twoFactorCode: null, twoFactorExpires: null }
    });

    const token = generateToken(user.id, user.role);
    res.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role }, token });
  } catch (error: any) {
    res.status(500).json({ message: 'Verification failed', error: error.message });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const { token, password } = req.body;
  try {
    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpires: { gt: new Date() }
      }
    });

    if (!user) {
      return res.status(400).json({ message: 'Le jeton est invalide ou a expiré.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userIp = (req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').toString().replace('::ffff:', '');

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null
      }
    });

    sendEmail({
      to: user.email,
      subject: 'Confirmation du changement de mot de passe - Infralyonix',
      templateName: 'PASSWORD_CHANGED',
      context: {
        name: user.name,
        ip: userIp,
        date: new Date().toLocaleString('fr-FR')
      }
    });

    res.json({ message: 'Mot de passe réinitialisé avec succès.' });
  } catch (error: any) {
    res.status(500).json({ message: 'Reset failed', error: error.message });
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
