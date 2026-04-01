import React, { useEffect, useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { ClipboardList, Search, Eye } from 'lucide-react';
import api from '../../api';

const OrderManagement = () => {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders/all');
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-black text-gray-900">System Orders</h2>

      <Card className="p-0 border-none overflow-hidden shadow-xl">
           <table className="w-full text-left">
              <thead>
                 <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Order ID</th>
                    <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Customer</th>
                    <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Product</th>
                    <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Amount</th>
                    <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Status</th>
                    <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Date</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                 {orders.length === 0 ? (
                    <tr>
                       <td colSpan={6} className="px-8 py-10 text-center text-gray-400 font-medium">No orders found.</td>
                    </tr>
                 ) : (
                    orders.map((order: any) => (
                       <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-8 py-6 font-mono text-xs text-gray-400">#ORD-{order.id}</td>
                          <td className="px-8 py-6">
                             <p className="font-bold text-gray-900">{order.user?.name}</p>
                             <p className="text-[10px] text-gray-400">{order.user?.email}</p>
                          </td>
                          <td className="px-8 py-6 font-bold text-gray-700">{order.product?.name}</td>
                          <td className="px-8 py-6 font-black text-gray-900">{order.total.toFixed(2)}€</td>
                          <td className="px-8 py-6">
                             <Badge variant={order.status === 'PAID' ? 'success' : order.status === 'PENDING' ? 'warning' : 'danger'}>
                                {order.status}
                             </Badge>
                          </td>
                          <td className="px-8 py-6 text-xs text-gray-400 font-bold">
                             {new Date(order.createdAt).toLocaleDateString()}
                          </td>
                       </tr>
                    ))
                 )}
              </tbody>
           </table>
        </Card>
    </div>
  );
};

export default OrderManagement;
