import { ProvisioningAdapter } from '../provisioning.interface.js';
export class ProxmoxAdapter implements ProvisioningAdapter {
  async create(config: any): Promise<string> { console.log('[PROXMOX] Creating VM'); return `vm-${Math.floor(Math.random() * 10000)}`; }
  async suspend(externalId: string): Promise<boolean> { console.log('[PROXMOX] Suspending VM'); return true; }
  async terminate(externalId: string): Promise<boolean> { console.log('[PROXMOX] Terminating VM'); return true; }
  async powerAction(externalId: string, action: string): Promise<boolean> { console.log(`[PROXMOX] Power action ${action}`); return true; }
}
