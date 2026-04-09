import React, { useState } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import api from '../api';

const OrderModal = ({ product, onClose }: any) => {
  const [loading, setLoading] = useState(false);
  const [selectedCycle, setSelectedCycle] = useState('monthly');

  const cycles = (product.billingCycles as any) || { 'monthly': product.price };
  const availableCycles = Object.keys(cycles).filter(k => cycles[k] !== null && cycles[k] !== '');

  const confirmOrder = async () => {
    setLoading(true);
    try {
      await api.post('/orders', { productId: product.id, billingCycle: selectedCycle });
      alert('Order successful! Go to Billing to pay.');
      onClose();
    } catch (err) {
      alert('Order failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-2xl border-none">
        <h3 className="text-2xl font-black mb-2">Review your Order</h3>
        <p className="text-gray-500 mb-8 font-medium">You are about to subscribe to {product.name}.</p>

        <div className="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-100">
           <div className="flex justify-between items-center mb-6">
              <span className="font-bold text-gray-400 uppercase tracking-widest text-xs">Product</span>
              <span className="font-bold text-gray-900">{product.name}</span>
           </div>

           <div className="space-y-3 mb-6">
              <span className="font-bold text-gray-400 uppercase tracking-widest text-xs">Choose Duration</span>
              <div className="grid grid-cols-2 gap-3">
                 {availableCycles.length > 0 ? availableCycles.map(cycle => (
                    <button
                       key={cycle}
                       onClick={() => setSelectedCycle(cycle)}
                       className={`p-4 rounded-xl border-2 transition-all text-left ${selectedCycle === cycle ? 'border-blue-600 bg-blue-50' : 'border-gray-100 bg-white'}`}
                    >
                       <p className="text-[10px] font-black uppercase text-gray-400">{cycle}</p>
                       <p className="font-bold text-gray-900">{cycles[cycle]}€</p>
                    </button>
                 )) : (
                    <div className="col-span-2 p-4 bg-white border-2 border-blue-600 rounded-xl">
                       <p className="text-[10px] font-black uppercase text-gray-400">Monthly</p>
                       <p className="font-bold text-gray-900">{product.price}€</p>
                    </div>
                 )}
              </div>
           </div>

           <div className="flex justify-between items-center pt-6 border-t border-gray-200">
              <span className="font-black text-gray-900 uppercase tracking-widest text-sm">Total Due Today</span>
              <span className="text-2xl font-black text-blue-600">{cycles[selectedCycle] || product.price}€</span>
           </div>
        </div>

        <div className="flex gap-4">
          <Button variant="ghost" className="flex-1 h-12" onClick={onClose}>Cancel</Button>
          <Button className="flex-1 h-12 shadow-lg shadow-blue-200" isLoading={loading} onClick={confirmOrder}>Confirm & Pay later</Button>
        </div>
      </Card>
    </div>
  );
};

export default OrderModal;
