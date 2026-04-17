import React, { useEffect, useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { HardDrive, Plus, Trash2, Power, CheckCircle, XCircle } from 'lucide-react';
import api from '../../api';

const Infrastructure = () => {
  const [servers, setServers] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'PROXMOX', url: '', apiKey: '', secret: '', node: '' });
  const [testingId, setTestingId] = useState<number | null>(null);
  const [isRawTesting, setIsRawTesting] = useState(false);

  useEffect(() => {
    fetchServers();
  }, []);

  const fetchServers = async () => {
    try {
      const res = await api.get('/admin/infrastructure');
      setServers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/infrastructure', form);
      alert('Server added');
      setShowAdd(false);
      setForm({ name: '', type: 'PROXMOX', url: '', apiKey: '', secret: '', node: '' });
      fetchServers();
    } catch (err) {
      alert('Failed to add server');
    }
  };

  const handleTest = async (id: number) => {
    setTestingId(id);
    try {
      const res = await api.post(`/admin/infrastructure/${id}/test`);
      alert(res.data.message);
    } catch (err) {
      alert('Connection failed');
    } finally {
      setTestingId(null);
    }
  };

  const handleRawTest = async () => {
     if(!form.url || !form.apiKey) return alert('Fill URL and API Key first');
     setIsRawTesting(true);
     try {
        const res = await api.post('/admin/infrastructure/test-raw', form);
        alert(res.data.message);
     } catch (err: any) {
        alert('Connection failed: ' + (err.response?.data?.message || err.message));
     } finally {
        setIsRawTesting(false);
     }
  };

  const toggleActive = async (server: any) => {
     try {
        await api.put(`/admin/infrastructure/${server.id}`, { ...server, isActive: !server.isActive });
        fetchServers();
     } catch (err) {
        alert('Update failed');
     }
  };

  const handleDelete = async (id: number) => {
     if(!confirm('Remove this server?')) return;
     try {
        await api.delete(`/admin/infrastructure/${id}`);
        fetchServers();
     } catch (err) {
        alert('Delete failed');
     }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-black text-gray-900">Node Infrastructure</h2>
        <Button onClick={() => setShowAdd(!showAdd)} className="gap-2">
           <Plus className="w-4 h-4" /> Add Physical Server
        </Button>
      </div>

      {showAdd && (
         <Card className="p-8 border-2 border-blue-100 bg-blue-50/20 shadow-xl overflow-hidden">
            <h3 className="text-xl font-bold mb-6">New Backend Server</h3>
            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <Input label="Display Name" placeholder={form.type === 'PROXMOX' ? "e.g. Proxmox-Node-01" : "e.g. Game-Panel-Main"} value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
               <div className="space-y-1">
                  <label className="text-sm font-medium ml-1">Server Type</label>
                  <select className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-white font-bold" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                     <option value="PROXMOX">Proxmox VE (VPS)</option>
                     <option value="PTERODACTYL">Pterodactyl (Games)</option>
                  </select>
               </div>

               <Input label="API URL" placeholder={form.type === 'PROXMOX' ? "https://ip:8006/api2/json" : "https://panel.example.com"} value={form.url} onChange={e => setForm({...form, url: e.target.value})} required />

               <Input
                 label={form.type === 'PROXMOX' ? "API Token ID" : "Application API Key"}
                 placeholder={form.type === 'PROXMOX' ? "root@pam!infralyonix" : "ptla_xxxxxxxx"}
                 value={form.apiKey}
                 onChange={e => setForm({...form, apiKey: e.target.value})}
                 required
               />

               <div className="space-y-1">
                  <Input
                    label={form.type === 'PROXMOX' ? "API Secret" : "Account (Client) API Key (Secret)"}
                    type="password"
                    placeholder={form.type === 'PROXMOX' ? "xxxxxxxx-xxxx-..." : "ptlc_xxxxxxxx"}
                    value={form.secret}
                    onChange={e => setForm({...form, secret: e.target.value})}
                    required
                  />
                  {form.type === 'PTERODACTYL' && (
                     <p className="text-[10px] text-rose-500 font-black ml-1 uppercase">
                        ⚠️ OBLIGATOIRE : Créez une "Account API Key" sur votre profil Pterodactyl (pas l'admin) pour autoriser Start/Stop/Reboot.
                     </p>
                  )}
               </div>

               {form.type === 'PROXMOX' && (
                  <Input label="Default Node (ID)" placeholder="e.g. pve" value={form.node} onChange={e => setForm({...form, node: e.target.value})} required />
               )}

               <div className="md:col-span-2 flex justify-between items-center pt-4 border-t border-gray-100">
                  <Button type="button" variant="secondary" onClick={handleRawTest} isLoading={isRawTesting}>Test Configuration</Button>
                  <div className="flex gap-3">
                     <Button variant="ghost" onClick={() => setShowAdd(false)}>Cancel</Button>
                     <Button type="submit">Add Server</Button>
                  </div>
               </div>
            </form>
         </Card>
      )}

      <div className="grid grid-cols-1 gap-6">
         {servers.map(server => (
            <Card key={server.id} className={`hover:shadow-lg transition-all border-none ${!server.isActive ? 'opacity-60' : ''}`}>
               <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6">
                  <div className="flex items-center gap-4">
                     <div className={`p-4 rounded-2xl ${server.type === 'PROXMOX' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'}`}>
                        <HardDrive className="w-6 h-6" />
                     </div>
                     <div>
                        <h3 className="text-xl font-bold text-gray-900">{server.name}</h3>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{server.url}</p>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-8 items-center">
                     <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Status</p>
                        <Badge variant={server.isActive ? 'success' : 'danger'}>{server.isActive ? 'ONLINE' : 'OFFLINE'}</Badge>
                     </div>
                     <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Type</p>
                        <p className="font-bold text-gray-700 text-sm">{server.type}</p>
                     </div>
                     <div className="hidden md:block">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Node</p>
                        <p className="text-xs font-bold text-gray-600">{server.node || 'Default'}</p>
                     </div>
                  </div>

                  <div className="flex gap-2">
                     <Button variant="secondary" size="sm" isLoading={testingId === server.id} onClick={() => handleTest(server.id)}>Test Connect</Button>
                     <button
                        onClick={() => toggleActive(server)}
                        className={`p-2 rounded-lg transition-all ${server.isActive ? 'bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white'}`}
                        title={server.isActive ? 'Deactivate Server' : 'Activate Server'}
                     >
                        <Power className="w-4 h-4" />
                     </button>
                     <button
                        onClick={() => handleDelete(server.id)}
                        className="p-2 bg-gray-100 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-all"
                        title="Remove Server"
                     >
                        <Trash2 className="w-4 h-4" />
                     </button>
                  </div>
               </div>
            </Card>
         ))}
         {servers.length === 0 && !showAdd && <Card className="text-center py-20 border-2 border-dashed border-gray-100 font-bold text-gray-400">No infrastructure servers added yet.</Card>}
      </div>
    </div>
  );
};

export default Infrastructure;
