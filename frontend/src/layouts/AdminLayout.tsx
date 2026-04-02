import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, ShoppingBag, FolderTree, ClipboardList, ShieldAlert, LifeBuoy, LogOut, Settings, BarChart3, HardDrive, Plus, Trash2, Edit, Search, UserCheck, Power } from 'lucide-react';
import { cn } from '../utils/cn';
import { Badge } from '../components/ui/Badge';
import { useAuth } from '../hooks/useAuth';

const SidebarItem = ({ icon: Icon, label, to, active }: any) => (
  <Link
    to={to}
    className={cn(
      'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group font-medium',
      active
        ? 'bg-rose-600 text-white shadow-lg shadow-rose-200'
        : 'text-gray-500 hover:bg-white hover:text-rose-600'
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
    { icon: Settings, label: 'Module Settings', to: '/admin/settings', hide: isSupport },
  ].filter(item => !item.hide);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-72 border-r border-gray-200 bg-gray-50/80 backdrop-blur-md p-6 flex flex-col fixed h-full z-10">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 bg-rose-600 rounded-xl flex items-center justify-center">
             <ShieldAlert className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
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
      <main className="flex-1 ml-72">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-200 px-10 flex items-center justify-between sticky top-0 z-20">
          <h2 className="text-xl font-bold text-gray-800">
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
