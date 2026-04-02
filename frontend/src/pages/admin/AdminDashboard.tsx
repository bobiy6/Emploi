import React, { useEffect, useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Users, Server, DollarSign, MessageSquare, ArrowUpRight, Activity, AlertCircle, Terminal } from 'lucide-react';
import api from '../../api';

const AdminDashboard = () => {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/users/stats');
        setData(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();
  }, []);

  const stats = data?.stats;

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <Card className="bg-white border-none shadow-xl p-8 relative overflow-hidden group">
           <div className="relative z-10">
              <p className="text-sm font-black text-gray-400 uppercase tracking-widest mb-1">Total Revenue</p>
              <h3 className="text-4xl font-black text-gray-900 mb-6">{stats?.revenue || 0}€</h3>
              <div className="flex items-center gap-2 text-emerald-500 font-bold text-sm">
                 <ArrowUpRight className="w-4 h-4" /> Real-time tracking
              </div>
           </div>
           <DollarSign className="absolute -bottom-4 -right-4 w-32 h-32 text-emerald-50 opacity-10 group-hover:scale-110 transition-transform duration-700" />
        </Card>

        <Card className="bg-white border-none shadow-xl p-8 relative overflow-hidden group">
           <div className="relative z-10">
              <p className="text-sm font-black text-gray-400 uppercase tracking-widest mb-1">Total Users</p>
              <h3 className="text-4xl font-black text-gray-900 mb-6">{stats?.users || 0}</h3>
              <div className="flex items-center gap-2 text-blue-500 font-bold text-sm">
                 <ArrowUpRight className="w-4 h-4" /> Active customers
              </div>
           </div>
           <Users className="absolute -bottom-4 -right-4 w-32 h-32 text-blue-50 opacity-10 group-hover:scale-110 transition-transform duration-700" />
        </Card>

        <Card className="bg-white border-none shadow-xl p-8 relative overflow-hidden group">
           <div className="relative z-10">
              <p className="text-sm font-black text-gray-400 uppercase tracking-widest mb-1">Active Services</p>
              <h3 className="text-4xl font-black text-gray-900 mb-6">{stats?.activeServices || 0}</h3>
              <Badge variant="success">Provisioning active</Badge>
           </div>
           <Server className="absolute -bottom-4 -right-4 w-32 h-32 text-indigo-50 opacity-10 group-hover:scale-110 transition-transform duration-700" />
        </Card>

        <Card className="bg-white border-none shadow-xl p-8 relative overflow-hidden group">
           <div className="relative z-10">
              <p className="text-sm font-black text-gray-400 uppercase tracking-widest mb-1">Open Tickets</p>
              <h3 className="text-4xl font-black text-gray-900 mb-6">{stats?.openTickets || 0}</h3>
              <Badge variant={stats?.openTickets > 0 ? 'danger' : 'ghost'}>Support Queue</Badge>
           </div>
           <MessageSquare className="absolute -bottom-4 -right-4 w-32 h-32 text-rose-50 opacity-10 group-hover:scale-110 transition-transform duration-700" />
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="bg-rose-500 border-none shadow-xl p-8 relative overflow-hidden group text-white">
           <div className="relative z-10">
              <p className="text-sm font-black text-rose-200 uppercase tracking-widest mb-1">Errors (24h)</p>
              <h3 className="text-4xl font-black mb-6">{stats?.errorCount24h || 0}</h3>
              <div className="flex items-center gap-2 font-bold text-sm">
                 <AlertCircle className="w-4 h-4" /> System monitoring
              </div>
           </div>
           <AlertCircle className="absolute -bottom-4 -right-4 w-32 h-32 text-white opacity-10 group-hover:scale-110 transition-transform duration-700" />
        </Card>

        <Card className="bg-amber-500 border-none shadow-xl p-8 relative overflow-hidden group text-white">
           <div className="relative z-10">
              <p className="text-sm font-black text-amber-200 uppercase tracking-widest mb-1">Provisioning Errors</p>
              <h3 className="text-4xl font-black mb-6">{stats?.provisioningErrors || 0}</h3>
              <div className="flex items-center gap-2 font-bold text-sm">
                 <Activity className="w-4 h-4" /> Service health
              </div>
           </div>
           <Terminal className="absolute -bottom-4 -right-4 w-32 h-32 text-white opacity-10 group-hover:scale-110 transition-transform duration-700" />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
         <Card>
            <h3 className="text-xl font-bold mb-6">Recent User Activity</h3>
            <div className="space-y-4">
               {data?.recentUsers?.map((user: any) => (
                  <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-100 border-2 border-white shadow-sm flex items-center justify-center text-blue-600 font-bold">{user.name.charAt(0)}</div>
                        <div>
                           <p className="text-sm font-bold">{user.name}</p>
                           <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{user.email}</p>
                        </div>
                     </div>
                     <Badge variant="primary">NEW</Badge>
                  </div>
               ))}
               {!data?.recentUsers?.length && <p className="text-gray-400 text-center py-4">No recent users.</p>}
            </div>
         </Card>
         <Card>
            <h3 className="text-xl font-bold mb-6">Latest Sales</h3>
            <div className="space-y-4">
               {data?.recentOrders?.map((order: any) => (
                  <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600"><DollarSign className="w-5 h-5" /></div>
                        <div>
                           <p className="text-sm font-bold">{order.product?.name}</p>
                           <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{order.user?.name}</p>
                        </div>
                     </div>
                     <span className="font-black text-gray-900">{order.total.toFixed(2)}€</span>
                  </div>
               ))}
               {!data?.recentOrders?.length && <p className="text-gray-400 text-center py-4">No recent sales.</p>}
            </div>
         </Card>
      </div>

      <Card>
         <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Terminal className="w-5 h-5 text-indigo-500" />
            System Logs
         </h3>
         <div className="space-y-2 font-mono text-[11px]">
            {data?.recentLogs?.map((log: any) => (
               <div key={log.id} className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                     log.level === 'ERROR' ? 'bg-rose-100 text-rose-600' :
                     log.level === 'WARN' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'
                  }`}>
                     {log.level}
                  </span>
                  <div className="flex-1">
                     <div className="flex items-center gap-2 mb-1">
                        <span className="text-indigo-600 font-bold uppercase">{log.type}</span>
                        <span className="text-gray-400">{new Date(log.createdAt).toLocaleString()}</span>
                     </div>
                     <p className="text-gray-700 font-medium">{log.message}</p>
                     {log.user && <p className="text-gray-400 mt-1">User: {log.user.name}</p>}
                  </div>
               </div>
            ))}
            {!data?.recentLogs?.length && <p className="text-gray-400 text-center py-4">No logs recorded.</p>}
         </div>
      </Card>
    </div>
  );
};

export default AdminDashboard;
