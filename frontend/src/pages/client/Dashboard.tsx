import React, { useEffect, useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Server, ShieldCheck, CreditCard, Activity } from 'lucide-react';
import api from '../../api';

const StatCard = ({ icon: Icon, label, value, color }: any) => (
  <Card className="flex items-center gap-4 border-none shadow-md">
    <div className={`p-3 rounded-xl bg-${color}-50 text-${color}-600`}>
      <Icon className="w-6 h-6" />
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  </Card>
);

const Dashboard = () => {
  const [profile, setProfile] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, servicesRes] = await Promise.all([
          api.get('/auth/profile'),
          api.get('/services')
        ]);
        setProfile(profileRes.data);
        setServices(servicesRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={Server} label="Active Services" value={services.length} color="blue" />
        <StatCard icon={CreditCard} label="Credit Balance" value={`${profile?.balance || 0}€`} color="emerald" />
        <StatCard icon={ShieldCheck} label="Pending Invoices" value="0" color="rose" />
        <StatCard icon={Activity} label="System Uptime" value="99.9%" color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold">Recent Services</h3>
              <Badge variant="primary">View All</Badge>
            </div>
            {services.length === 0 ? (
              <div className="text-center py-10 border-2 border-dashed border-gray-100 rounded-2xl">
                 <p className="text-gray-400">You don't have any active services yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {services.map((service: any) => (
                  <div key={service.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-white hover:shadow-md transition-all duration-200">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-white rounded-lg border border-gray-100 shadow-sm">
                        <Server className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{service.product.name}</p>
                        <p className="text-xs text-gray-500">ID: {service.externalId}</p>
                      </div>
                    </div>
                    <Badge variant={service.status === 'ACTIVE' ? 'success' : 'warning'}>
                      {service.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-6">
           <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-none">
              <h3 className="text-lg font-bold mb-2">Need More Power?</h3>
              <p className="text-blue-100 text-sm mb-6 leading-relaxed">Explore our newest VPS configurations with high-performance NVMe storage.</p>
              <button className="w-full py-3 bg-white text-blue-700 font-bold rounded-xl hover:bg-blue-50 transition-colors shadow-lg">
                 Browse Marketplace
              </button>
           </Card>

           <Card>
              <h3 className="text-lg font-bold mb-4">Quick Shortcuts</h3>
              <div className="grid grid-cols-2 gap-3">
                 <div className="p-4 bg-gray-50 rounded-xl text-center hover:bg-blue-50 hover:text-blue-600 cursor-pointer transition-colors group">
                    <CreditCard className="w-6 h-6 mx-auto mb-2 text-gray-400 group-hover:text-blue-600" />
                    <span className="text-xs font-bold uppercase">Pay Invoices</span>
                 </div>
                 <div className="p-4 bg-gray-50 rounded-xl text-center hover:bg-blue-50 hover:text-blue-600 cursor-pointer transition-colors group">
                    <LifeBuoy className="w-6 h-6 mx-auto mb-2 text-gray-400 group-hover:text-blue-600" />
                    <span className="text-xs font-bold uppercase">Get Help</span>
                 </div>
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
