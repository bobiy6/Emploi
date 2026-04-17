import React, { useEffect, useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ShoppingBag, FolderTree, Plus, Edit, Trash2, Package, Layers, Settings, Database, Activity, HardDrive } from 'lucide-react';
import api from '../../api';

const ProductCatalog = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [type, setType] = useState('VPS');
  const [categoryId, setCategoryId] = useState('');
  const [billingCycles, setBillingCycles] = useState<any>({
    '24h': '',
    'monthly': '',
    '3months': '',
    '6months': '',
    'yearly': ''
  });

  // Game specific state
  const [pveServers, setPveServers] = useState<any[]>([]);
  const [selectedPveServer, setSelectedPveServer] = useState('');
  const [metadata, setMetadata] = useState<any>(null);
  const [selectedNest, setSelectedNest] = useState<any>(null);
  const [selectedEgg, setSelectedEgg] = useState<any>(null);
  const [gameConfig, setGameConfig] = useState<any>({
    memory: 1024,
    cpu: 100,
    disk: 5120,
    swap: 0,
    io: 500,
    databases: 0,
    backups: 0,
    allocations: 1,
    deploy_mode: 'location',
    location_id: '',
    node_id: '',
    allocation_id: '',
    environment: {},
    startup: '',
    docker_image: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes, infraRes] = await Promise.all([
          api.get('/products'),
          api.get('/categories'),
          api.get('/admin/infrastructure')
        ]);
        setProducts(prodRes.data);
        setCategories(catRes.data);
        setPveServers(infraRes.data.filter((s: any) => s.type === 'PTERODACTYL'));
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const fetchMetadata = async (serverId: string) => {
    if(!serverId) return;
    try {
      const res = await api.get(`/admin/infrastructure/${serverId}/pterodactyl-metadata`);
      setMetadata(res.data);
    } catch (err) {
      alert('Failed to fetch Pterodactyl metadata');
    }
  };

  useEffect(() => {
    if (selectedPveServer) fetchMetadata(selectedPveServer);
  }, [selectedPveServer]);

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clean up empty cycles
    const cycles: any = {};
    Object.keys(billingCycles).forEach(key => {
        if (billingCycles[key]) cycles[key] = parseFloat(billingCycles[key]);
    });

    const payload = {
      name,
      price: parseFloat(price),
      type,
      categoryId: parseInt(categoryId),
      billingCycles: cycles,
      config: type === 'VPS'
        ? { cpu: 2, ram: '4GB', disk: '40GB' }
        : {
            ...gameConfig,
            serverId: selectedPveServer,
            nest_id: selectedNest?.id || gameConfig.nest_id,
            egg_id: selectedEgg?.id || gameConfig.egg_id
          }
    };

    try {
      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, payload);
        alert('Product updated');
      } else {
        await api.post('/products', payload);
        alert('Product created');
      }
      const res = await api.get('/products');
      setProducts(res.data);
      setShowCreate(false);
      setEditingProduct(null);
      resetForm();
    } catch (err) {
      alert('Operation failed');
    }
  };

  const resetForm = () => {
    setName('');
    setPrice('');
    setType('VPS');
    setCategoryId('');
    setBillingCycles({ '24h': '', 'monthly': '', '3months': '', '6months': '', 'yearly': '' });
  };

  const handleEdit = (prod: any) => {
    setEditingProduct(prod);
    setName(prod.name);
    setPrice(prod.price.toString());
    setType(prod.type);
    setCategoryId(prod.categoryId.toString());
    if (prod.billingCycles) {
        setBillingCycles({
            '24h': prod.billingCycles['24h'] || '',
            'monthly': prod.billingCycles['monthly'] || '',
            '3months': prod.billingCycles['3months'] || '',
            '6months': prod.billingCycles['6months'] || '',
            'yearly': prod.billingCycles['yearly'] || ''
        });
    }

    if (prod.type === 'GAME' && prod.config) {
        const cfg = prod.config;
        setGameConfig({
            memory: cfg.memory || 1024,
            cpu: cfg.cpu || 100,
            disk: cfg.disk || 5120,
            swap: cfg.swap || 0,
            io: cfg.io || 500,
            databases: cfg.databases || 0,
            backups: cfg.backups || 0,
            allocations: cfg.allocations || 1,
            deploy_mode: cfg.deploy_mode || 'location',
            location_id: cfg.location_id || '',
            node_id: cfg.node_id || '',
            allocation_id: cfg.allocation_id || '',
            environment: cfg.environment || {},
            startup: cfg.startup || '',
            docker_image: cfg.docker_image || ''
        });
        setSelectedPveServer(cfg.serverId || '');
        // Note: Nest and Egg selection would require re-fetching metadata and matching IDs
    }

    setShowCreate(true);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-black text-gray-900">Product Catalog</h2>
        <Button onClick={() => setShowCreate(!showCreate)} className="gap-2">
          <Plus className="w-4 h-4" /> Add Product
        </Button>
      </div>

      {showCreate && (
         <Card className="p-8 border-2 border-rose-100 bg-rose-50/20 shadow-xl overflow-hidden">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
               <Package className="w-5 h-5 text-rose-600" /> {editingProduct ? 'Edit Product' : 'Configure New Product'}
            </h3>
            <form onSubmit={handleSaveProduct} className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <Input label="Product Name" placeholder="e.g., VPS Premium XL" value={name} onChange={(e) => setName(e.target.value)} required />
               <Input label="Default Monthly Price (€)" type="number" step="0.01" placeholder="9.99" value={price} onChange={(e) => setPrice(e.target.value)} required />

               <div className="md:col-span-2 p-6 bg-gray-50 rounded-2xl border border-gray-100 space-y-4">
                  <h4 className="font-bold text-gray-900 text-sm uppercase tracking-widest">Multi-Duration Pricing (Optional)</h4>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                     <Input label="24 Hours (€)" type="number" step="0.01" placeholder="Free/1.00" value={billingCycles['24h']} onChange={e => setBillingCycles({...billingCycles, '24h': e.target.value})} />
                     <Input label="1 Month (€)" type="number" step="0.01" placeholder="9.99" value={billingCycles['monthly']} onChange={e => setBillingCycles({...billingCycles, 'monthly': e.target.value})} />
                     <Input label="3 Months (€)" type="number" step="0.01" placeholder="25.00" value={billingCycles['3months']} onChange={e => setBillingCycles({...billingCycles, '3months': e.target.value})} />
                     <Input label="6 Months (€)" type="number" step="0.01" placeholder="50.00" value={billingCycles['6months']} onChange={e => setBillingCycles({...billingCycles, '6months': e.target.value})} />
                     <Input label="1 Year (€)" type="number" step="0.01" placeholder="90.00" value={billingCycles['yearly']} onChange={e => setBillingCycles({...billingCycles, 'yearly': e.target.value})} />
                  </div>
                  <p className="text-[10px] text-gray-400 italic">If a duration is left blank, it won't be available to customers.</p>
               </div>

               <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700 ml-1">Product Type</label>
                  <select
                     className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-rose-500 transition-all outline-none text-sm"
                     value={type}
                     onChange={(e) => setType(e.target.value)}
                  >
                     <option value="VPS">VPS Hosting</option>
                     <option value="GAME">Game Server</option>
                  </select>
               </div>

               <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700 ml-1">Category</label>
                  <select
                     className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-rose-500 transition-all outline-none text-sm"
                     value={categoryId}
                     onChange={(e) => setCategoryId(e.target.value)}
                     required
                  >
                     <option value="">Select Category</option>
                     {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
               </div>

               {type === 'GAME' && (
                  <div className="md:col-span-2 space-y-8 mt-4 pt-8 border-t-2 border-gray-100">
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-1">
                           <label className="block text-sm font-black text-gray-400 uppercase tracking-widest ml-1">Pterodactyl Node</label>
                           <select
                              className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-white"
                              value={selectedPveServer}
                              onChange={(e) => setSelectedPveServer(e.target.value)}
                              required
                           >
                              <option value="">Select Panel Server</option>
                              {pveServers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                           </select>
                        </div>

                        <div className="space-y-1">
                           <label className="block text-sm font-black text-gray-400 uppercase tracking-widest ml-1">Nest</label>
                           <select
                              className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-white"
                              onChange={(e) => {
                                 const nest = metadata?.nests.find((n:any) => n.id === parseInt(e.target.value));
                                 setSelectedNest(nest);
                                 setSelectedEgg(null);
                              }}
                              required
                           >
                              <option value="">Select Nest</option>
                              {metadata?.nests.map((n:any) => <option key={n.id} value={n.id}>{n.name}</option>)}
                           </select>
                        </div>

                        <div className="space-y-1">
                           <label className="block text-sm font-black text-gray-400 uppercase tracking-widest ml-1">Egg</label>
                           <select
                              className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-white"
                              onChange={(e) => {
                                 const egg = selectedNest?.eggs.find((eg:any) => eg.id === parseInt(e.target.value));
                                 setSelectedEgg(egg);
                                 const env: any = {};
                                 egg?.relationships?.variables?.data.forEach((v: any) => {
                                    env[v.attributes.env_variable] = v.attributes.default_value;
                                 });
                                 setGameConfig({
                                    ...gameConfig,
                                    environment: env,
                                    startup: egg.startup,
                                    docker_image: egg.docker_image
                                 });
                              }}
                              required
                           >
                              <option value="">Select Egg</option>
                              {selectedNest?.eggs.map((e:any) => <option key={e.id} value={e.id}>{e.name}</option>)}
                           </select>
                        </div>
                     </div>

                     {selectedEgg && (
                        <>
                           <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                              <Input label="Memory (MB)" type="number" value={gameConfig.memory} onChange={e => setGameConfig({...gameConfig, memory: e.target.value})} />
                              <Input label="CPU (%)" type="number" value={gameConfig.cpu} onChange={e => setGameConfig({...gameConfig, cpu: e.target.value})} />
                              <Input label="Disk (MB)" type="number" value={gameConfig.disk} onChange={e => setGameConfig({...gameConfig, disk: e.target.value})} />
                              <Input label="Swap (MB)" type="number" value={gameConfig.swap} onChange={e => setGameConfig({...gameConfig, swap: e.target.value})} />
                              <Input label="IO (Block Weight)" type="number" value={gameConfig.io} onChange={e => setGameConfig({...gameConfig, io: e.target.value})} />
                           </div>

                           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              <Input label="Databases" type="number" value={gameConfig.databases} onChange={e => setGameConfig({...gameConfig, databases: e.target.value})} />
                              <Input label="Backups" type="number" value={gameConfig.backups} onChange={e => setGameConfig({...gameConfig, backups: e.target.value})} />
                              <Input label="Allocations" type="number" value={gameConfig.allocations} onChange={e => setGameConfig({...gameConfig, allocations: e.target.value})} />
                           </div>

                           <div className="space-y-4">
                              <h4 className="font-bold text-gray-900 flex items-center gap-2"><Settings className="w-4 h-4" /> Startup & Docker Configuration</h4>
                              <div className="grid grid-cols-1 gap-4">
                                 <Input
                                    label="Startup Command"
                                    value={gameConfig.startup}
                                    onChange={e => setGameConfig({...gameConfig, startup: e.target.value})}
                                    placeholder="e.g. java -Xms128M -Xmx{{SERVER_MEMORY}}M -jar {{SERVER_JARFILE}}"
                                 />
                                 <Input
                                    label="Docker Image"
                                    value={gameConfig.docker_image}
                                    onChange={e => setGameConfig({...gameConfig, docker_image: e.target.value})}
                                    placeholder="e.g. quay.io/pterodactyl/core:java"
                                 />
                              </div>
                           </div>

                           <div className="space-y-4">
                              <h4 className="font-bold text-gray-900 flex items-center gap-2"><Database className="w-4 h-4" /> Environment Variables</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                 {selectedEgg.relationships?.variables?.data.map((v: any) => (
                                    <Input
                                       key={v.attributes.id}
                                       label={v.attributes.name}
                                       placeholder={v.attributes.default_value}
                                       value={gameConfig.environment[v.attributes.env_variable] || ''}
                                       onChange={e => setGameConfig({
                                          ...gameConfig,
                                          environment: { ...gameConfig.environment, [v.attributes.env_variable]: e.target.value }
                                       })}
                                    />
                                 ))}
                              </div>
                           </div>

                           <div className="space-y-4">
                              <h4 className="font-bold text-gray-900 flex items-center gap-2"><Activity className="w-4 h-4" /> Deployment Settings</h4>
                              <div className="flex gap-4">
                                 <button
                                    type="button"
                                    onClick={() => setGameConfig({...gameConfig, deploy_mode: 'location'})}
                                    className={`flex-1 p-4 rounded-2xl border-2 transition-all text-left ${gameConfig.deploy_mode === 'location' ? 'border-rose-500 bg-rose-50' : 'border-gray-100 bg-white'}`}
                                 >
                                    <p className="font-bold text-sm">Auto-Deploy by Location</p>
                                    <p className="text-[10px] text-gray-400">Pterodactyl will pick the best node in the location.</p>
                                 </button>
                                 <button
                                    type="button"
                                    onClick={() => setGameConfig({...gameConfig, deploy_mode: 'node'})}
                                    className={`flex-1 p-4 rounded-2xl border-2 transition-all text-left ${gameConfig.deploy_mode === 'node' ? 'border-rose-500 bg-rose-50' : 'border-gray-100 bg-white'}`}
                                 >
                                    <p className="font-bold text-sm">Manual Node Selection</p>
                                    <p className="text-[10px] text-gray-400">Select a specific node and allocation ID.</p>
                                 </button>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                 {gameConfig.deploy_mode === 'location' ? (
                                    <div className="space-y-1">
                                       <label className="block text-sm font-medium text-gray-700 ml-1">Select Location</label>
                                       <select
                                          className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-white"
                                          value={gameConfig.location_id}
                                          onChange={e => setGameConfig({...gameConfig, location_id: e.target.value})}
                                       >
                                          <option value="">Select Location</option>
                                          {metadata?.locations.map((l:any) => <option key={l.id} value={l.id}>{l.short} - {l.long}</option>)}
                                       </select>
                                    </div>
                                 ) : (
                                    <>
                                       <div className="space-y-1">
                                          <label className="block text-sm font-medium text-gray-700 ml-1">Select Node</label>
                                          <select
                                             className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-white"
                                             value={gameConfig.node_id}
                                             onChange={e => setGameConfig({...gameConfig, node_id: e.target.value})}
                                          >
                                             <option value="">Select Node</option>
                                             {metadata?.nodes.map((n:any) => <option key={n.id} value={n.id}>{n.name}</option>)}
                                          </select>
                                       </div>
                                       <Input label="Allocation ID" placeholder="e.g. 1" value={gameConfig.allocation_id} onChange={e => setGameConfig({...gameConfig, allocation_id: e.target.value})} />
                                    </>
                                 )}
                              </div>
                           </div>
                        </>
                     )}
                  </div>
               )}

               <div className="md:col-span-2 flex justify-end gap-3 pt-8 mt-4 border-t border-gray-50">
                  <Button variant="ghost" onClick={() => { setShowCreate(false); setEditingProduct(null); resetForm(); }}>Cancel</Button>
                  <Button type="submit">{editingProduct ? 'Update Product' : 'Create Product'}</Button>
               </div>
            </form>
         </Card>
      )}

      <Card className="p-0 border-none overflow-hidden shadow-xl">
           <table className="w-full text-left">
              <thead>
                 <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Product</th>
                    <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Type</th>
                    <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Category</th>
                    <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Price</th>
                    <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Actions</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                 {products.length === 0 ? (
                    <tr>
                       <td colSpan={5} className="px-8 py-10 text-center text-gray-400 font-medium">No products available.</td>
                    </tr>
                 ) : (
                    products.map((prod: any) => (
                       <tr key={prod.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-8 py-6">
                             <div className="flex items-center gap-4">
                                <div className="p-2 bg-rose-50 rounded-lg"><Package className="w-4 h-4 text-rose-600" /></div>
                                <span className="font-bold text-gray-900">{prod.name}</span>
                             </div>
                          </td>
                          <td className="px-8 py-6">
                             <Badge variant="ghost" className="font-black tracking-widest text-[10px]">{prod.type}</Badge>
                          </td>
                          <td className="px-8 py-6">
                             <div className="flex items-center gap-2 font-bold text-gray-400 text-sm">
                                <Layers className="w-3 h-3" /> {prod.category?.name}
                             </div>
                          </td>
                          <td className="px-8 py-6 font-black text-gray-900">{prod.price.toFixed(2)}€</td>
                          <td className="px-8 py-6">
                             <div className="flex items-center gap-2">
                                <button
                                   onClick={() => handleEdit(prod)}
                                   className="p-2 bg-gray-100 rounded-lg text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                >
                                   <Edit className="w-4 h-4" />
                                </button>
                                <button
                                   onClick={async () => {
                                      if(confirm('Delete product?')) {
                                         await api.delete(`/products/${prod.id}`);
                                         setProducts(products.filter(p => p.id !== prod.id));
                                      }
                                   }}
                                   className="p-2 bg-gray-100 rounded-lg text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                >
                                   <Trash2 className="w-4 h-4" />
                                </button>
                             </div>
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

export default ProductCatalog;
