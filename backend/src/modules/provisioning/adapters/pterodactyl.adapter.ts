import { ProvisioningAdapter } from '../provisioning.interface.js';
import axios from 'axios';

export class PterodactylAdapter implements ProvisioningAdapter {
  private async getAuthHeader(server: any) {
    return {
      Authorization: `Bearer ${server.apiKey}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }

  async create(config: any, server: any): Promise<string> {
    const res = await axios.post(`${server.url}/api/application/servers`, {
      name: config.name || 'Game Server',
      user: config.pterodactyl_user_id || 1,
      egg: config.egg_id || 1,
      docker_image: config.docker_image || 'quay.io/pterodactyl/core:java',
      startup: config.startup || 'java -Xms128M -Xmx{{SERVER_MEMORY}}M -jar {{SERVER_JARFILE}}',
      limits: {
        memory: parseInt(config.ram) || 1024,
        swap: 0,
        disk: parseInt(config.disk) || 5120,
        io: 500,
        cpu: config.cpu_limit || 100
      },
      feature_limits: {
        databases: 0,
        allocations: 1,
        backups: 0
      },
      allocation: {
        default: config.allocation_id || 1
      }
    }, { headers: await this.getAuthHeader(server) });

    return res.data.attributes.id.toString();
  }

  async suspend(externalId: string, server: any): Promise<boolean> {
    await axios.post(`${server.url}/api/application/servers/${externalId}/suspend`, {}, { headers: await this.getAuthHeader(server) });
    return true;
  }

  async terminate(externalId: string, server: any): Promise<boolean> {
    await axios.delete(`${server.url}/api/application/servers/${externalId}`, { headers: await this.getAuthHeader(server) });
    return true;
  }

  async powerAction(externalId: string, action: string, server: any): Promise<boolean> {
    // Pterodactyl client API is needed for power actions usually, or application API for some
    // Assuming application API for simplicity in this structure
    const signal = action === 'stop' ? 'kill' : action === 'start' ? 'start' : 'restart';
    await axios.post(`${server.url}/api/client/servers/${externalId}/power`, { signal }, { headers: await this.getAuthHeader(server) });
    return true;
  }
}
