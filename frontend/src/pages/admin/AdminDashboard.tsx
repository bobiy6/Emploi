import React, { useEffect, useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Users, Server, DollarSign, MessageSquare, ArrowUpRight } from 'lucide-react';
import api from '../../api';

const AdminDashboard = () => {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/users/stats');
        setStats(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <Card className="bg-white border-none shadow-xl p-8 relative overflow-hidden group">
           <div className="relative z-10">
              <p className="text-sm font-black text-gray-400 uppercase tracking-widest mb-1">Total Revenue</p>
              <h3 className="text-4xl font-black text-gray-900 mb-6">{stats?.revenue || 0}€</h3>
              <div className="flex items-center gap-2 text-emerald-500 font-bold text-sm">
                 <ArrowUpRight className="w-4 h-4" /> +12.5% this month
              </div>
           </div>
           <DollarSign className="absolute -bottom-4 -right-4 w-32 h-32 text-emerald-50 opacity-10 group-hover:scale-110 transition-transform duration-700" />
        </Card>

        <Card className="bg-white border-none shadow-xl p-8 relative overflow-hidden group">
           <div className="relative z-10">
              <p className="text-sm font-black text-gray-400 uppercase tracking-widest mb-1">Total Users</p>
              <h3 className="text-4xl font-black text-gray-900 mb-6">{stats?.users || 0}</h3>
              <div className="flex items-center gap-2 text-blue-500 font-bold text-sm">
                 <ArrowUpRight className="w-4 h-4" /> 4 new today
              </div>
           </div>
           <Users className="absolute -bottom-4 -right-4 w-32 h-32 text-blue-50 opacity-10 group-hover:scale-110 transition-transform duration-700" />
        </Card>

        <Card className="bg-white border-none shadow-xl p-8 relative overflow-hidden group">
           <div className="relative z-10">
              <p className="text-sm font-black text-gray-400 uppercase tracking-widest mb-1">Active Services</p>
              <h3 className="text-4xl font-black text-gray-900 mb-6">{stats?.activeServices || 0}</h3>
              <Badge variant="success">99.9% Uptime</Badge>
           </div>
           <Server className="absolute -bottom-4 -right-4 w-32 h-32 text-indigo-50 opacity-10 group-hover:scale-110 transition-transform duration-700" />
        </Card>

        <Card className="bg-white border-none shadow-xl p-8 relative overflow-hidden group">
           <div className="relative z-10">
              <p className="text-sm font-black text-gray-400 uppercase tracking-widest mb-1">Open Tickets</p>
              <h3 className="text-4xl font-black text-gray-900 mb-6">{stats?.openTickets || 0}</h3>
              <Badge variant={stats?.openTickets > 0 ? 'danger' : 'ghost'}>Action Required</Badge>
           </div>
           <MessageSquare className="absolute -bottom-4 -right-4 w-32 h-32 text-rose-50 opacity-10 group-hover:scale-110 transition-transform duration-700" />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
         <Card>
            <h3 className="text-xl font-bold mb-6">Recent User Activity</h3>
            <div className="space-y-4">
               {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-100 border-2 border-white shadow-sm flex items-center justify-center text-blue-600 font-bold">U</div>
                        <div>
                           <p className="text-sm font-bold">New user registered</p>
                           <p className="text-[10px] text-gray-400 font-bold uppercase">2 minutes ago</p>
                        </div>
                     </div>
                     <Badge variant="primary">INFO</Badge>
                  </div>
               ))}
            </div>
         </Card>
         <Card>
            <h3 className="text-xl font-bold mb-6">Latest Sales</h3>
            <div className="space-y-4">
               {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600"><DollarSign className="w-5 h-5" /></div>
                        <div>
                           <p className="text-sm font-bold">VPS Premium Order Paid</p>
                           <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Transaction #TRS-291{i}</p>
                        </div>
                     </div>
                     <span className="font-black text-gray-900">25.00€</span>
                  </div>
               ))}
            </div>
         </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
