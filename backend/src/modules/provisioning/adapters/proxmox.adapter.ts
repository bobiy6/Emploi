import { ProvisioningAdapter } from '../provisioning.interface.js';
import axios from 'axios';

export class ProxmoxAdapter implements ProvisioningAdapter {
  private async getAuthHeader(server: any) {
    return {
      Authorization: `PVEAPIToken=${server.apiKey}=${server.secret}`
    };
  }

  async create(config: any, server: any): Promise<string> {
    const node = server.node || 'pve';
    const nextIdRes = await axios.get(`${server.url}/cluster/nextid`, { headers: await this.getAuthHeader(server) });
    const vmid = nextIdRes.data.data;

    await axios.post(`${server.url}/nodes/${node}/qemu`, {
      vmid,
      name: config.name || `vps-${vmid}`,
      memory: parseInt(config.ram) * 1024 || 2048,
      cores: config.cpu || 2,
      net0: 'virtio,bridge=vmbr0',
      scsihw: 'virtio-scsi-pci',
      virtio0: `local-lvm:vm-${vmid}-disk-1,size=${config.disk || '20G'}`
    }, { headers: await this.getAuthHeader(server) });

    return vmid.toString();
  }

  async suspend(externalId: string, server: any): Promise<boolean> {
    const node = server.node || 'pve';
    await axios.post(`${server.url}/nodes/${node}/qemu/${externalId}/status/suspend`, {}, { headers: await this.getAuthHeader(server) });
    return true;
  }

  async terminate(externalId: string, server: any): Promise<boolean> {
    const node = server.node || 'pve';
    await axios.delete(`${server.url}/nodes/${node}/qemu/${externalId}`, { headers: await this.getAuthHeader(server) });
    return true;
  }

  async powerAction(externalId: string, action: string, server: any): Promise<boolean> {
    const node = server.node || 'pve';
    const pxAction = action === 'stop' ? 'stop' : action === 'start' ? 'start' : 'reboot';
    await axios.post(`${server.url}/nodes/${node}/qemu/${externalId}/status/${pxAction}`, {}, { headers: await this.getAuthHeader(server) });
    return true;
  }
}
