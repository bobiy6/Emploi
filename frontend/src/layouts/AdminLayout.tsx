import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, User, ShoppingBag, FolderTree, ClipboardList, ShieldAlert, LifeBuoy, LogOut, Settings, BarChart3, HardDrive, Plus, Trash2, Edit, Search, UserCheck, Power, Terminal, Database, Mail } from 'lucide-react';
import { cn } from '../utils/cn';
import { Badge } from '../components/ui/Badge';
import { useAuth } from '../hooks/useAuth';

const SidebarItem = ({ icon: Icon, label, to, active }: any) => (
  <Link
    to={to}
    className={cn(
      'flex items-center gap-3 px-6 py-4 rounded-2xl transition-all duration-300 group font-bold',
      active
        ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-xl shadow-rose-500/20 scale-[1.02]'
        : 'text-gray-500 hover:bg-white hover:text-rose-600 hover:shadow-lg hover:shadow-gray-200/50'
    )}
  >
    <Icon className={cn('w-5 h-5', active ? 'text-white' : 'group-hover:text-rose-600')} />
    {label}
  </Link>
);

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const isSupport = user?.role === 'SUPPORT';

  const menuItems = [
    { icon: LayoutDashboard, label: 'Stats Overview', to: '/admin', hide: false },
    { icon: Users, label: 'User Management', to: '/admin/users', hide: isSupport },
    { icon: FolderTree, label: 'Categories', to: '/admin/categories', hide: isSupport },
    { icon: ShoppingBag, label: 'Product List', to: '/admin/products', hide: isSupport },
    { icon: ClipboardList, label: 'Order List', to: '/admin/orders', hide: isSupport },
    { icon: ShieldAlert, label: 'Active Services', to: '/admin/services', hide: isSupport },
    { icon: LifeBuoy, label: 'Support Tickets', to: '/admin/tickets', hide: false },
    { icon: BarChart3, label: 'Accounting', to: '/admin/accounting', hide: isSupport },
    { icon: HardDrive, label: 'Infrastructure', to: '/admin/infrastructure', hide: isSupport },
    { icon: Terminal, label: 'System Logs', to: '/admin/logs', hide: isSupport },
    { icon: Database, label: 'Database Access', to: '/admin/db', hide: isSupport },
    {icon: Mail, label: 'Email Management', to: '/admin/email', hide: isSupport },
    { icon: Settings, label: 'Module Settings', to: '/admin/settings', hide: isSupport },
  ].filter(item => !item.hide);

  return (
    <div className="flex min-h-screen bg-[#FDF2F2]">
      {/* Sidebar */}
      <aside className="w-80 border-r border-rose-100 bg-white/70 backdrop-blur-xl p-8 flex flex-col fixed h-full z-10">
        <div className="flex items-center gap-4 mb-12 px-2">
          <div className="w-12 h-12 bg-gradient-to-br from-rose-600 to-pink-700 rounded-2xl flex items-center justify-center shadow-lg shadow-rose-500/20">
             <ShieldAlert className="text-white w-6 h-6" />
          </div>
          <span className="text-2xl font-black bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent tracking-tight">
            AdminPanel
          </span>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <SidebarItem
              key={item.to}
              {...item}
              active={location.pathname === item.to}
            />
          ))}
        </nav>

        <div className="mt-auto space-y-4 pt-6 border-t border-gray-200">
           <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl text-blue-600 hover:bg-blue-50 transition-all duration-200 w-full font-medium">
             <BarChart3 className="w-5 h-5" />
             Client Area
           </Link>
           <button
             onClick={handleLogout}
             className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all duration-200 w-full font-medium"
           >
             <LogOut className="w-5 h-5" />
             Sign Out
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-80">
        <header className="h-24 bg-white/70 backdrop-blur-xl border-b border-rose-100 px-12 flex items-center justify-between sticky top-0 z-20">
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">
             {menuItems.find(m => m.to === location.pathname)?.label || 'Administration'}
          </h2>
          <div className="flex items-center gap-4">
             <Badge variant="danger" className="font-black tracking-widest text-[10px] uppercase">
                {user?.role === 'ADMIN' ? 'FULL ADMINISTRATOR' : 'SUPPORT AGENT'}
             </Badge>
          </div>
        </header>

        <div className="p-10 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
