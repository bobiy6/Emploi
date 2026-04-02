import React, { useEffect, useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Database, Trash2, Search, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../api';

const DB_MODELS = [
  { id: 'user', label: 'Users' },
  { id: 'product', label: 'Products' },
  { id: 'category', label: 'Categories' },
  { id: 'order', label: 'Orders' },
  { id: 'service', label: 'Services' },
  { id: 'invoice', label: 'Invoices' },
  { id: 'ticket', label: 'Tickets' },
  { id: 'server', label: 'Infrastructure Nodes' },
  { id: 'log', label: 'System Logs' }
];

const DatabaseManager = () => {
  const [selectedModel, setSelectedModel] = useState('user');
  const [data, setData] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>({});
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [selectedModel, page]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/users/db/${selectedModel}?page=${page}&limit=50`);
      setData(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('WARNING: THIS ACTION IS PERMANENT AND MAY BREAK DATA INTEGRITY. Continue?')) return;
    try {
      await api.delete(`/users/db/${selectedModel}/${id}`);
      fetchData();
    } catch (err: any) {
      alert('Error deleting record: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
         <div>
            <h2 className="text-3xl font-black text-gray-900 flex items-center gap-3">
               <Database className="w-8 h-8 text-rose-600" /> Advanced DB Access
            </h2>
            <p className="text-gray-400 font-bold text-sm mt-1">Manual database intervention for troubleshooting.</p>
         </div>
         <div className="flex gap-2 bg-white p-2 rounded-2xl shadow-sm border border-gray-100 overflow-x-auto max-w-full">
            {DB_MODELS.map(m => (
               <button
                  key={m.id}
                  onClick={() => { setSelectedModel(m.id); setPage(1); }}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                     selectedModel === m.id ? 'bg-rose-600 text-white shadow-lg shadow-rose-200' : 'text-gray-400 hover:bg-gray-50'
                  }`}
               >
                  {m.label}
               </button>
            ))}
         </div>
      </div>

      <div className="bg-amber-50 border-2 border-amber-200 p-6 rounded-3xl flex items-center gap-6">
         <div className="w-12 h-12 bg-amber-200 rounded-2xl flex items-center justify-center text-amber-700">
            <AlertTriangle className="w-6 h-6" />
         </div>
         <div>
            <h4 className="font-black text-amber-800 uppercase tracking-widest text-xs">Danger Zone</h4>
            <p className="text-amber-700 text-sm font-medium">Use this tool only when normal panel actions fail. Deleting records here ignores Prisma's foreign key safety and can cause broken links if not careful.</p>
         </div>
      </div>

      <Card className="border-none shadow-2xl p-0 overflow-hidden">
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 font-mono text-[10px] text-gray-400 uppercase tracking-widest font-black">
                     <th className="px-6 py-4">ID</th>
                     <th className="px-6 py-4">Details (Raw JSON)</th>
                     <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-50 font-mono text-xs">
                  {loading ? (
                     <tr><td colSpan={3} className="px-6 py-20 text-center text-gray-400">Loading database records...</td></tr>
                  ) : data.length === 0 ? (
                     <tr><td colSpan={3} className="px-6 py-20 text-center text-gray-400">No records found for this model.</td></tr>
                  ) : data.map((record) => (
                     <tr key={record.id} className="hover:bg-gray-50/50 group">
                        <td className="px-6 py-4">
                           <Badge variant="ghost">#{record.id}</Badge>
                        </td>
                        <td className="px-6 py-4">
                           <div className="max-w-2xl overflow-hidden text-ellipsis whitespace-nowrap text-gray-500 group-hover:whitespace-normal group-hover:bg-gray-900 group-hover:text-gray-200 p-2 rounded-lg transition-all duration-300">
                              {JSON.stringify(record)}
                           </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                           <button
                              onClick={() => handleDelete(record.id)}
                              className="p-3 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                              title="Force Delete"
                           >
                              <Trash2 className="w-4 h-4" />
                           </button>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>

         {pagination.totalPages > 1 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Page {pagination.page} / {pagination.totalPages} ({pagination.total} total)
               </p>
               <div className="flex gap-2">
                  <button
                     disabled={page === 1}
                     onClick={() => setPage(page - 1)}
                     className="p-2 rounded-lg bg-white border border-gray-200 disabled:opacity-50"
                  >
                     <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                     disabled={page === pagination.totalPages}
                     onClick={() => setPage(page + 1)}
                     className="p-2 rounded-lg bg-white border border-gray-200 disabled:opacity-50"
                  >
                     <ChevronRight className="w-4 h-4" />
                  </button>
               </div>
            </div>
         )}
      </Card>
    </div>
  );
};

export default DatabaseManager;
