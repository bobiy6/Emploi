import { ProvisioningAdapter } from '../provisioning.interface.js';
import axios from 'axios';
import https from 'https';
import { createLog } from '../../../utils/logger.js';

export class PterodactylAdapter implements ProvisioningAdapter {
  private agent = new https.Agent({ rejectUnauthorized: false });

  private getNormalizedUrl(url: string) {
    let normalized = url.replace(/\/+$/, '');
    if (normalized.endsWith('/api')) {
        normalized = normalized.substring(0, normalized.length - 4);
    }
    return normalized;
  }

  private async getAuthHeader(server: any) {
    return {
      Authorization: `Bearer ${server.apiKey}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }

  private async getOrCreateUser(email: string, name: string, server: any): Promise<{ id: number, password?: string }> {
      const baseUrl = this.getNormalizedUrl(server.url);
      const headers = await this.getAuthHeader(server);

      try {
          // Search user by email
          const searchRes = await axios.get(`${baseUrl}/api/application/users?filter[email]=${encodeURIComponent(email)}`, { headers, httpsAgent: this.agent });
          if (searchRes.data.data.length > 0) {
              return { id: searchRes.data.data[0].attributes.id };
          }

          // Create if not exists
          const splitName = name.trim().split(/\s+/);
          const firstName = splitName[0] || 'User';
          const lastName = splitName.slice(1).join(' ') || 'HostDash';

          // Sanitize username: only a-z, A-Z, 0-9 and _ . - are usually allowed
          const sanitizedUsername = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '') + Math.floor(100 + Math.random() * 900);
          const generatedPassword = Math.random().toString(36).slice(-10) + 'A1!';

          const createRes = await axios.post(`${baseUrl}/api/application/users`, {
              email,
              username: sanitizedUsername,
              first_name: firstName,
              last_name: lastName,
              password: generatedPassword
          }, { headers, httpsAgent: this.agent });

          return { id: createRes.data.attributes.id, password: generatedPassword };
      } catch (err: any) {
          if (err.response?.status === 403) {
              throw new Error('Action non autorisée sur Pterodactyl. Vérifiez que votre clé API dispose des permissions "Read & Write" pour les USERS.');
          }
          const apiError = err.response?.data?.errors?.[0]?.detail || err.message;
          console.error('Pterodactyl User Sync Error:', err.response?.data || err.message);
          throw new Error(`Failed to sync user: ${apiError}`);
      }
  }

  async create(config: any, server: any): Promise<string> {
    const baseUrl = this.getNormalizedUrl(server.url);

    // 1. Get or Create Pterodactyl User
    const userResult = await this.getOrCreateUser(config.userEmail, config.userName, server);
    const pteroUserId = userResult.id;

    // 2. Build Creation Payload
    const requestData: any = {
      name: config.name || 'Game Server',
      user: pteroUserId,
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
      },
      deploy: {
          locations: [parseInt(config.location_id)],
          dedicated_ip: false,
          port_range: []
      },
      start_on_completion: true
    };

    try {
        const res = await axios.post(`${baseUrl}/api/application/servers`, requestData, {
          headers: await this.getAuthHeader(server),
          httpsAgent: this.agent
        });

        // Return JSON with server ID and connection info
        const serverData = res.data.attributes;

        // Pterodactyl doesn't always return the allocation in the creation response
        // Fetch it now to get the IP:PORT
        let connectionInfo = "Pending allocation...";
        try {
            const detailRes = await axios.get(`${baseUrl}/api/application/servers/${serverData.id}?include=allocations`, {
                headers: await this.getAuthHeader(server),
                httpsAgent: this.agent
            });
            const primary = detailRes.data.attributes.relationships?.allocations?.data.find((a: any) => a.attributes.is_default);
            if (primary) {
                connectionInfo = `${primary.attributes.ip}:${primary.attributes.port}`;
            }
        } catch (err) {
            console.error('Failed to fetch allocation details', err);
        }

        const result = {
            id: serverData.id,
            uuid: serverData.uuid,
            identifier: serverData.identifier,
            connection: connectionInfo,
            panel_url: baseUrl,
            ptero_password: userResult.password || 'Existing account password'
        };

        createLog({
            type: 'PROVISIONING',
            level: 'INFO',
            message: `Pterodactyl server created: ${serverData.identifier}`,
            details: { response: result }
        });

        return JSON.stringify(result);
    } catch (err: any) {
        console.error('PTERODACTYL CREATE ERROR:', err.response?.data || err.message);
        const errorMessage = err.response?.data?.errors?.[0]?.detail || err.message;
        createLog({ type: 'ERROR', level: 'ERROR', message: `Pterodactyl server creation failed: ${errorMessage}` });
        throw new Error(errorMessage);
    }
  }

  private getInternalId(externalId: string): string {
    try {
        const data = JSON.parse(externalId);
        return data.id?.toString() || externalId;
    } catch {
        return externalId;
    }
  }

  async suspend(externalId: string, server: any): Promise<boolean> {
    const baseUrl = this.getNormalizedUrl(server.url);
    const id = this.getInternalId(externalId);
    await axios.post(`${baseUrl}/api/application/servers/${id}/suspend`, {}, {
      headers: await this.getAuthHeader(server),
      httpsAgent: this.agent
    });
    return true;
  }

  async terminate(externalId: string, server: any): Promise<boolean> {
    const baseUrl = this.getNormalizedUrl(server.url);
    const id = this.getInternalId(externalId);
    await axios.delete(`${baseUrl}/api/application/servers/${id}`, {
      headers: await this.getAuthHeader(server),
      httpsAgent: this.agent
    });
    return true;
  }

  async powerAction(externalId: string, action: string, server: any): Promise<boolean> {
    const baseUrl = this.getNormalizedUrl(server.url);
    const id = this.getInternalId(externalId);

    // Pterodactyl Client API is usually at /api/client/servers/<identifier>/power
    let identifier = id;
    try {
        const data = JSON.parse(externalId);
        identifier = data.identifier || id;
    } catch {}

    const signal = action === 'stop' ? 'stop' : action === 'start' ? 'start' : 'restart';

    try {
        await axios.post(`${baseUrl}/api/client/servers/${identifier}/power`, { signal }, {
          headers: await this.getAuthHeader(server),
          httpsAgent: this.agent
        });
    } catch (err: any) {
        // If 'stop' failed, try 'kill' as fallback
        if (action === 'stop') {
            await axios.post(`${baseUrl}/api/client/servers/${identifier}/power`, { signal: 'kill' }, {
                headers: await this.getAuthHeader(server),
                httpsAgent: this.agent
            });
        } else {
            throw err;
        }
    }
    return true;
  }

  async getLatestDetails(externalId: string, server: any): Promise<any> {
    const baseUrl = this.getNormalizedUrl(server.url);
    const id = this.getInternalId(externalId);
    const headers = await this.getAuthHeader(server);

    const res = await axios.get(`${baseUrl}/api/application/servers/${id}?include=allocations`, {
        headers,
        httpsAgent: this.agent
    });

    const serverData = res.data.attributes;
    const primary = serverData.relationships?.allocations?.data.find((a: any) => a.attributes.is_default);

    return {
        id: serverData.id,
        uuid: serverData.uuid,
        identifier: serverData.identifier,
        connection: primary ? `${primary.attributes.ip}:${primary.attributes.port}` : "Pending allocation...",
        panel_url: baseUrl
    };
  }
}
