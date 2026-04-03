import { ProvisioningAdapter } from '../provisioning.interface.js';
import axios from 'axios';
import https from 'https';
import { createLog } from '../../../utils/logger.js';

export class PterodactylAdapter implements ProvisioningAdapter {
  private agent = new https.Agent({ rejectUnauthorized: false });

  private async getAuthHeader(server: any) {
    return {
      Authorization: `Bearer ${server.apiKey}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }

  async create(config: any, server: any): Promise<string> {
    const requestData: any = {
      name: config.name || 'Game Server',
      user: parseInt(config.pterodactyl_user_id) || 1,
      egg: parseInt(config.egg_id),
      docker_image: config.docker_image,
      startup: config.startup,
      environment: config.environment || {},
      limits: {
        memory: parseInt(config.memory) || 1024,
        swap: parseInt(config.swap) || 0,
        disk: parseInt(config.disk) || 5120,
        io: parseInt(config.io) || 500,
        cpu: parseInt(config.cpu) || 100
      },
      feature_limits: {
        databases: parseInt(config.databases) || 0,
        allocations: parseInt(config.allocations) || 1,
        backups: parseInt(config.backups) || 0
      }
    };

    // Deployment logic
    if (config.deploy_mode === 'location') {
        requestData.deploy = {
            locations: [parseInt(config.location_id)],
            dedicated_ip: false,
            port_range: []
        };
    } else {
        requestData.allocation = {
            default: parseInt(config.allocation_id)
        };
    }

    try {
        const res = await axios.post(`${server.url}/api/application/servers`, requestData, {
          headers: await this.getAuthHeader(server),
          httpsAgent: this.agent
        });
        createLog({ type: 'PROVISIONING', level: 'INFO', message: `Pterodactyl server created: ${res.data.attributes.identifier}`, details: { request: requestData, response: res.data } });
        return res.data.attributes.id.toString();
    } catch (err: any) {
        createLog({ type: 'ERROR', level: 'ERROR', message: `Pterodactyl server creation failed`, details: { error: err.message, request: requestData } });
        throw err;
    }
  }

  async suspend(externalId: string, server: any): Promise<boolean> {
    await axios.post(`${server.url}/api/application/servers/${externalId}/suspend`, {}, {
      headers: await this.getAuthHeader(server),
      httpsAgent: this.agent
    });
    return true;
  }

  async terminate(externalId: string, server: any): Promise<boolean> {
    await axios.delete(`${server.url}/api/application/servers/${externalId}`, {
      headers: await this.getAuthHeader(server),
      httpsAgent: this.agent
    });
    return true;
  }

  async powerAction(externalId: string, action: string, server: any): Promise<boolean> {
    // Pterodactyl client API is needed for power actions usually, or application API for some
    // Assuming application API for simplicity in this structure
    const signal = action === 'stop' ? 'kill' : action === 'start' ? 'start' : 'restart';
    await axios.post(`${server.url}/api/client/servers/${externalId}/power`, { signal }, {
      headers: await this.getAuthHeader(server),
      httpsAgent: this.agent
    });
    return true;
  }
}
