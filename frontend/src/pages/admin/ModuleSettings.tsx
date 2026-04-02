import React, { useEffect, useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Settings, Lock, CreditCard } from 'lucide-react';
import api from '../../api';

const ModuleSettings = () => {
  const [settings, setSettings] = useState<any>({
    stripe: { publicKey: '', secretKey: '', webhookSecret: '' }
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/admin/settings');
      if (res.data.stripe) setSettings(prev => ({ ...prev, stripe: res.data.stripe }));
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

  const testStripe = async () => {
    setLoading(true);
    try {
      const res = await api.post('/admin/settings/test-stripe', { secretKey: settings.stripe.secretKey });
      alert(res.data.message);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Stripe connection failed');
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

      <div className="grid grid-cols-1 gap-8">
        {/* Stripe Settings */}
        <Card className="p-8 border-none shadow-xl">
           <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-50">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                 <CreditCard className="w-5 h-5" />
              </div>
              <div>
                 <h3 className="text-xl font-bold">Stripe Payments</h3>
                 <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Gateway Configuration</p>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Public Key (pk_test_...)"
                placeholder="pk_live_..."
                value={settings.stripe.publicKey}
                onChange={e => setSettings({...settings, stripe: {...settings.stripe, publicKey: e.target.value}})}
              />
              <Input
                label="Secret Key (sk_test_...)"
                type="password"
                placeholder="sk_live_..."
                value={settings.stripe.secretKey}
                onChange={e => setSettings({...settings, stripe: {...settings.stripe, secretKey: e.target.value}})}
              />
              <Input
                label="Webhook Signing Secret (whsec_...)"
                type="password"
                placeholder="whsec_..."
                value={settings.stripe.webhookSecret}
                onChange={e => setSettings({...settings, stripe: {...settings.stripe, webhookSecret: e.target.value}})}
              />
              <div className="flex items-end gap-3">
                 <Button
                   className="flex-1 h-11 bg-indigo-600 hover:bg-indigo-700"
                   onClick={() => handleUpdate('stripe', settings.stripe)}
                   isLoading={loading}
                 >
                    Save Stripe Config
                 </Button>
                 <Button
                   variant="outline"
                   className="h-11 border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                   onClick={testStripe}
                   isLoading={loading}
                 >
                    Test Connection
                 </Button>
              </div>
           </div>
        </Card>
      </div>
    </div>
  );
};

export default ModuleSettings;
