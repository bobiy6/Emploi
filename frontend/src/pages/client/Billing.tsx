import React, { useEffect, useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { CreditCard, FileText, Download, Wallet, ArrowUpRight } from 'lucide-react';
import api from '../../api';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const Billing = () => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loadingPay, setLoadingPay] = useState<number | null>(null);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const res = await api.get('/billing');
      setInvoices(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePay = async (invoiceId: number) => {
    setLoadingPay(invoiceId);
    try {
      await api.post(`/billing/${invoiceId}/pay`);
      alert('Invoice paid successfully!');
      // Refresh list
      const res = await api.get('/billing');
      setInvoices(res.data);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Payment failed');
    } finally {
      setLoadingPay(null);
    }
  };

  const handleDownload = async (invoice: any) => {
    const doc = new jsPDF();
    const user = invoice.user || {};

    doc.setFontSize(22);
    doc.text('HostDash - Invoice', 20, 20);
    doc.setFontSize(10);
    doc.text(`Invoice ID: #INV-${invoice.id}`, 20, 30);
    doc.text(`Date: ${new Date(invoice.createdAt).toLocaleDateString()}`, 20, 35);
    doc.text(`Status: ${invoice.status}`, 20, 40);

    doc.setFontSize(14);
    doc.text('Customer Details', 20, 55);
    doc.setFontSize(10);
    doc.text(`Name: ${user.name}`, 20, 65);
    if(user.isCompany) {
       doc.text(`Company: ${user.companyName}`, 20, 70);
       doc.text(`VAT: ${user.vatNumber}`, 20, 75);
    }
    doc.text(`Address: ${user.address || 'N/A'}`, 20, user.isCompany ? 80 : 70);

    autoTable(doc, {
      startY: 90,
      head: [['Product', 'Description', 'Total']],
      body: [[
        invoice.order?.product?.name || 'Manual Credit',
        invoice.order?.product?.description || 'Service subscription',
        `${invoice.amount.toFixed(2)}€`
      ]],
      theme: 'grid',
      headStyles: { fillColor: [71, 103, 255] }
    });

    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(14);
    doc.text(`Total Paid: ${invoice.amount.toFixed(2)}€`, 150, finalY);

    doc.save(`invoice-${invoice.id}.pdf`);
  };

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="col-span-1 border-none shadow-xl bg-gradient-to-br from-indigo-600 to-blue-700 text-white relative overflow-hidden group">
          <div className="relative z-10">
             <div className="p-3 bg-white/20 backdrop-blur-md rounded-xl w-fit mb-6">
                <Wallet className="w-6 h-6" />
             </div>
             <p className="text-sm font-bold text-indigo-100 mb-1 uppercase tracking-widest">Available Credit</p>
             <h3 className="text-4xl font-black mb-6">15.00€</h3>
             <Button variant="secondary" className="w-full bg-white text-indigo-700 border-none h-12 font-bold group-hover:scale-105 transition-transform">
                Add Funds <ArrowUpRight className="ml-2 w-4 h-4" />
             </Button>
          </div>
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-700" />
        </Card>

        <div className="md:col-span-2">
           <Card className="h-full border-none shadow-md">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                 <FileText className="w-5 h-5 text-blue-600" /> Recent Activity
              </h3>
              <div className="space-y-4">
                 <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-100 transition-all">
                    <div className="flex items-center gap-4">
                       <div className="p-2 bg-blue-100 rounded-lg"><Download className="w-4 h-4 text-blue-600" /></div>
                       <div>
                          <p className="text-sm font-bold">Automatic Renewal - VPS Premium</p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Oct 12, 2024</p>
                       </div>
                    </div>
                    <span className="text-sm font-bold text-gray-600">-12.00€</span>
                 </div>
                 <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-100 transition-all">
                    <div className="flex items-center gap-4">
                       <div className="p-2 bg-emerald-100 rounded-lg"><ArrowUpRight className="w-4 h-4 text-emerald-600" /></div>
                       <div>
                          <p className="text-sm font-bold">Credit Refill - Stripe Payment</p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Oct 10, 2024</p>
                       </div>
                    </div>
                    <span className="text-sm font-bold text-emerald-600">+50.00€</span>
                 </div>
              </div>
           </Card>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-black text-gray-900">Invoice History</h2>
        <Card className="p-0 border-none overflow-hidden shadow-xl">
           <table className="w-full text-left">
              <thead>
                 <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">ID</th>
                    <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Product</th>
                    <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Amount</th>
                    <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Status</th>
                    <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Action</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                 {invoices.length === 0 ? (
                    <tr>
                       <td colSpan={5} className="px-8 py-10 text-center text-gray-400 font-medium">No invoices found.</td>
                    </tr>
                 ) : (
                    invoices.map((inv: any) => (
                       <tr key={inv.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-8 py-6 font-mono text-xs text-gray-400">#INV-{inv.id}</td>
                          <td className="px-8 py-6 font-bold text-gray-900">{inv.order?.product?.name || 'Manual Credit'}</td>
                          <td className="px-8 py-6 font-black text-gray-900">{inv.amount}€</td>
                          <td className="px-8 py-6">
                             <Badge variant={inv.status === 'PAID' ? 'success' : 'danger'}>
                                {inv.status}
                             </Badge>
                          </td>
                          <td className="px-8 py-6">
                             {inv.status === 'UNPAID' ? (
                                <Button size="sm" isLoading={loadingPay === inv.id} onClick={() => handlePay(inv.id)}>
                                   Pay Now
                                </Button>
                             ) : (
                                <button
                                   onClick={() => handleDownload(inv)}
                                   className="text-blue-600 font-bold text-xs flex items-center gap-1 hover:underline"
                                >
                                   <Download className="w-3 h-3" /> PDF
                                </button>
                             )}
                          </td>
                       </tr>
                    ))
                 )}
              </tbody>
           </table>
        </Card>
      </div>
    </div>
  );
};

export default Billing;
