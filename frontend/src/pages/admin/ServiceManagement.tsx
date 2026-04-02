import React, { useEffect, useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Server, User, Globe, Activity, History, X, Terminal } from 'lucide-react';
import api from '../../api';

const AdminServiceManagement = () => {
  const [services, setServices] = useState<any[]>([]);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

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

  const fetchServiceLogs = async (serviceId: number) => {
    setLoadingLogs(true);
    try {
      const res = await api.get(`/users/logs?serviceId=${serviceId}`);
      setLogs(res.data.logs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingLogs(false);
    }
  };

  const openTimeline = (service: any) => {
    setSelectedService(service);
    fetchServiceLogs(service.id);
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
                        <button
                          onClick={() => openTimeline(service)}
                          className="px-4 py-2 bg-indigo-50 rounded-lg text-indigo-600 text-xs font-bold hover:bg-indigo-600 hover:text-white transition-all flex items-center gap-2"
                        >
                          <History className="w-3 h-3" /> Timeline
                        </button>
                        <button className="px-4 py-2 bg-gray-100 rounded-lg text-gray-600 text-xs font-bold hover:bg-gray-200 transition-all">Suspend</button>
                        <button className="px-4 py-2 bg-rose-50 rounded-lg text-rose-600 text-xs font-bold hover:bg-rose-600 hover:text-white transition-all">Terminate</button>
                     </div>
                  </div>
               </Card>
            ))
         )}
      </div>

      {/* Timeline Modal */}
      {selectedService && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Service Timeline</h3>
                  <p className="text-xs font-bold text-gray-400">Logs for {selectedService.product?.name} (#{selectedService.id})</p>
                </div>
              </div>
              <button onClick={() => setSelectedService(null)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-8 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
                {loadingLogs ? (
                  <p className="text-center text-gray-400 py-10">Loading logs...</p>
                ) : logs.length === 0 ? (
                  <p className="text-center text-gray-400 py-10">No history available for this service.</p>
                ) : logs.map((log) => (
                  <div key={log.id} className="relative pl-12">
                    <div className={`absolute left-0 top-1 w-10 h-10 rounded-full border-4 border-white shadow-sm flex items-center justify-center z-10 ${
                      log.level === 'ERROR' ? 'bg-rose-500' :
                      log.level === 'WARN' ? 'bg-amber-500' : 'bg-indigo-500'
                    }`}>
                      {log.type === 'PROVISIONING' ? <Terminal className="w-4 h-4 text-white" /> : <Activity className="w-4 h-4 text-white" />}
                    </div>
                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{log.type}</span>
                        <span className="text-[10px] font-bold text-gray-400">{new Date(log.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-sm font-bold text-gray-900">{log.message}</p>
                      {log.details && (
                        <div className="mt-2 text-[10px] bg-gray-900 text-gray-300 p-2 rounded-lg font-mono">
                          {JSON.stringify(log.details)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-100">
              <button onClick={() => setSelectedService(null)} className="w-full py-3 bg-white border border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-100 transition-all">
                Close Timeline
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminServiceManagement;
