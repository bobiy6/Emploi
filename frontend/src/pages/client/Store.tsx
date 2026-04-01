import React, { useEffect, useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ShoppingCart, Cpu, HardDrive, Database, Gamepad2, Layers } from 'lucide-react';
import api from '../../api';
import OrderModal from '../../components/OrderModal';

const Store = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [orderProduct, setOrderProduct] = useState<any>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        setCategories(res.data);
        if (res.data.length > 0) setSelectedCategory(res.data[0].id);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCategories();
  }, []);

  const handleOrder = (product: any) => {
    setOrderProduct(product);
  };

  const activeCategory = categories.find(c => c.id === selectedCategory);

  return (
    <div className="space-y-10">
      {/* Category Tabs */}
      <div className="flex items-center gap-4 border-b border-gray-200 pb-2">
        {categories.map((cat: any) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-6 py-4 font-bold text-sm uppercase tracking-wider transition-all relative ${
              selectedCategory === cat.id ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <div className="flex items-center gap-2">
              {cat.name.toLowerCase().includes('vps') ? <Layers className="w-4 h-4" /> : <Gamepad2 className="w-4 h-4" />}
              {cat.name}
            </div>
            {selectedCategory === cat.id && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {activeCategory?.products.map((product: any) => (
          <Card key={product.id} className="flex flex-col h-full hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border-none group">
            <div className="mb-6 flex justify-between items-start">
               <div className="p-4 bg-blue-50 rounded-2xl group-hover:bg-blue-600 transition-colors duration-300">
                  {product.type === 'VPS' ? (
                     <Cpu className="w-8 h-8 text-blue-600 group-hover:text-white" />
                  ) : (
                     <Gamepad2 className="w-8 h-8 text-blue-600 group-hover:text-white" />
                  )}
               </div>
               <div className="text-right">
                  <p className="text-3xl font-black text-gray-900 leading-none">{product.price}€</p>
                  <p className="text-xs text-gray-400 font-bold uppercase mt-1">per month</p>
               </div>
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h3>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed line-clamp-2">{product.description}</p>

            <div className="space-y-4 mb-10 mt-auto">
               {product.config?.cpu && (
                  <div className="flex items-center gap-3 text-sm font-semibold text-gray-700 bg-gray-50 p-3 rounded-xl">
                    <Cpu className="w-4 h-4 text-blue-600" />
                    <span>{product.config.cpu} vCores CPU</span>
                  </div>
               )}
               {product.config?.ram && (
                  <div className="flex items-center gap-3 text-sm font-semibold text-gray-700 bg-gray-50 p-3 rounded-xl">
                    <Database className="w-4 h-4 text-blue-600" />
                    <span>{product.config.ram} RAM</span>
                  </div>
               )}
               {product.config?.disk && (
                  <div className="flex items-center gap-3 text-sm font-semibold text-gray-700 bg-gray-50 p-3 rounded-xl">
                    <HardDrive className="w-4 h-4 text-blue-600" />
                    <span>{product.config.disk} NVMe Storage</span>
                  </div>
               )}
            </div>

            <Button
               className="w-full h-14 font-black uppercase text-sm tracking-widest shadow-lg shadow-blue-100"
               onClick={() => handleOrder(product)}
            >
               Order Service
            </Button>
          </Card>
        ))}
      </div>

      {orderProduct && <OrderModal product={orderProduct} onClose={() => setOrderProduct(null)} />}
    </div>
  );
};

export default Store;
