import { ProvisioningAdapter } from '../provisioning.interface.js';
import axios from 'axios';
import https from 'https';
import { createLog } from '../../../utils/logger.js';

export class ProxmoxAdapter implements ProvisioningAdapter {
  private agent = new https.Agent({ rejectUnauthorized: false });

  private async getAuthHeader(server: any) {
    return {
      Authorization: `PVEAPIToken=${server.apiKey}=${server.secret}`
    };
  }

  async create(config: any, server: any): Promise<string> {
    const node = server.node || 'pve';
    const nextIdRes = await axios.get(`${server.url}/cluster/nextid`, {
      headers: await this.getAuthHeader(server),
      httpsAgent: this.agent
    });
    const vmid = nextIdRes.data.data;

    const requestData = {
      vmid,
      name: config.name || `vps-${vmid}`,
      memory: parseInt(config.ram) * 1024 || 2048,
      cores: config.cpu || 2,
      net0: 'virtio,bridge=vmbr0',
      scsihw: 'virtio-scsi-pci',
      virtio0: `local-lvm:vm-${vmid}-disk-1,size=${config.disk || '20G'}`
    };

    try {
        await axios.post(`${server.url}/nodes/${node}/qemu`, requestData, {
          headers: await this.getAuthHeader(server),
          httpsAgent: this.agent
        });
        createLog({ type: 'PROVISIONING', level: 'INFO', message: `Proxmox VM created: ${vmid}`, details: { request: requestData } });
        return vmid.toString();
    } catch (err: any) {
        createLog({ type: 'ERROR', level: 'ERROR', message: `Proxmox VM creation failed: ${vmid}`, details: { error: err.message, request: requestData } });
        throw err;
    }
  }

  async suspend(externalId: string, server: any): Promise<boolean> {
    const node = server.node || 'pve';
    // Suspend in PVE context often means 'pause' or 'hibernate'.
    // Usually providers 'stop' the VM for suspension.
    await axios.post(`${server.url}/nodes/${node}/qemu/${externalId}/status/stop`, {}, {
      headers: await this.getAuthHeader(server),
      httpsAgent: this.agent
    });
    return true;
  }

  async unsuspend(externalId: string, server: any): Promise<boolean> {
    const node = server.node || 'pve';
    await axios.post(`${server.url}/nodes/${node}/qemu/${externalId}/status/start`, {}, {
      headers: await this.getAuthHeader(server),
      httpsAgent: this.agent
    });
    return true;
  }

  async terminate(externalId: string, server: any): Promise<boolean> {
    const node = server.node || 'pve';
    await axios.delete(`${server.url}/nodes/${node}/qemu/${externalId}`, {
      headers: await this.getAuthHeader(server),
      httpsAgent: this.agent
    });
    return true;
  }

  async powerAction(externalId: string, action: string, server: any): Promise<boolean> {
    const node = server.node || 'pve';
    const pxAction = action === 'stop' ? 'stop' : action === 'start' ? 'start' : 'reboot';

    try {
        await axios.post(`${server.url}/nodes/${node}/qemu/${externalId}/status/${pxAction}`, {}, {
          headers: await this.getAuthHeader(server),
          httpsAgent: this.agent,
          timeout: 10000
        });
    } catch (err: any) {
        if (action === 'stop') {
            // Try forced stop if graceful stop fails
            await axios.post(`${server.url}/nodes/${node}/qemu/${externalId}/status/stop`, {}, {
                headers: await this.getAuthHeader(server),
                httpsAgent: this.agent
            });
        } else {
            throw err;
        }
    }
    return true;
  }
}
