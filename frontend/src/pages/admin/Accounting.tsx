import React, { useEffect, useState } from 'react';
import { BarChart3, Download, Calendar, DollarSign, ArrowUpRight } from 'lucide-react';
import api from '../../api';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

const Accounting = () => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [invRes, statsRes] = await Promise.all([
        api.get('/billing/all'),
        api.get('/users/stats')
      ]);
      setInvoices(invRes.data);
      setStats(statsRes.data.stats);
    } catch (err) {
      console.error(err);
    }
  };

  const currentMonthRevenue = stats?.revenueByMonth?.[new Date().toLocaleString('default', { month: 'short' })] || 0;

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-black text-gray-900">Accounting & Finance</h2>
        <Button variant="outline" className="gap-2">
           <Download className="w-4 h-4" /> Export Annual Report
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white border-none shadow-xl">
           <p className="text-xs font-black uppercase tracking-widest opacity-70 mb-1">Monthly Revenue</p>
           <h3 className="text-4xl font-black mb-4">{currentMonthRevenue.toFixed(2)}€</h3>
           <div className="flex items-center gap-2 text-emerald-100 text-sm font-bold">
              <Calendar className="w-4 h-4" /> {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
           </div>
        </Card>

        <Card>
           <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Unpaid Invoices</p>
           <h3 className="text-3xl font-black text-gray-900 mb-4">
              {invoices.filter(i => i.status === 'UNPAID').length}
           </h3>
           <Badge variant="warning">Awaiting Payment</Badge>
        </Card>

        <Card>
           <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Total Net Income</p>
           <h3 className="text-3xl font-black text-emerald-600 mb-4">{stats?.revenue?.toFixed(2)}€</h3>
           <div className="flex items-center gap-1 text-gray-400 text-xs font-bold">
              <ArrowUpRight className="w-3 h-3" /> Lifetime statistics
           </div>
        </Card>
      </div>

      <Card className="p-0 border-none overflow-hidden shadow-xl">
           <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-gray-900">Complete Invoice Ledger</h3>
              <div className="flex gap-2">
                 <select className="bg-white border border-gray-200 rounded-lg px-3 py-1 text-xs font-bold">
                    <option>All Months</option>
                    <option>Current Month</option>
                 </select>
              </div>
           </div>
           <table className="w-full text-left">
              <thead>
                 <tr className="bg-white border-b border-gray-100">
                    <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Invoice</th>
                    <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Client / Company</th>
                    <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">VAT Number</th>
                    <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Total</th>
                    <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Status</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                 {invoices.map((inv: any) => (
                    <tr key={inv.id} className="hover:bg-gray-50/50 transition-colors">
                       <td className="px-8 py-6">
                          <p className="font-mono text-xs font-bold text-gray-400">#INV-{inv.id}</p>
                          <p className="text-[10px] text-gray-300 font-bold uppercase">{new Date(inv.createdAt).toLocaleDateString()}</p>
                       </td>
                       <td className="px-8 py-6">
                          <p className="font-bold text-gray-900">{inv.user?.name}</p>
                          <p className="text-xs text-gray-400">{inv.user?.companyName || 'Individual'}</p>
                       </td>
                       <td className="px-8 py-6">
                          <span className="font-mono text-xs text-gray-500">{inv.user?.vatNumber || '--'}</span>
                       </td>
                       <td className="px-8 py-6 font-black text-gray-900">{inv.amount.toFixed(2)}€</td>
                       <td className="px-8 py-6">
                          <Badge variant={inv.status === 'PAID' ? 'success' : 'danger'}>{inv.status}</Badge>
                       </td>
                    </tr>
                 ))}
              </tbody>
           </table>
        </Card>
    </div>
  );
};

export default Accounting;
