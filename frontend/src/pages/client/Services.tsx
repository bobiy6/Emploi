import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Server, Play, Square, RotateCcw, Monitor, Info, Calendar, ShieldAlert, CreditCard } from 'lucide-react';
import api from '../../api';

const Services = () => {
  const [services, setServices] = useState<any[]>([]);
  const [selectedService, setSelectedService] = useState<any>(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await api.get('/services');
        setServices(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchServices();
  }, []);

  const handlePowerAction = async (serviceId: number, action: string) => {
    try {
      await api.post(`/services/${serviceId}/power`, { action });
      alert(`Service ${action} signal sent successfully`);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Power action failed');
    }
  };

  const handleRefresh = async (serviceId: number) => {
    try {
      const res = await api.post(`/services/${serviceId}/refresh`);
      setSelectedService(res.data);
      setServices(services.map(s => s.id === serviceId ? res.data : s));
      alert('Details refreshed successfully');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Refresh failed');
    }
  };

  const getPteroDetails = (service: any) => {
     if (service.module !== 'pterodactyl' || !service.externalId) return null;
     try {
        return JSON.parse(service.externalId);
     } catch {
        return null;
     }
  };

  if (selectedService) {
     const ptero = getPteroDetails(selectedService);
     return (
        <div className="space-y-8">
           <button onClick={() => setSelectedService(null)} className="text-sm font-bold text-blue-600 hover:underline flex items-center gap-1">
              ← Retour aux services
           </button>

           <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <div className="w-16 h-16 bg-blue-100 rounded-3xl flex items-center justify-center border-4 border-white shadow-xl">
                    <Server className="w-8 h-8 text-blue-600" />
                 </div>
                 <div>
                    <h2 className="text-3xl font-black text-gray-900">{selectedService.product?.name || 'Service'}</h2>
                    <p className="text-sm font-bold text-gray-400">
                       {ptero ? `ID: ${ptero.identifier}` : `UUID: ${selectedService.externalId || 'N/A'}`}
                    </p>
                 </div>
              </div>
              <Badge variant={selectedService.status === 'ACTIVE' ? 'success' : 'danger'} className="text-base px-4 py-1 uppercase">
                 {selectedService.status === 'ACTIVE' ? 'ACTIF' : 'SUSPENDU'}
              </Badge>
           </div>

           {selectedService.status === 'SUSPENDED' && (
              <div className="bg-rose-50 border-2 border-rose-100 p-6 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6">
                 <div className="flex items-center gap-6">
                    <div className="w-12 h-12 bg-rose-600 rounded-2xl flex items-center justify-center text-white shrink-0">
                       <ShieldAlert className="w-6 h-6" />
                    </div>
                    <div>
                       <h4 className="font-black text-rose-900 uppercase tracking-widest text-xs">Service Expiré & Suspendu</h4>
                       <p className="text-rose-700 text-sm font-medium">Veuillez renouveler ce service sous 3 jours pour éviter la suppression définitive de vos données.</p>
                    </div>
                 </div>
                 <Link to="/billing">
                    <Button className="bg-rose-600 hover:bg-rose-700 text-white border-none gap-2 whitespace-nowrap">
                       <CreditCard className="w-4 h-4" /> Renouveler maintenant
                    </Button>
                 </Link>
              </div>
           )}

           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                 <Card className="p-8">
                    <div className="flex items-center justify-between mb-8">
                       <h3 className="text-xl font-bold flex items-center gap-2">
                          <Monitor className="w-5 h-5" />
                          Contrôles du Service
                       </h3>
                       <div className="flex items-center gap-2">
                          <Button variant="secondary" size="sm" onClick={() => handlePowerAction(selectedService.id, 'start')}>
                             <Play className="w-4 h-4 mr-2" /> Démarrer
                          </Button>
                          <Button variant="secondary" size="sm" onClick={() => handlePowerAction(selectedService.id, 'stop')}>
                             <Square className="w-4 h-4 mr-2" /> Arrêter
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handlePowerAction(selectedService.id, 'reboot')}>
                             <RotateCcw className="w-4 h-4 mr-2" /> Redémarrer
                          </Button>
                       </div>
                    </div>

                    <div className="bg-black rounded-2xl p-6 h-64 font-mono text-emerald-400 overflow-y-auto text-sm">
                       <p>[SYSTEM] Booting service {selectedService.externalId}...</p>
                       <p>[KERNEL] Initializing kernel...</p>
                       <p>[INIT] Starting network services...</p>
                       <p>[SSH] Listening on port 22...</p>
                       <p>[APP] Ready for connection.</p>
                       <p className="mt-4 animate-pulse">_</p>
                    </div>
                 </Card>
              </div>

              <div className="space-y-6">
                 <Card>
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                       <Info className="w-5 h-5" /> Détails du Service
                    </h3>
                    <div className="space-y-4">
                       <div className="flex justify-between border-b border-gray-50 pb-2">
                          <span className="text-gray-400 text-sm">Type</span>
                          <span className="font-bold">{selectedService.product?.type || 'N/A'}</span>
                       </div>
                       <div className="flex justify-between border-b border-gray-50 pb-2">
                          <span className="text-gray-400 text-sm">Module</span>
                          <span className="font-bold uppercase text-blue-600">{selectedService.module}</span>
                       </div>
                       {ptero && (
                          <>
                             <div className="flex justify-between border-b border-gray-50 pb-2">
                                <span className="text-gray-400 text-sm">Adresse</span>
                                <div className="flex flex-col items-end">
                                   <span className="font-mono font-bold text-rose-600">{ptero.connection}</span>
                                   <button
                                      onClick={() => handleRefresh(selectedService.id)}
                                      className="text-[10px] text-blue-600 font-bold hover:underline"
                                   >
                                      Rafraîchir l'IP
                                   </button>
                                </div>
                             </div>
                             {ptero.ptero_password && (
                                <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl mt-4">
                                   <p className="text-[10px] text-blue-600 font-black uppercase mb-1">Identifiants Pterodactyl</p>
                                   <div className="flex flex-col gap-1">
                                      <p className="text-xs font-bold">User: <span className="font-mono">{selectedService.user?.email || 'Votre email'}</span></p>
                                      <p className="text-xs font-bold">Pass: <span className="font-mono text-rose-600">{ptero.ptero_password}</span></p>
                                   </div>
                                   <p className="text-[8px] text-blue-400 mt-2 italic">Changez votre mot de passe après la première connexion.</p>
                                </div>
                             )}

                             <div className="flex flex-col gap-2 pt-2 border-b border-gray-50 pb-4">
                                <span className="text-gray-400 text-sm">Panel de gestion</span>
                                <a
                                  href={`${ptero.panel_url}/server/${ptero.identifier}`}
                                  target="_blank"
                                  className="bg-gray-900 text-white p-3 rounded-xl text-center text-xs font-bold hover:bg-black transition-all"
                                >
                                   Ouvrir le Panel Pterodactyl
                                </a>
                             </div>
                          </>
                       )}
                       <div className="flex justify-between">
                          <span className="text-gray-400 text-sm">Créé le</span>
                          <span className="font-bold">{new Date(selectedService.createdAt).toLocaleDateString()}</span>
                       </div>
                    </div>
                 </Card>

                 <Card className="bg-amber-50 border-amber-100">
                    <h3 className="text-amber-700 font-bold mb-4 flex items-center gap-2">
                       <Calendar className="w-5 h-5" /> Prochaine échéance
                    </h3>
                    <p className="text-3xl font-black text-amber-900 mb-1">
                       {new Date(selectedService.nextDueDate).toLocaleDateString()}
                    </p>
                    <p className="text-amber-600 text-sm font-medium">Renouvellement automatique activé</p>
                 </Card>
              </div>
           </div>
        </div>
     );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-black text-gray-900">Mes Services</h2>
        <Link to="/store">
           <Button size="sm">Commander un nouveau</Button>
        </Link>
      </div>

      {services.length === 0 ? (
        <Card className="text-center py-20 border-2 border-dashed">
          <Server className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">Aucun service trouvé</h3>
          <p className="text-gray-400 max-w-sm mx-auto">Vous n'avez pas encore commandé de services. Parcourez notre boutique.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <Card key={service.id} className="hover:shadow-xl transition-all duration-300 border-none group cursor-pointer" onClick={() => setSelectedService(service)}>
              <div className="flex items-center justify-between mb-6">
                <div className="p-3 bg-blue-50 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 text-blue-600">
                   <Server className="w-6 h-6" />
                </div>
                <Badge variant={service.status === 'ACTIVE' ? 'success' : 'danger'}>
                   {service.status === 'ACTIVE' ? 'ACTIF' : 'SUSPENDU'}
                </Badge>
              </div>
              <h3 className="text-xl font-bold mb-1">{service.product?.name || 'Service'}</h3>
              <p className="text-xs text-gray-400 font-bold mb-4">
                 {service.module === 'pterodactyl' && getPteroDetails(service)
                    ? `IP: ${getPteroDetails(service).connection}`
                    : `Type: ${service.product?.type || service.module}`}
              </p>
              <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                 <div className="flex gap-1">
                    <div className={`w-2 h-2 rounded-full ${service.status === 'ACTIVE' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                    <span className={`text-[10px] font-black uppercase ${service.status === 'ACTIVE' ? 'text-emerald-600' : 'text-rose-600'}`}>
                       {service.status === 'ACTIVE' ? 'En ligne' : 'Hors ligne'}
                    </span>
                 </div>
                 <span className="text-[10px] font-bold text-gray-400 uppercase">Gérer →</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Services;
