import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Server, CreditCard, LifeBuoy, ShoppingCart, LogOut, Settings, User } from 'lucide-react';
import { cn } from '../utils/cn';

const SidebarItem = ({ icon: Icon, label, to, active }: any) => (
  <Link
    to={to}
    className={cn(
      'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group font-medium',
      active
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
        : 'text-gray-500 hover:bg-white hover:text-blue-600'
    )}
  >
    <Icon className={cn('w-5 h-5', active ? 'text-white' : 'group-hover:text-blue-600')} />
    {label}
  </Link>
);

const ClientLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', to: '/dashboard' },
    { icon: Server, label: 'My Services', to: '/services' },
    { icon: ShoppingCart, label: 'Store', to: '/store' },
    { icon: CreditCard, label: 'Billing', to: '/billing' },
    { icon: LifeBuoy, label: 'Support', to: '/support' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-72 border-r border-gray-200 bg-gray-50/80 backdrop-blur-md p-6 flex flex-col fixed h-full z-10">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
             <Server className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            HostDash
          </span>
        </div>

        <nav className="flex-1 space-y-2">
          {menuItems.map((item) => (
            <SidebarItem
              key={item.to}
              {...item}
              active={location.pathname === item.to}
            />
          ))}
        </nav>

        <div className="mt-auto space-y-4 pt-6 border-t border-gray-200">
           <SidebarItem icon={Settings} label="Settings" to="/settings" active={location.pathname === '/settings'} />
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
             {menuItems.find(m => m.to === location.pathname)?.label || 'Overview'}
          </h2>
          <div className="flex items-center gap-4">
             <div className="text-right mr-2">
                <p className="text-sm font-bold text-gray-900">User Profile</p>
                <p className="text-xs text-gray-500">Credit: 15.00€</p>
             </div>
             <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center border-2 border-white shadow-sm">
                <User className="text-blue-600 w-5 h-5" />
             </div>
          </div>
        </header>

        <div className="p-10 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default ClientLayout;
