import React, { useState } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import api from '../api';

const OrderModal = ({ product, onClose }: any) => {
  const [loading, setLoading] = useState(false);

  const confirmOrder = async () => {
    setLoading(true);
    try {
      await api.post('/orders', { productId: product.id });
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
           <div className="flex justify-between items-center mb-4">
              <span className="font-bold text-gray-400 uppercase tracking-widest text-xs">Product</span>
              <span className="font-bold text-gray-900">{product.name}</span>
           </div>
           <div className="flex justify-between items-center mb-4">
              <span className="font-bold text-gray-400 uppercase tracking-widest text-xs">Billing Cycle</span>
              <span className="font-bold text-gray-900">Monthly</span>
           </div>
           <div className="flex justify-between items-center pt-4 border-t border-gray-200">
              <span className="font-black text-gray-900 uppercase tracking-widest text-sm">Total Due Today</span>
              <span className="text-2xl font-black text-blue-600">{product.price}€</span>
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
