import React, { useState, useEffect } from 'react';
import api from '../../api';
import { Mail, Save, Play, Trash2, Plus, Edit2, Settings } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';

const EmailManager = () => {
    const [activeTab, setActiveTab] = useState('settings');
    const [smtp, setSmtp] = useState({ host: '', port: 587, user: '', pass: '', from: '', secure: false });
    const [templates, setTemplates] = useState([]);
    const [campaigns, setCampaigns] = useState([]);
    const [emailLogs, setEmailLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [testResult, setTestResult] = useState(null);
    const [showCampaignModal, setShowCampaignModal] = useState(false);
    const [newCampaign, setNewCampaign] = useState({ name: '', templateId: '', target: 'ALL', scheduledAt: '' });
    const [showTemplateModal, setShowTemplateModal] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<any>(null);

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        try {
            if (activeTab === 'settings') {
                const res = await api.get('/admin/email/settings');
                setSmtp(res.data);
            } else if (activeTab === 'templates') {
                const res = await api.get('/admin/email/templates');
                setTemplates(res.data);
            } else if (activeTab === 'campaigns') {
                const res = await api.get('/admin/email/campaigns');
                setCampaigns(res.data);
            } else if (activeTab === 'logs') {
                const res = await api.get('/admin/email/logs');
                setEmailLogs(res.data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const upsertTemplate = async () => {
        try {
            if (editingTemplate.id) {
                await api.put(`/admin/email/templates/${editingTemplate.id}`, editingTemplate);
            } else {
                await api.post('/admin/email/templates', editingTemplate);
            }
            setShowTemplateModal(false);
            fetchData();
        } catch (err) {
            alert('Failed to save template');
        }
    };

    const deleteTemplate = async (id: number) => {
        if (!confirm('Are you sure?')) return;
        try {
            await api.delete(`/admin/email/templates/${id}`);
            fetchData();
        } catch (err) {
            alert('Failed to delete template');
        }
    };

    const createCampaign = async () => {
        try {
            await api.post('/admin/email/campaigns', {
                ...newCampaign,
                templateId: parseInt(newCampaign.templateId)
            });
            setShowCampaignModal(false);
            fetchData();
        } catch (err) {
            alert('Failed to create campaign');
        }
    };

    const syncTemplates = async () => {
        try {
            await api.post('/admin/email/templates/sync');
            alert('Templates synchronisés');
            if (activeTab === 'templates') fetchData();
        } catch (err) {
            alert('Échec de la synchronisation');
        }
    };

    const sendCampaign = async (id: number) => {
        try {
            await api.post(`/admin/email/campaigns/${id}/send`);
            alert('Campaign queued');
            fetchData();
        } catch (err) {
            alert('Failed to send campaign');
        }
    };

    const saveSettings = async () => {
        setLoading(true);
        try {
            await api.post('/admin/email/settings', smtp);
            alert('Settings saved');
        } catch (err) {
            alert('Failed to save');
        } finally {
            setLoading(false);
        }
    };

    const testConnection = async () => {
        const testEmail = prompt("Entrez une adresse email pour envoyer un email de test (laisser vide pour tester uniquement la connexion) :");

        setLoading(true);
        setTestResult(null);
        try {
            await api.post('/admin/email/settings/test', { testEmail });
            setTestResult({ success: true, message: testEmail ? `Connexion réussie et email envoyé à ${testEmail}` : 'Connexion réussie !' });
        } catch (err: any) {
            setTestResult({ success: false, message: err.response?.data?.error || 'Connection failed' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-[#001747] rounded-xl shadow-lg">
                        <Mail className="w-6 h-6 text-[#0050d7]" />
                    </div>
                    <h2 className="text-3xl font-black text-gray-900">Email Manager</h2>
                </div>
                <div className="flex bg-gray-100 p-1.5 rounded-xl border border-gray-200">
                    {['settings', 'templates', 'campaigns', 'logs'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-5 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-white text-[#0050d7] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {activeTab === 'settings' && (
                <Card className="max-w-2xl p-8 border-none shadow-xl">
                    <h3 className="text-xl font-bold text-gray-900 mb-8 flex items-center gap-2">
                        <Settings className="w-5 h-5 text-blue-500" /> Infrastructure SMTP
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <Input label="Hôte SMTP" value={smtp.host} onChange={e => setSmtp({...smtp, host: e.target.value})} placeholder="smtp.provider.com" />
                        <Input label="Port" type="number" value={smtp.port} onChange={e => setSmtp({...smtp, port: parseInt(e.target.value)})} />
                        <Input label="Utilisateur" value={smtp.user} onChange={e => setSmtp({...smtp, user: e.target.value})} />
                        <Input label="Mot de passe" type="password" value={smtp.pass} onChange={e => setSmtp({...smtp, pass: e.target.value})} />
                        <div className="md:col-span-2">
                            <Input label="Email d'expédition" type="email" value={smtp.from} onChange={e => setSmtp({...smtp, from: e.target.value})} placeholder="noreply@infralyonix.com" />
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <Button onClick={saveSettings} loading={loading} className="flex-1">Sauvegarder</Button>
                        <Button variant="outline" onClick={testConnection} disabled={loading} className="flex-1">Tester la connexion</Button>
                    </div>
                    {testResult && (
                        <div className={`mt-6 p-4 rounded-xl border-2 font-bold text-sm ${testResult.success ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                            {testResult.message}
                        </div>
                    )}
                </Card>
            )}

            {activeTab === 'templates' && (
                <div className="space-y-6">
                    <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={syncTemplates}>Sync Defaults</Button>
                        <Button onClick={() => { setEditingTemplate({ name: '', subject: '', content: '', type: 'TRANSACTIONAL' }); setShowTemplateModal(true); }} className="gap-2">
                            <Plus size={16} /> Nouveau Template
                        </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {templates.map((t: any) => (
                            <Card key={t.id} className="p-6 hover:border-blue-500 transition-all group shadow-lg">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-2 bg-blue-50 rounded-lg text-[#0050d7]">
                                        <Mail size={20} />
                                    </div>
                                    <div className="flex gap-1">
                                        <button onClick={() => { setEditingTemplate(t); setShowTemplateModal(true); }} className="p-2 text-gray-400 hover:text-blue-600"><Edit2 size={14} /></button>
                                        <button onClick={() => deleteTemplate(t.id)} className="p-2 text-gray-400 hover:text-red-600"><Trash2 size={14} /></button>
                                    </div>
                                </div>
                                <h3 className="font-bold text-gray-900 mb-1">{t.name}</h3>
                                <p className="text-xs text-gray-400 mb-4 line-clamp-1 font-medium">{t.subject}</p>
                                <Badge variant={t.type === 'TRANSACTIONAL' ? 'primary' : 'success'} className="text-[10px] tracking-widest">{t.type}</Badge>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'logs' && (
                <Card className="p-0 border-none shadow-xl overflow-hidden">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-xs font-black text-gray-400 uppercase tracking-widest">
                                <th className="px-8 py-5">Timestamp</th>
                                <th className="px-8 py-5">Destinataire</th>
                                <th className="px-8 py-5">Message</th>
                                <th className="px-8 py-5">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {emailLogs.map((l: any) => (
                                <tr key={l.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-8 py-6 text-xs font-bold text-gray-400">{new Date(l.createdAt).toLocaleString()}</td>
                                    <td className="px-8 py-6 text-sm font-bold text-gray-900">{l.details?.to || 'System'}</td>
                                    <td className="px-8 py-6 text-sm font-medium text-gray-600">{l.message}</td>
                                    <td className="px-8 py-6">
                                        <Badge variant={l.level === 'INFO' ? 'success' : 'danger'}>{l.level}</Badge>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Card>
            )}

            {activeTab === 'campaigns' && (
                <div className="space-y-6">
                    <div className="flex justify-end">
                        <Button onClick={() => setShowCampaignModal(true)} className="gap-2">
                            <Plus size={16} /> Nouvelle Campagne
                        </Button>
                    </div>
                    <Card className="p-0 border-none shadow-xl overflow-hidden">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100 text-xs font-black text-gray-400 uppercase tracking-widest">
                                    <th className="px-8 py-5">Nom</th>
                                    <th className="px-8 py-5">Cible</th>
                                    <th className="px-8 py-5">Status</th>
                                    <th className="px-8 py-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {campaigns.map((c: any) => (
                                    <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-8 py-6 font-bold text-gray-900">{c.name}</td>
                                        <td className="px-8 py-6 text-sm font-medium text-gray-400 uppercase tracking-widest text-[10px]">{c.target}</td>
                                        <td className="px-8 py-6">
                                            <Badge variant={c.status === 'SENT' ? 'success' : 'warning'}>{c.status}</Badge>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button onClick={() => sendCampaign(c.id)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Lancer"><Play size={16} /></button>
                                            <button className="p-2 text-gray-400 hover:text-red-600 rounded-lg transition-all ml-2"><Trash2 size={16} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </Card>
                </div>
            )}

            {showTemplateModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
                    <Card className="max-w-2xl w-full p-8 shadow-2xl">
                        <h2 className="text-2xl font-black text-gray-900 mb-8">
                            {editingTemplate?.id ? 'Modifier le Template' : 'Nouveau Template'}
                        </h2>
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input
                                    label="Nom (Unique)"
                                    value={editingTemplate?.name}
                                    onChange={e => setEditingTemplate({...editingTemplate, name: e.target.value})}
                                    placeholder="WELCOME_EMAIL"
                                />
                                <Select
                                    label="Type"
                                    value={editingTemplate?.type}
                                    onChange={e => setEditingTemplate({...editingTemplate, type: e.target.value})}
                                    options={[
                                        { value: 'TRANSACTIONAL', label: 'Transactionnel' },
                                        { value: 'CAMPAIGN', label: 'Campagne / Marketing' }
                                    ]}
                                />
                            </div>
                            <Input
                                label="Sujet de l'email"
                                value={editingTemplate?.subject}
                                onChange={e => setEditingTemplate({...editingTemplate, subject: e.target.value})}
                                placeholder="Bienvenue {{name}} !"
                            />
                            <div className="space-y-1.5">
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Contenu (HTML)</label>
                                <textarea
                                    value={editingTemplate?.content}
                                    onChange={e => setEditingTemplate({...editingTemplate, content: e.target.value})}
                                    className="w-full h-64 p-4 rounded-xl border border-gray-200 bg-gray-50 font-mono text-xs focus:ring-4 focus:ring-blue-500/5 outline-none transition-all"
                                    placeholder="<h1>Bonjour {{name}}</h1>"
                                />
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-2">Variables : {"{{name}}, {{email}}, {{unsubscribeUrl}}"}</p>
                            </div>
                        </div>
                        <div className="flex gap-4 mt-10">
                            <Button variant="ghost" onClick={() => setShowTemplateModal(false)} className="flex-1">Annuler</Button>
                            <Button onClick={upsertTemplate} className="flex-1">Sauvegarder</Button>
                        </div>
                    </Card>
                </div>
            )}

            {showCampaignModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
                    <Card className="max-w-md w-full p-8 shadow-2xl">
                        <h2 className="text-2xl font-black text-gray-900 mb-8">Nouvelle Campagne</h2>
                        <div className="space-y-6">
                            <Input label="Nom de la campagne" value={newCampaign.name} onChange={e => setNewCampaign({...newCampaign, name: e.target.value})} />
                            <Select
                                label="Template"
                                value={newCampaign.templateId}
                                onChange={e => setNewCampaign({...newCampaign, templateId: e.target.value})}
                                options={[
                                    { value: '', label: 'Sélectionner un template' },
                                    ...templates.map((t: any) => ({ value: t.id, label: t.name }))
                                ]}
                            />
                            <Select
                                label="Cible"
                                value={newCampaign.target}
                                onChange={e => setNewCampaign({...newCampaign, target: e.target.value})}
                                options={[
                                    { value: 'ALL', label: 'Tous les utilisateurs' },
                                    { value: 'ACTIVE_SERVICES', label: 'Services actifs uniquement' },
                                    { value: 'NO_SERVICES', label: 'Aucun service' }
                                ]}
                            />
                            <Input label="Planifier (Optionnel)" type="datetime-local" value={newCampaign.scheduledAt} onChange={e => setNewCampaign({...newCampaign, scheduledAt: e.target.value})} />
                        </div>
                        <div className="flex gap-4 mt-10">
                            <Button variant="ghost" onClick={() => setShowCampaignModal(false)} className="flex-1">Annuler</Button>
                            <Button onClick={createCampaign} className="flex-1">Créer</Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default EmailManager;
