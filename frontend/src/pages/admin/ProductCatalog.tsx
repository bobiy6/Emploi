import React, { useEffect, useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ShoppingBag, FolderTree, Plus, Edit, Trash2, Package, Layers } from 'lucide-react';
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          api.get('/products'),
          api.get('/categories')
        ]);
        setProducts(prodRes.data);
        setCategories(catRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name,
      price: parseFloat(price),
      type,
      categoryId: parseInt(categoryId),
      config: type === 'VPS' ? { cpu: 2, ram: '4GB', disk: '40GB' } : { slots: 32 }
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
  };

  const handleEdit = (prod: any) => {
    setEditingProduct(prod);
    setName(prod.name);
    setPrice(prod.price.toString());
    setType(prod.type);
    setCategoryId(prod.categoryId.toString());
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
               <Input label="Price (€)" type="number" step="0.01" placeholder="9.99" value={price} onChange={(e) => setPrice(e.target.value)} required />

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

               <div className="md:col-span-2 flex justify-end gap-3 pt-4 border-t border-gray-50">
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
