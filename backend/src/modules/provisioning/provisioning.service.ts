import { ProxmoxAdapter } from './adapters/proxmox.adapter.js';
import { PterodactylAdapter } from './adapters/pterodactyl.adapter.js';

const adapters: Record<string, any> = {
  proxmox: new ProxmoxAdapter(),
  pterodactyl: new PterodactylAdapter()
};

export const getAdapter = (module: string) => {
  return adapters[module];
};
