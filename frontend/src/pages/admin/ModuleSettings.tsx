import React, { useEffect, useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Settings, Shield, Link, Database, Cpu, Lock } from 'lucide-react';
import api from '../../api';

const ModuleSettings = () => {
  const [settings, setSettings] = useState<any>({
    proxmox: { url: '', apiToken: '', secret: '', node: '' },
    pterodactyl: { url: '', apiKey: '' }
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/admin/settings');
      if (res.data.proxmox) setSettings(prev => ({ ...prev, proxmox: res.data.proxmox }));
      if (res.data.pterodactyl) setSettings(prev => ({ ...prev, pterodactyl: res.data.pterodactyl }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdate = async (key: string, value: any) => {
    setLoading(true);
    try {
      await api.post('/admin/settings', { key, value });
      alert(`${key} settings updated successfully!`);
    } catch (err) {
      alert('Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex items-center gap-3">
         <div className="p-3 bg-blue-600 rounded-2xl text-white">
            <Settings className="w-6 h-6" />
         </div>
         <h2 className="text-3xl font-black text-gray-900">Module Configuration</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Proxmox Settings */}
        <Card className="p-8 border-none shadow-xl">
           <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-50">
              <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                 <Shield className="w-5 h-5" />
              </div>
              <div>
                 <h3 className="text-xl font-bold">Proxmox VE</h3>
                 <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">VPS Provisioning</p>
              </div>
           </div>

           <div className="space-y-6">
              <Input
                label="API URL"
                placeholder="https://pve.example.com:8006/api2/json"
                value={settings.proxmox.url}
                onChange={e => setSettings({...settings, proxmox: {...settings.proxmox, url: e.target.value}})}
              />
              <Input
                label="API Token ID"
                placeholder="root@pam!tokenid"
                value={settings.proxmox.apiToken}
                onChange={e => setSettings({...settings, proxmox: {...settings.proxmox, apiToken: e.target.value}})}
              />
              <Input
                label="API Secret"
                type="password"
                placeholder="••••••••••••••••"
                value={settings.proxmox.secret}
                onChange={e => setSettings({...settings, proxmox: {...settings.proxmox, secret: e.target.value}})}
              />
              <Input
                label="Default Node"
                placeholder="pve1"
                value={settings.proxmox.node}
                onChange={e => setSettings({...settings, proxmox: {...settings.proxmox, node: e.target.value}})}
              />
              <Button
                className="w-full h-12 mt-4 bg-orange-600 hover:bg-orange-700"
                onClick={() => handleUpdate('proxmox', settings.proxmox)}
                isLoading={loading}
              >
                 Connect Proxmox
              </Button>
           </div>
        </Card>

        {/* Pterodactyl Settings */}
        <Card className="p-8 border-none shadow-xl">
           <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-50">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                 <Database className="w-5 h-5" />
              </div>
              <div>
                 <h3 className="text-xl font-bold">Pterodactyl</h3>
                 <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Game Server Management</p>
              </div>
           </div>

           <div className="space-y-6">
              <Input
                label="Panel URL"
                placeholder="https://panel.example.com"
                value={settings.pterodactyl.url}
                onChange={e => setSettings({...settings, pterodactyl: {...settings.pterodactyl, url: e.target.value}})}
              />
              <Input
                label="Application API Key"
                type="password"
                placeholder="ptla_••••••••"
                value={settings.pterodactyl.apiKey}
                onChange={e => setSettings({...settings, pterodactyl: {...settings.pterodactyl, apiKey: e.target.value}})}
              />
              <div className="p-6 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-start gap-3">
                 <Lock className="w-5 h-5 text-blue-400 mt-0.5" />
                 <p className="text-xs text-blue-700 font-medium leading-relaxed">
                    Make sure the API key has "Read & Write" permissions for Servers, Nodes, and Allocations.
                 </p>
              </div>
              <Button
                className="w-full h-12 mt-4"
                onClick={() => handleUpdate('pterodactyl', settings.pterodactyl)}
                isLoading={loading}
              >
                 Connect Pterodactyl
              </Button>
           </div>
        </Card>
      </div>
    </div>
  );
};

export default ModuleSettings;
