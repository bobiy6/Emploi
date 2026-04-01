import { ProxmoxAdapter } from './adapters/proxmox.adapter.js';
import { PterodactylAdapter } from './adapters/pterodactyl.adapter.js';
import prisma from '../../config/prisma.js';

const adapters: Record<string, any> = {
  proxmox: new ProxmoxAdapter(),
  pterodactyl: new PterodactylAdapter()
};

export const getAdapter = (module: string) => {
  return adapters[module];
};

export const getBestServer = async (type: string) => {
  const dbType = type === 'VPS' ? 'PROXMOX' : 'PTERODACTYL';
  const servers = await prisma.server.findMany({
    where: { type: dbType, isActive: true },
    orderBy: { createdAt: 'asc' } // Simple load balancer: first created first served
  });
  return servers[0] || null;
};
