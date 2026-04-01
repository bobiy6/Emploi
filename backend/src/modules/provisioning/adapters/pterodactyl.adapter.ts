import { ProvisioningAdapter } from '../provisioning.interface.js';
export class PterodactylAdapter implements ProvisioningAdapter {
  async create(config: any): Promise<string> { console.log('[PTERODACTYL] Creating Server'); return `srv-${Math.floor(Math.random() * 10000)}`; }
  async suspend(externalId: string): Promise<boolean> { console.log('[PTERODACTYL] Suspending Server'); return true; }
  async terminate(externalId: string): Promise<boolean> { console.log('[PTERODACTYL] Terminating Server'); return true; }
  async powerAction(externalId: string, action: string): Promise<boolean> { console.log(`[PTERODACTYL] Power action ${action}`); return true; }
}
