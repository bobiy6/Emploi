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

const normalizePteroUrl = (url: string) => {
    let normalized = url.replace(/\/+$/, '');
    if (normalized.endsWith('/api')) {
        normalized = normalized.substring(0, normalized.length - 4);
    }
    return normalized;
};

const performTest = async (type: string, url: string, apiKey: string, secret?: string | null) => {
    const axios = (await import('axios')).default;
    const https = await import('https');
    const agent = new https.Agent({ rejectUnauthorized: false });

    // Normalize URL: remove trailing slashes
    let normalizedUrl = url.replace(/\/+$/, '');

    if (type === 'PROXMOX') {
        try {
            await axios.get(`${normalizedUrl}/version`, {
                headers: { Authorization: `PVEAPIToken=${apiKey}=${secret}` },
                timeout: 5000,
                httpsAgent: agent
            });
        } catch (err: any) {
            if (err.response?.status === 401) throw new Error('API Key or Secret invalid (Unauthorized)');
            if (err.response?.status === 404) throw new Error('API URL incorrect (Not Found)');
            throw err;
        }
    } else {
        // Pterodactyl test
        const baseUrl = normalizePteroUrl(url);

        try {
            // Test basic connectivity and Nests access
            await axios.get(`${baseUrl}/api/application/nests`, {
                headers: { Authorization: `Bearer ${apiKey}`, Accept: 'application/json' },
                timeout: 5000,
                httpsAgent: agent
            });

            // Test Users access (crucial for provisioning)
            await axios.get(`${baseUrl}/api/application/users`, {
                headers: { Authorization: `Bearer ${apiKey}`, Accept: 'application/json' },
                timeout: 5000,
                httpsAgent: agent
            });

            // Test Client API (Secret) if provided
            if (secret && secret.startsWith('ptlc_')) {
                await axios.get(`${baseUrl}/api/client`, {
                    headers: { Authorization: `Bearer ${secret}`, Accept: 'application/json' },
                    timeout: 5000,
                    httpsAgent: agent
                });
            } else if (secret && secret.length > 0) {
                 throw new Error('La clé secrète doit être une "Client API Key" commençant par ptlc_');
            }
        } catch (err: any) {
            if (err.response?.status === 401) throw new Error('Clé API invalide (401)');
            if (err.response?.status === 403) throw new Error('Action non autorisée (403) - Vérifiez les permissions de la clé API (Nests, Users, Servers)');
            if (err.response?.status === 404) throw new Error(`API URL incorrecte (404) - Tentative sur ${baseUrl}/api/application/nests`);
            if (err.code === 'ECONNABORTED') throw new Error('Serveur inaccessible (Timeout)');
            throw new Error(`Pterodactyl error: ${err.message}`);
        }
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

        const baseUrl = normalizePteroUrl(server.url);
        const headers = { Authorization: `Bearer ${server.apiKey}`, Accept: 'application/json' };

        const [nestsRes, locationsRes, nodesRes] = await Promise.all([
            axios.get(`${baseUrl}/api/application/nests`, { headers, httpsAgent: agent }),
            axios.get(`${baseUrl}/api/application/locations`, { headers, httpsAgent: agent }),
            axios.get(`${baseUrl}/api/application/nodes`, { headers, httpsAgent: agent })
        ]);

        // Fetch eggs for each nest
        const nests = nestsRes.data.data;
        const nestsWithEggs = await Promise.all(nests.map(async (nest: any) => {
            const eggsRes = await axios.get(`${baseUrl}/api/application/nests/${nest.attributes.id}/eggs?include=variables`, { headers, httpsAgent: agent });
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
        console.error('PTERODACTYL METADATA FETCH ERROR:', error.response?.data || error.message);
        res.status(500).json({
            message: 'Error fetching Pterodactyl metadata',
            error: error.message,
            details: error.response?.data
        });
    }
};
