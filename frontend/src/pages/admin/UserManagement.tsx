import React, { useEffect, useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Users, Mail, DollarSign, LogIn, Edit, Search, UserCheck } from 'lucide-react';
import api from '../../api';
import { useNavigate } from 'react-router-dom';

const UserManagement = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get('/users');
        setUsers(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUsers();
  }, []);

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

  const handleAddBalance = async (userId: number) => {
    const amount = prompt('Enter amount to add:');
    if (!amount) return;
    try {
      await api.post(`/users/${userId}/balance`, { amount: parseFloat(amount) });
      alert('Balance updated');
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Update failed');
    }
  };

  const filteredUsers = users.filter(u => u.email.toLowerCase().includes(search.toLowerCase()) || u.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between gap-4 md:items-center">
        <h2 className="text-3xl font-black text-gray-900">User Management</h2>
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
                                   {user.name.charAt(0)}
                                </div>
                                <div>
                                   <p className="font-bold text-gray-900">{user.name}</p>
                                   <p className="text-xs text-gray-400 font-medium flex items-center gap-1">
                                      <Mail className="w-3 h-3" /> {user.email}
                                   </p>
                                </div>
                             </div>
                          </td>
                          <td className="px-8 py-6 font-black text-emerald-600">{user.balance.toFixed(2)}€</td>
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
                                   onClick={() => handleAddBalance(user.id)}
                                   className="p-2 bg-gray-100 rounded-lg text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                                   title="Add Balance"
                                >
                                   <DollarSign className="w-4 h-4" />
                                </button>
                                <button
                                   onClick={() => handleImpersonate(user.id)}
                                   className="p-2 bg-gray-100 rounded-lg text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                   title="Login as User"
                                >
                                   <UserCheck className="w-4 h-4" />
                                </button>
                                <button
                                   className="p-2 bg-gray-100 rounded-lg text-gray-600 hover:bg-gray-800 hover:text-white transition-all shadow-sm"
                                   title="Edit User"
                                >
                                   <Edit className="w-4 h-4" />
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
