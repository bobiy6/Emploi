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

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <h3 className="text-2xl font-bold mb-6">Add Funds to Balance</h3>
        <form onSubmit={handleSubmit} className="space-y-6">
           <div>
              <label className="text-sm font-bold text-gray-400 uppercase tracking-widest block mb-2">Amount (€)</label>
              <input
                type="number"
                className="w-full h-12 px-4 rounded-xl border border-gray-200 text-xl font-bold"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                min="1"
              />
           </div>

           <div className="p-4 border border-gray-200 rounded-xl bg-gray-50">
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
