import React, { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import api from '../api';

const AddFundsModal = ({ onClose, onRefresh }: any) => {
  const stripe = useStripe();
  const elements = useElements();
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
    if (!stripe || !elements) return;

    setLoading(true);
    try {
      const { data } = await api.post('/billing/create-payment-intent', { amount: parseFloat(amount) });
      const { clientSecret } = data;

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
        },
      });

      if (result.error) {
        alert(result.error.message);
      } else {
        alert('Payment successful!');
        onRefresh();
        onClose();
      }
    } catch (err) {
      alert('Payment failed');
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

           <div className="p-4 border-2 border-gray-100 rounded-2xl bg-white shadow-inner">
              <CardElement options={{ style: { base: { fontSize: '16px' } } }} />
           </div>

           <div className="flex gap-3 pt-4">
              <Button variant="ghost" className="flex-1" onClick={onClose}>Cancel</Button>
              <Button type="submit" className="flex-1" isLoading={loading}>Pay Now</Button>
           </div>
        </form>
      </Card>
    </div>
  );
};

export default AddFundsModal;
