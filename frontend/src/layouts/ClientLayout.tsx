import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Server, CreditCard, LifeBuoy, ShoppingCart, LogOut, Settings, User, LogIn } from 'lucide-react';
import { cn } from '../utils/cn';
import { useAuth } from '../hooks/useAuth';

const SidebarItem = ({ icon: Icon, label, to, active }: any) => (
  <Link
    to={to}
    className={cn(
      'flex items-center gap-3 px-6 py-4 rounded-2xl transition-all duration-300 group font-bold',
      active
        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-500/20 scale-[1.02]'
        : 'text-gray-500 hover:bg-white hover:text-blue-600 hover:shadow-lg hover:shadow-gray-200/50'
    )}
  >
    <Icon className={cn('w-5 h-5', active ? 'text-white' : 'group-hover:text-blue-600')} />
    {label}
  </Link>
);

const ClientLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    sessionStorage.removeItem('adminToken');
    sessionStorage.removeItem('adminName');
    navigate('/login');
  };

  const handleReturnToAdmin = () => {
    const adminToken = sessionStorage.getItem('adminToken');
    if (adminToken) {
      localStorage.setItem('token', adminToken);
      sessionStorage.removeItem('adminToken');
      sessionStorage.removeItem('adminName');
      navigate('/admin');
      window.location.reload();
    }
  };

  const adminName = sessionStorage.getItem('adminName');

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', to: '/dashboard' },
    { icon: Server, label: 'My Services', to: '/services' },
    { icon: ShoppingCart, label: 'Store', to: '/store' },
    { icon: CreditCard, label: 'Billing', to: '/billing' },
    { icon: LifeBuoy, label: 'Support', to: '/support' },
  ];

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* Sidebar */}
      <aside className="w-80 border-r border-gray-100 bg-white/70 backdrop-blur-xl p-8 flex flex-col fixed h-full z-10">
        <div className="flex items-center gap-4 mb-12 px-2">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
             <Server className="text-white w-6 h-6" />
          </div>
          <span className="text-2xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent tracking-tight">
            Infralyonix
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
          <SidebarItem icon={Settings} label="Settings" to="/settings" active={location.pathname === '/settings'} />
        </nav>

        <div className="mt-auto space-y-4 pt-6 border-t border-gray-200">
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
        {adminName && (
           <div className="bg-rose-600 text-white px-10 py-3 text-sm font-black flex items-center justify-between shadow-xl sticky top-0 z-50 animate-pulse">
              <div className="flex items-center gap-2 uppercase tracking-widest">
                 <User className="w-4 h-4" /> Logged in as {user?.name} (Impersonation Mode)
              </div>
              <button
                onClick={handleReturnToAdmin}
                className="bg-white text-rose-600 px-4 py-1 rounded-lg flex items-center gap-2 hover:bg-rose-50 transition-all"
              >
                <LogIn className="w-4 h-4" /> Return to {adminName}
              </button>
           </div>
        )}
        <header className="h-24 bg-white/70 backdrop-blur-xl border-b border-gray-100 px-12 flex items-center justify-between sticky top-0 z-20">
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">
             {menuItems.find(m => m.to === location.pathname)?.label || 'Overview'}
          </h2>
          <div className="flex items-center gap-4">
             <div className="text-right mr-2">
                <p className="text-sm font-bold text-gray-900">{user?.name || 'Loading...'}</p>
                <p className="text-xs text-gray-500">Credit: {user?.balance?.toFixed(2) || '0.00'}€</p>
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
