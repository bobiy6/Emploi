import React, { useState } from 'react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import api from '../api';

const AddFundsModal = ({ onClose, onRefresh }: any) => {
  const [amount, setAmount] = useState('10');
  const [loading, setLoading] = useState(false);
  const [creditConfig, setCreditConfig] = useState<any>({ min: 5, max: 500, pricePerCredit: 1.0 });

  React.useEffect(() => {
    const fetchConfig = async () => {
      try {
        const { data } = await api.get('/admin/settings');
        if (data.credit_config) setCreditConfig(data.credit_config);
      } catch {}
    };
    fetchConfig();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/billing/create-checkout-session', { amount: parseFloat(amount) });
      if (data.url) {
         window.location.href = data.url;
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Payment redirection failed');
    } finally {
      setLoading(false);
    }
  };

  const finalPrice = (parseFloat(amount) || 0) * creditConfig.pricePerCredit;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <h3 className="text-2xl font-bold mb-2 text-gray-900">Add Credits</h3>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Top up your Infralyonix Balance</p>

        <form onSubmit={handleSubmit} className="space-y-6">
           <div className="space-y-4">
              <div className="flex justify-between items-end">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Number of Credits</label>
                <span className="text-[10px] font-bold text-blue-600">Min: {creditConfig.min} / Max: {creditConfig.max}</span>
              </div>
              <input
                type="number"
                className="w-full h-14 px-4 rounded-2xl border-2 border-gray-100 bg-gray-50 focus:bg-white focus:border-blue-600 transition-all text-2xl font-black outline-none"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                min={creditConfig.min}
                max={creditConfig.max}
              />

              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex justify-between items-center">
                 <span className="text-sm font-bold text-blue-800 uppercase tracking-tight">Total Price</span>
                 <span className="text-xl font-black text-blue-900">{finalPrice.toFixed(2)}€</span>
              </div>
           </div>

           <div className="p-6 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
              <p className="text-[10px] text-gray-400 font-bold uppercase text-center leading-relaxed">
                 You will be redirected to a secure Stripe payment page to complete your purchase.
              </p>
           </div>

           <div className="flex gap-3 pt-4">
              <Button variant="ghost" className="flex-1 h-12" onClick={onClose}>Cancel</Button>
              <Button type="submit" className="flex-1 h-12" isLoading={loading}>Pay & Rediriger</Button>
           </div>
        </form>
      </Card>
    </div>
  );
};

export default AddFundsModal;
