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
      'flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 group text-sm font-medium',
      active
        ? 'bg-[#0050d7] text-white shadow-md'
        : 'text-gray-400 hover:text-white hover:bg-white/5'
    )}
  >
    <Icon className={cn('w-4 h-4 transition-colors', active ? 'text-white' : 'text-gray-400 group-hover:text-white')} />
    {label}
  </Link>
);

const NavSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-6">
    <h3 className="px-4 mb-2 text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">
      {title}
    </h3>
    <div className="space-y-1">{children}</div>
  </div>
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

  return (
    <div className="flex min-h-screen bg-[#f5f7fa]">
      {/* Sidebar */}
      <aside className="w-64 bg-[#001747] flex flex-col fixed h-full z-30 shadow-2xl">
        <div className="p-6 mb-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#0050d7] rounded flex items-center justify-center shadow-lg shadow-blue-500/20">
               <ShieldAlert className="text-white w-5 h-5" />
            </div>
            <span className="text-lg font-black text-white tracking-tight">
              Infralyonix <span className="text-[10px] text-blue-400 ml-1 font-bold">ADMIN</span>
            </span>
          </div>
        </div>

        <nav className="flex-1 px-4 overflow-y-auto scrollbar-hide">
          <NavSection title="Management">
            <SidebarItem icon={LayoutDashboard} label="Overview" to="/admin" active={location.pathname === '/admin'} />
            {!isSupport && <SidebarItem icon={Users} label="Users" to="/admin/users" active={location.pathname === '/admin/users'} />}
            {!isSupport && <SidebarItem icon={ShoppingBag} label="Products" to="/admin/products" active={location.pathname === '/admin/products'} />}
            {!isSupport && <SidebarItem icon={FolderTree} label="Categories" to="/admin/categories" active={location.pathname === '/admin/categories'} />}
            {!isSupport && <SidebarItem icon={ClipboardList} label="Orders" to="/admin/orders" active={location.pathname === '/admin/orders'} />}
          </NavSection>

          <NavSection title="Infrastructure">
            {!isSupport && <SidebarItem icon={HardDrive} label="Provisioning" to="/admin/infrastructure" active={location.pathname === '/admin/infrastructure'} />}
            <SidebarItem icon={ShieldAlert} label="Services" to="/admin/services" active={location.pathname === '/admin/services'} />
          </NavSection>

          <NavSection title="System">
            <SidebarItem icon={LifeBuoy} label="Tickets" to="/admin/tickets" active={location.pathname === '/admin/tickets'} />
            {!isSupport && <SidebarItem icon={Mail} label="Email Manager" to="/admin/email" active={location.pathname === '/admin/email'} />}
            {!isSupport && <SidebarItem icon={BarChart3} label="Accounting" to="/admin/accounting" active={location.pathname === '/admin/accounting'} />}
            {!isSupport && <SidebarItem icon={Terminal} label="System Logs" to="/admin/logs" active={location.pathname === '/admin/logs'} />}
          </NavSection>

          <NavSection title="Settings">
            {!isSupport && <SidebarItem icon={Database} label="Database" to="/admin/db" active={location.pathname === '/admin/db'} />}
            {!isSupport && <SidebarItem icon={Settings} label="Settings" to="/admin/settings" active={location.pathname === '/admin/settings'} />}
          </NavSection>
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
      <main className="flex-1 ml-64">
        <header className="h-16 bg-white border-b border-gray-200 px-8 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest">
               Admin Workspace
            </h2>
          </div>
          <div className="flex items-center gap-6">
             <div className="text-right">
                <p className="text-xs font-bold text-gray-900">{user?.name}</p>
                <p className="text-[10px] text-gray-500 font-medium">{user?.role}</p>
             </div>
             <button
               onClick={handleLogout}
               className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all"
             >
               <LogOut className="w-5 h-5" />
             </button>
          </div>
        </header>

        <div className="p-8 max-w-[1600px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
