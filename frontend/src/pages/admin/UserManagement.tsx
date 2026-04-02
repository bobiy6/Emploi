import React, { useEffect, useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Users, Mail, DollarSign, LogIn, Edit, Search, UserCheck, Plus, Trash2 } from 'lucide-react';
import api from '../../api';
import { useNavigate } from 'react-router-dom';

const UserManagement = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [adminForm, setAdminForm] = useState({ name: '', email: '', password: '', role: 'SUPPORT' });
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleImpersonate = async (userId: number) => {
    try {
      const res = await api.post(`/users/${userId}/impersonate`);
      localStorage.setItem('token', res.data.token);
      navigate('/dashboard');
      window.location.reload();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Impersonation failed');
    }
  };

  const handleBalanceUpdate = async (userId: number, type: 'add' | 'remove') => {
    const amountStr = prompt(`Enter amount to ${type}:`);
    if (!amountStr) return;
    const amount = parseFloat(amountStr);
    const finalAmount = type === 'add' ? amount : -amount;
    try {
      await api.post(`/users/${userId}/balance`, { amount: finalAmount });
      alert('Balance updated');
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Update failed');
    }
  };

  const handleSaveAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await api.put(`/users/${editingUser.id}`, adminForm);
        alert('User updated');
      } else {
        await api.post('/users/admin', adminForm);
        alert('Admin account created');
      }
      setShowAdminModal(false);
      setEditingUser(null);
      setAdminForm({ name: '', email: '', password: '', role: 'SUPPORT' });
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (user: any) => {
    setEditingUser(user);
    setAdminForm({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role
    });
    setShowAdminModal(true);
  };

  const filteredUsers = users?.filter(u =>
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.name?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between gap-4 md:items-center">
        <div className="flex items-center gap-4">
           <h2 className="text-3xl font-black text-gray-900">User Management</h2>
           <Button size="sm" variant="outline" onClick={() => setShowAdminModal(true)}>+ New Admin</Button>
        </div>
        <div className="relative max-w-sm w-full">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
           <Input
              className="pl-12 h-12"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
           />
        </div>
      </div>

      {showAdminModal && (
         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
               <h3 className="text-2xl font-bold mb-6">{editingUser ? 'Edit User' : 'Create Staff Account'}</h3>
               <form onSubmit={handleSaveAdmin} className="space-y-4">
                  <Input label="Name" value={adminForm.name} onChange={e => setAdminForm({...adminForm, name: e.target.value})} required />
                  <Input label="Email" type="email" value={adminForm.email} onChange={e => setAdminForm({...adminForm, email: e.target.value})} required />
                  <Input label="Password" type="password" placeholder={editingUser ? 'Leave blank to keep same' : 'Enter password'} value={adminForm.password} onChange={e => setAdminForm({...adminForm, password: e.target.value})} required={!editingUser} />
                  <div className="space-y-1">
                     <label className="text-sm font-medium ml-1">Staff Role</label>
                     <select
                        className="w-full h-11 px-4 rounded-xl border border-gray-200"
                        value={adminForm.role}
                        onChange={e => setAdminForm({...adminForm, role: e.target.value})}
                     >
                        <option value="ADMIN">Full Administrator</option>
                        <option value="SUPPORT">Support Agent (Limited)</option>
                     </select>
                  </div>
                  <div className="flex gap-3 pt-4">
                     <Button variant="ghost" className="flex-1" onClick={() => { setShowAdminModal(false); setEditingUser(null); setAdminForm({ name: '', email: '', password: '', role: 'SUPPORT' }); }}>Cancel</Button>
                     <Button type="submit" className="flex-1">{editingUser ? 'Update User' : 'Create Account'}</Button>
                  </div>
               </form>
            </Card>
         </div>
      )}

      <Card className="p-0 border-none overflow-hidden shadow-xl">
           <table className="w-full text-left">
              <thead>
                 <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">User</th>
                    <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Balance</th>
                    <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Role</th>
                    <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Joined</th>
                    <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Actions</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                 {filteredUsers.length === 0 ? (
                    <tr>
                       <td colSpan={5} className="px-8 py-10 text-center text-gray-400 font-medium">No users found.</td>
                    </tr>
                 ) : (
                    filteredUsers.map((user: any) => (
                       <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-8 py-6">
                             <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-600 border-2 border-white shadow-sm">
                                   {user.name?.charAt(0) || 'U'}
                                </div>
                                <div>
                                   <p className="font-bold text-gray-900">{user.name || 'Unknown'}</p>
                                   <p className="text-xs text-gray-400 font-medium flex items-center gap-1">
                                      <Mail className="w-3 h-3" /> {user.email}
                                   </p>
                                </div>
                             </div>
                          </td>
                          <td className="px-8 py-6 font-black text-emerald-600">{(user.balance || 0).toFixed(2)}€</td>
                          <td className="px-8 py-6">
                             <Badge variant={user.role === 'ADMIN' ? 'danger' : 'primary'}>
                                {user.role}
                             </Badge>
                          </td>
                          <td className="px-8 py-6 font-bold text-gray-400 text-xs">
                             {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-8 py-6">
                             <div className="flex items-center gap-2">
                                <button
                                   onClick={() => handleBalanceUpdate(user.id, 'add')}
                                   className="p-2 bg-gray-100 rounded-lg text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                                   title="Add Funds"
                                >
                                   <Plus className="w-4 h-4" />
                                </button>
                                <button
                                   onClick={() => handleBalanceUpdate(user.id, 'remove')}
                                   className="p-2 bg-gray-100 rounded-lg text-rose-600 hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                                   title="Remove Funds"
                                >
                                   <Trash2 className="w-4 h-4" />
                                </button>
                                <button
                                   onClick={() => handleImpersonate(user.id)}
                                   className="p-2 bg-gray-100 rounded-lg text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                   title="Login as User"
                                >
                                   <UserCheck className="w-4 h-4" />
                                </button>
                                <button
                                   onClick={() => handleEdit(user)}
                                   className="p-2 bg-gray-100 rounded-lg text-blue-400 hover:bg-blue-400 hover:text-white transition-all shadow-sm"
                                   title="Edit User"
                                >
                                   <Edit className="w-4 h-4" />
                                </button>
                                <button
                                   onClick={async () => {
                                      if(confirm('Delete user?')) {
                                         await api.delete(`/users/${user.id}`);
                                         fetchUsers();
                                      }
                                   }}
                                   className="p-2 bg-gray-100 rounded-lg text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                   title="Delete User"
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

export default UserManagement;
