import { Response } from 'express';
import prisma from '../../config/prisma.js';

export const getAllServers = async (req: any, res: Response) => {
  try {
    const servers = await prisma.server.findMany();
    res.json(servers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching servers', error });
  }
};

export const createServer = async (req: any, res: Response) => {
  const { name, type, url, apiKey, secret, node } = req.body;
  try {
    const server = await prisma.server.create({
      data: { name, type, url, apiKey, secret, node }
    });
    res.status(201).json(server);
  } catch (error) {
    res.status(500).json({ message: 'Error creating server', error });
  }
};

export const updateServer = async (req: any, res: Response) => {
  const { id } = req.params;
  const { name, type, url, apiKey, secret, node, isActive } = req.body;
  try {
    const server = await prisma.server.update({
      where: { id: parseInt(id as string) },
      data: { name, type, url, apiKey, secret, node, isActive }
    });
    res.json(server);
  } catch (error) {
    res.status(500).json({ message: 'Error updating server', error });
  }
};

export const deleteServer = async (req: any, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.server.delete({ where: { id: parseInt(id as string) } });
    res.json({ message: 'Server deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting server', error });
  }
};

export const testServerConnection = async (req: any, res: Response) => {
  const { id } = req.params;
  const axios = (await import('axios')).default;
  const https = await import('https');

  try {
    const server = await prisma.server.findUnique({ where: { id: parseInt(id as string) } });
    if (!server) return res.status(404).json({ message: 'Server not found' });

    const agent = new https.Agent({
      rejectUnauthorized: false // Support self-signed certs
    });

    if (server.type === 'PROXMOX') {
        await axios.get(`${server.url}/version`, {
            headers: { Authorization: `PVEAPIToken=${server.apiKey}=${server.secret}` },
            timeout: 5000,
            httpsAgent: agent
        });
    } else {
        await axios.get(`${server.url}/api/application/nodes`, {
            headers: { Authorization: `Bearer ${server.apiKey}`, Accept: 'application/json' },
            timeout: 5000,
            httpsAgent: agent
        });
    }

    res.json({ success: true, message: 'Real connection successful!' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: `Connection failed: ${error.message}` });
  }
};
