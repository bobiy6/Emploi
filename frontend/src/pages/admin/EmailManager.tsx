import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Mail, Save, Play, Trash2, Plus, Edit2, Settings } from 'lucide-react';

const EmailManager = () => {
    const [activeTab, setActiveTab] = useState('settings');
    const [smtp, setSmtp] = useState({ host: '', port: 587, user: '', pass: '', from: '', secure: false });
    const [templates, setTemplates] = useState([]);
    const [campaigns, setCampaigns] = useState([]);
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
                const res = await axios.get('/api/admin/email/settings');
                setSmtp(res.data);
            } else if (activeTab === 'templates') {
                const res = await axios.get('/api/admin/email/templates');
                setTemplates(res.data);
            } else if (activeTab === 'campaigns') {
                const res = await axios.get('/api/admin/email/campaigns');
                setCampaigns(res.data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const upsertTemplate = async () => {
        try {
            if (editingTemplate.id) {
                await axios.put(`/api/admin/email/templates/${editingTemplate.id}`, editingTemplate);
            } else {
                await axios.post('/api/admin/email/templates', editingTemplate);
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
            await axios.delete(`/api/admin/email/templates/${id}`);
            fetchData();
        } catch (err) {
            alert('Failed to delete template');
        }
    };

    const createCampaign = async () => {
        try {
            await axios.post('/api/admin/email/campaigns', {
                ...newCampaign,
                templateId: parseInt(newCampaign.templateId)
            });
            setShowCampaignModal(false);
            fetchData();
        } catch (err) {
            alert('Failed to create campaign');
        }
    };

    const sendCampaign = async (id: number) => {
        try {
            await axios.post(`/api/admin/email/campaigns/${id}/send`);
            alert('Campaign queued');
            fetchData();
        } catch (err) {
            alert('Failed to send campaign');
        }
    };

    const saveSettings = async () => {
        setLoading(true);
        try {
            await axios.post('/api/admin/email/settings', smtp);
            alert('Settings saved');
        } catch (err) {
            alert('Failed to save');
        } finally {
            setLoading(false);
        }
    };

    const testConnection = async () => {
        setLoading(true);
        setTestResult(null);
        try {
            await axios.post('/api/admin/email/settings/test');
            setTestResult({ success: true, message: 'Connection successful!' });
        } catch (err: any) {
            setTestResult({ success: false, message: err.response?.data?.error || 'Connection failed' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Mail className="w-8 h-8 text-blue-500" />
                    Gestion des Emails
                </h1>
                <div className="flex bg-slate-800 p-1 rounded-lg">
                    <button
                        onClick={() => setActiveTab('settings')}
                        className={`px-4 py-2 rounded-md transition ${activeTab === 'settings' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                        Configuration
                    </button>
                    <button
                        onClick={() => setActiveTab('templates')}
                        className={`px-4 py-2 rounded-md transition ${activeTab === 'templates' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                        Templates
                    </button>
                    <button
                        onClick={() => setActiveTab('campaigns')}
                        className={`px-4 py-2 rounded-md transition ${activeTab === 'campaigns' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                        Campagnes
                    </button>
                </div>
            </div>

            {activeTab === 'settings' && (
                <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 max-w-2xl">
                    <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                        <Settings className="w-5 h-5" /> Paramètres SMTP
                    </h2>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="col-span-2 md:col-span-1">
                            <label className="block text-slate-400 mb-1">Hôte SMTP</label>
                            <input
                                type="text" value={smtp.host} onChange={e => setSmtp({...smtp, host: e.target.value})}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                                placeholder="smtp.mailtrap.io"
                            />
                        </div>
                        <div className="col-span-2 md:col-span-1">
                            <label className="block text-slate-400 mb-1">Port</label>
                            <input
                                type="number" value={smtp.port} onChange={e => setSmtp({...smtp, port: parseInt(e.target.value)})}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                            />
                        </div>
                        <div className="col-span-2 md:col-span-1">
                            <label className="block text-slate-400 mb-1">Utilisateur</label>
                            <input
                                type="text" value={smtp.user} onChange={e => setSmtp({...smtp, user: e.target.value})}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                            />
                        </div>
                        <div className="col-span-2 md:col-span-1">
                            <label className="block text-slate-400 mb-1">Mot de passe</label>
                            <input
                                type="password" value={smtp.pass} onChange={e => setSmtp({...smtp, pass: e.target.value})}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-slate-400 mb-1">Email d'expédition (From)</label>
                            <input
                                type="email" value={smtp.from} onChange={e => setSmtp({...smtp, from: e.target.value})}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                                placeholder="noreply@infralyonix.com"
                            />
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={saveSettings} disabled={loading}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition disabled:opacity-50"
                        >
                            Enregistrer
                        </button>
                        <button
                            onClick={testConnection} disabled={loading}
                            className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-lg transition disabled:opacity-50"
                        >
                            Tester la connexion
                        </button>
                    </div>
                    {testResult && (
                        <div className={`mt-4 p-3 rounded-lg border ${testResult.success ? 'bg-green-900/20 border-green-500 text-green-400' : 'bg-red-900/20 border-red-500 text-red-400'}`}>
                            {testResult.message}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'templates' && (
                <div className="space-y-4">
                    <div className="flex justify-end">
                        <button
                            onClick={() => { setEditingTemplate({ name: '', subject: '', content: '', type: 'TRANSACTIONAL' }); setShowTemplateModal(true); }}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                        >
                            <Plus size={18} /> Nouveau Template
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {templates.map((t: any) => (
                            <div key={t.id} className="bg-slate-800 rounded-xl p-5 border border-slate-700 hover:border-blue-500 transition group">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="bg-blue-900/30 p-2 rounded-lg text-blue-400">
                                        <Mail size={24} />
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => { setEditingTemplate(t); setShowTemplateModal(true); }}
                                            className="text-slate-400 hover:text-white"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => deleteTemplate(t.id)}
                                            className="text-slate-400 hover:text-red-500"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                                <h3 className="text-white font-semibold text-lg">{t.name}</h3>
                                <p className="text-slate-400 text-sm mb-4 line-clamp-1">{t.subject}</p>
                                <div className="text-xs text-slate-500 uppercase tracking-wider">{t.type}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'campaigns' && (
                <div className="space-y-4">
                    <div className="flex justify-end">
                        <button
                            onClick={() => setShowCampaignModal(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                        >
                            <Plus size={18} /> Nouvelle Campagne
                        </button>
                    </div>
                <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-900 text-slate-400 text-sm uppercase">
                                <th className="px-6 py-4 font-semibold">Campagne</th>
                                <th className="px-6 py-4 font-semibold">Cible</th>
                                <th className="px-6 py-4 font-semibold">Statut</th>
                                <th className="px-6 py-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                            {campaigns.map((c: any) => (
                                <tr key={c.id} className="hover:bg-slate-700/30 transition text-slate-300">
                                    <td className="px-6 py-4 font-medium text-white">{c.name}</td>
                                    <td className="px-6 py-4 text-sm">{c.target}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${c.status === 'SENT' ? 'bg-green-900/30 text-green-400' : 'bg-yellow-900/30 text-yellow-400'}`}>
                                            {c.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => sendCampaign(c.id)}
                                            className="text-blue-500 hover:text-blue-400 p-2"
                                            title="Lancer / Programmer"
                                        >
                                            <Play size={18} />
                                        </button>
                                        <button className="text-slate-400 hover:text-red-500 p-2"><Trash2 size={18} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showTemplateModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold text-white mb-6">
                            {editingTemplate?.id ? 'Modifier le Template' : 'Nouveau Template'}
                        </h2>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-slate-400 mb-1">Nom (Unique)</label>
                                    <input
                                        type="text" value={editingTemplate?.name} onChange={e => setEditingTemplate({...editingTemplate, name: e.target.value})}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white"
                                        placeholder="WELCOME_EMAIL"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-400 mb-1">Type</label>
                                    <select
                                        value={editingTemplate?.type} onChange={e => setEditingTemplate({...editingTemplate, type: e.target.value})}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white"
                                    >
                                        <option value="TRANSACTIONAL">Transactionnel</option>
                                        <option value="CAMPAIGN">Campagne / Marketing</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-slate-400 mb-1">Sujet de l'email</label>
                                <input
                                    type="text" value={editingTemplate?.subject} onChange={e => setEditingTemplate({...editingTemplate, subject: e.target.value})}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white"
                                    placeholder="Bienvenue {{name}} !"
                                />
                            </div>
                            <div>
                                <label className="block text-slate-400 mb-1">Contenu (HTML + Handlebars)</label>
                                <textarea
                                    value={editingTemplate?.content} onChange={e => setEditingTemplate({...editingTemplate, content: e.target.value})}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white h-64 font-mono text-sm"
                                    placeholder="<h1>Bonjour {{name}}</h1>..."
                                />
                                <p className="text-xs text-slate-500 mt-2">
                                    Variables disponibles : {"{{name}}"}, {"{{email}}"}, {"{{unsubscribeUrl}}"} (marketing uniquement).
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-4 mt-8">
                            <button onClick={() => setShowTemplateModal(false)} className="flex-1 bg-slate-700 text-white py-2 rounded-lg">Annuler</button>
                            <button onClick={upsertTemplate} className="flex-1 bg-blue-600 text-white py-2 rounded-lg">Enregistrer</button>
                        </div>
                    </div>
                </div>
            )}

            {showCampaignModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 max-w-md w-full">
                        <h2 className="text-2xl font-bold text-white mb-6">Nouvelle Campagne</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-slate-400 mb-1">Nom de la campagne</label>
                                <input
                                    type="text" value={newCampaign.name} onChange={e => setNewCampaign({...newCampaign, name: e.target.value})}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-slate-400 mb-1">Template</label>
                                <select
                                    value={newCampaign.templateId} onChange={e => setNewCampaign({...newCampaign, templateId: e.target.value})}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white"
                                >
                                    <option value="">Sélectionner un template</option>
                                    {templates.map((t: any) => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-slate-400 mb-1">Cible</label>
                                <select
                                    value={newCampaign.target} onChange={e => setNewCampaign({...newCampaign, target: e.target.value})}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white"
                                >
                                    <option value="ALL">Tous les utilisateurs</option>
                                    <option value="ACTIVE_SERVICES">Services actifs uniquement</option>
                                    <option value="NO_SERVICES">Aucun service</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-slate-400 mb-1">Planifier (Optionnel)</label>
                                <input
                                    type="datetime-local" value={newCampaign.scheduledAt} onChange={e => setNewCampaign({...newCampaign, scheduledAt: e.target.value})}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white"
                                />
                            </div>
                        </div>
                        <div className="flex gap-4 mt-8">
                            <button onClick={() => setShowCampaignModal(false)} className="flex-1 bg-slate-700 text-white py-2 rounded-lg">Annuler</button>
                            <button onClick={createCampaign} className="flex-1 bg-blue-600 text-white py-2 rounded-lg">Créer</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmailManager;
