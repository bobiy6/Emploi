import React, { useEffect, useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Server, User, Globe, Activity } from 'lucide-react';
import api from '../../api';

const AdminServiceManagement = () => {
  const [services, setServices] = useState<any[]>([]);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await api.get('/services/all');
      setServices(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-black text-gray-900">Active Services</h2>

      <div className="grid grid-cols-1 gap-6">
         {services.length === 0 ? (
            <Card className="text-center py-20 border-2 border-dashed">
               <p className="text-gray-400">No services currently active in the system.</p>
            </Card>
         ) : (
            services.map(service => (
               <Card key={service.id} className="hover:shadow-lg transition-all border-none">
                  <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6">
                     <div className="flex items-center gap-4">
                        <div className="p-4 bg-blue-50 rounded-2xl text-blue-600">
                           <Server className="w-6 h-6" />
                        </div>
                        <div>
                           <h3 className="text-xl font-bold text-gray-900">{service.product?.name}</h3>
                           <div className="flex items-center gap-3 mt-1">
                              <span className="text-xs font-bold text-gray-400 flex items-center gap-1">
                                 <User className="w-3 h-3" /> {service.user?.name}
                              </span>
                              <span className="text-xs font-bold text-blue-400 flex items-center gap-1 uppercase">
                                 <Globe className="w-3 h-3" /> {service.module}
                              </span>
                           </div>
                        </div>
                     </div>

                     <div className="grid grid-cols-2 md:grid-cols-3 gap-8 items-center">
                        <div>
                           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Status</p>
                           <Badge variant={service.status === 'ACTIVE' ? 'success' : 'warning'}>{service.status}</Badge>
                        </div>
                        <div>
                           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">External ID</p>
                           <p className="font-mono text-xs text-gray-700 font-bold">{service.externalId || 'N/A'}</p>
                        </div>
                        <div className="hidden md:block">
                           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Due Date</p>
                           <p className="text-xs font-bold text-rose-600">{new Date(service.nextDueDate).toLocaleDateString()}</p>
                        </div>
                     </div>

                     <div className="flex gap-2">
                        <button className="px-4 py-2 bg-gray-100 rounded-lg text-gray-600 text-xs font-bold hover:bg-gray-200 transition-all">Suspend</button>
                        <button className="px-4 py-2 bg-rose-50 rounded-lg text-rose-600 text-xs font-bold hover:bg-rose-600 hover:text-white transition-all">Terminate</button>
                     </div>
                  </div>
               </Card>
            ))
         )}
      </div>
    </div>
  );
};

export default AdminServiceManagement;
