import React, { useEffect, useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { User, Mail, Lock, Building, MapPin, CheckCircle } from 'lucide-react';
import api from '../../api';

const Settings = () => {
  const [profile, setProfile] = useState<any>(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    isCompany: false,
    companyName: '',
    vatNumber: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/auth/profile');
      setProfile(res.data);
      setForm({
        name: res.data.name,
        email: res.data.email,
        password: '',
        isCompany: res.data.isCompany || false,
        companyName: res.data.companyName || '',
        vatNumber: res.data.vatNumber || '',
        address: res.data.address || ''
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    try {
      await api.put('/auth/profile', form);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      alert('Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h2 className="text-3xl font-black text-gray-900">Account Settings</h2>

      {success && (
        <div className="bg-emerald-50 text-emerald-700 p-4 rounded-2xl flex items-center gap-3 font-bold border border-emerald-100 animate-in fade-in slide-in-from-top-4">
           <CheckCircle className="w-5 h-5" /> Profile updated successfully!
        </div>
      )}

      <form onSubmit={handleUpdate} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <Card className="space-y-6">
              <h3 className="text-lg font-bold flex items-center gap-2">
                 <User className="w-5 h-5 text-blue-600" /> Personal Information
              </h3>
              <Input label="Full Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
              <Input label="Email Address" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
              <Input label="New Password (optional)" type="password" placeholder="Leave blank to keep current" value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
           </Card>

           <Card className="space-y-6">
              <h3 className="text-lg font-bold flex items-center gap-2">
                 <Building className="w-5 h-5 text-blue-600" /> Billing Details
              </h3>
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                 <input
                    type="checkbox"
                    id="isCompany"
                    className="w-5 h-5 accent-blue-600 cursor-pointer"
                    checked={form.isCompany}
                    onChange={e => setForm({...form, isCompany: e.target.checked})}
                 />
                 <label htmlFor="isCompany" className="text-sm font-bold text-gray-700 cursor-pointer">I am a company / professional</label>
              </div>

              {form.isCompany && (
                 <>
                    <Input label="Company Name" value={form.companyName} onChange={e => setForm({...form, companyName: e.target.value})} required />
                    <Input label="VAT Number" placeholder="e.g. BE0123456789" value={form.vatNumber} onChange={e => setForm({...form, vatNumber: e.target.value})} required />
                 </>
              )}

              <div className="space-y-1">
                 <label className="text-sm font-medium ml-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> Full Address</label>
                 <textarea
                    className="w-full h-32 p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 transition-all outline-none text-sm"
                    value={form.address}
                    onChange={e => setForm({...form, address: e.target.value})}
                 />
              </div>
           </Card>
        </div>

        <div className="flex justify-end">
           <Button type="submit" className="h-14 px-10 shadow-xl" isLoading={loading}>
              Save Changes
           </Button>
        </div>
      </form>
    </div>
  );
};

export default Settings;
