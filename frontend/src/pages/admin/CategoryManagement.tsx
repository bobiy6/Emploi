import React, { useEffect, useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { FolderTree, Plus, Edit, Trash2 } from 'lucide-react';
import api from '../../api';

const CategoryManagement = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/categories', { name, description });
      alert('Category created');
      setName('');
      setDescription('');
      setShowCreate(false);
      fetchCategories();
    } catch (err) {
      alert('Failed to create category');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-black text-gray-900">Category Management</h2>
        <Button onClick={() => setShowCreate(!showCreate)} className="gap-2">
          <Plus className="w-4 h-4" /> Add Category
        </Button>
      </div>

      {showCreate && (
         <Card className="p-8 border-2 border-rose-100 bg-rose-50/20 shadow-xl overflow-hidden">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
               <FolderTree className="w-5 h-5 text-rose-600" /> New Category
            </h3>
            <form onSubmit={handleCreate} className="space-y-6">
               <Input label="Category Name" placeholder="e.g., Cloud Hosting" value={name} onChange={(e) => setName(e.target.value)} required />
               <Input label="Description" placeholder="Short description..." value={description} onChange={(e) => setDescription(e.target.value)} />
               <div className="flex justify-end gap-3 pt-4 border-t border-gray-50">
                  <Button variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
                  <Button type="submit">Create Category</Button>
               </div>
            </form>
         </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {categories.map(cat => (
            <Card key={cat.id} className="hover:shadow-lg transition-all">
               <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-rose-50 rounded-xl text-rose-600">
                     <FolderTree className="w-6 h-6" />
                  </div>
                  <div className="flex gap-2">
                     <button className="text-gray-400 hover:text-blue-600"><Edit className="w-4 h-4" /></button>
                     <button
                        onClick={async () => {
                           if(confirm('Delete category?')) {
                              await api.delete(`/categories/${cat.id}`);
                              setCategories(categories.filter(c => c.id !== cat.id));
                           }
                        }}
                        className="text-gray-400 hover:text-red-600"
                     >
                        <Trash2 className="w-4 h-4" />
                     </button>
                  </div>
               </div>
               <h3 className="text-xl font-bold mb-1">{cat.name}</h3>
               <p className="text-sm text-gray-500 mb-4">{cat.description || 'No description'}</p>
               <div className="pt-4 border-t border-gray-50 flex justify-between items-center">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{cat.products?.length || 0} Products</span>
                  <Badge variant="ghost">ID: #{cat.id}</Badge>
               </div>
            </Card>
         ))}
      </div>
    </div>
  );
};

export default CategoryManagement;
