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
  try {
    const server = await prisma.server.findUnique({ where: { id: parseInt(id as string) } });
    if (!server) return res.status(404).json({ message: 'Server not found' });

    const result = await performTest(server.type, server.url, server.apiKey, server.secret);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, message: `Connection failed: ${error.message}` });
  }
};

export const testRawConnection = async (req: any, res: Response) => {
    const { type, url, apiKey, secret } = req.body;
    try {
        const result = await performTest(type, url, apiKey, secret);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ success: false, message: `Connection failed: ${error.message}` });
    }
};

const performTest = async (type: string, url: string, apiKey: string, secret?: string | null) => {
    const axios = (await import('axios')).default;
    const https = await import('https');
    const agent = new https.Agent({ rejectUnauthorized: false });

    if (type === 'PROXMOX') {
        await axios.get(`${url}/version`, {
            headers: { Authorization: `PVEAPIToken=${apiKey}=${secret}` },
            timeout: 5000,
            httpsAgent: agent
        });
    } else {
        // Pterodactyl test
        await axios.get(`${url}/api/application/nodes`, {
            headers: { Authorization: `Bearer ${apiKey}`, Accept: 'application/json' },
            timeout: 5000,
            httpsAgent: agent
        });
    }
    return { success: true, message: 'Real connection successful!' };
}

export const getPterodactylMetadata = async (req: any, res: Response) => {
    const { id } = req.params;
    const axios = (await import('axios')).default;
    const https = await import('https');
    const agent = new https.Agent({ rejectUnauthorized: false });

    try {
        const server = await prisma.server.findUnique({ where: { id: parseInt(id) } });
        if (!server || server.type !== 'PTERODACTYL') return res.status(404).json({ message: 'Pterodactyl server not found' });

        const headers = { Authorization: `Bearer ${server.apiKey}`, Accept: 'application/json' };

        const [nestsRes, locationsRes, nodesRes] = await Promise.all([
            axios.get(`${server.url}/api/application/nests`, { headers, httpsAgent: agent }),
            axios.get(`${server.url}/api/application/locations`, { headers, httpsAgent: agent }),
            axios.get(`${server.url}/api/application/nodes`, { headers, httpsAgent: agent })
        ]);

        // Fetch eggs for each nest
        const nests = nestsRes.data.data;
        const nestsWithEggs = await Promise.all(nests.map(async (nest: any) => {
            const eggsRes = await axios.get(`${server.url}/api/application/nests/${nest.attributes.id}/eggs?include=variables`, { headers, httpsAgent: agent });
            return {
                ...nest.attributes,
                eggs: eggsRes.data.data.map((e: any) => e.attributes)
            };
        }));

        res.json({
            nests: nestsWithEggs,
            locations: locationsRes.data.data.map((l: any) => l.attributes),
            nodes: nodesRes.data.data.map((n: any) => n.attributes)
        });
    } catch (error: any) {
        res.status(500).json({ message: 'Error fetching Pterodactyl metadata', error: error.message });
    }
};
