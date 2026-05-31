import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Server, CreditCard, LifeBuoy, ShoppingCart, LogOut, Settings, User, LogIn } from 'lucide-react';
import { cn } from '../utils/cn';
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

  return (
    <div className="flex min-h-screen bg-[#f5f7fa]">
      {/* Sidebar */}
      <aside className="w-64 bg-[#001747] flex flex-col fixed h-full z-30 shadow-2xl">
        <div className="p-6 mb-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#0050d7] rounded flex items-center justify-center shadow-lg shadow-blue-500/20">
               <Server className="text-white w-5 h-5" />
            </div>
            <span className="text-lg font-black text-white tracking-tight">
              Infralyonix
            </span>
          </div>
        </div>

        <nav className="flex-1 px-4 overflow-y-auto scrollbar-hide">
          <NavSection title="Services">
            <SidebarItem icon={LayoutDashboard} label="Dashboard" to="/dashboard" active={location.pathname === '/dashboard'} />
            <SidebarItem icon={Server} label="My Services" to="/services" active={location.pathname === '/services'} />
            <SidebarItem icon={ShoppingCart} label="Store" to="/store" active={location.pathname === '/store'} />
          </NavSection>

          <NavSection title="Billing">
            <SidebarItem icon={CreditCard} label="Billing" to="/billing" active={location.pathname === '/billing'} />
          </NavSection>

          <NavSection title="Support">
            <SidebarItem icon={LifeBuoy} label="Support" to="/support" active={location.pathname === '/support'} />
          </NavSection>

          <NavSection title="Account">
            <SidebarItem icon={Settings} label="Settings" to="/settings" active={location.pathname === '/settings'} />
          </NavSection>
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
      <main className="flex-1 ml-64">
        {adminName && (
           <div className="bg-rose-600 text-white px-8 py-2 text-xs font-black flex items-center justify-between shadow-xl sticky top-0 z-50 animate-pulse">
              <div className="flex items-center gap-2 uppercase tracking-widest">
                 <User className="w-3 h-3" /> Logged in as {user?.name} (Impersonation)
              </div>
              <button
                onClick={handleReturnToAdmin}
                className="bg-white text-rose-600 px-3 py-1 rounded text-[10px] flex items-center gap-1 hover:bg-rose-50 transition-all uppercase"
              >
                <LogIn className="w-3 h-3" /> Back to Admin
              </button>
           </div>
        )}
        <header className="h-16 bg-white border-b border-gray-200 px-8 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest">
               Client Area
            </h2>
          </div>
          <div className="flex items-center gap-6">
             <div className="text-right">
                <p className="text-xs font-bold text-gray-900">{user?.name || 'Loading...'}</p>
                <p className="text-[10px] text-[#0050d7] font-bold uppercase tracking-wider">Credit: {user?.balance?.toFixed(2) || '0.00'}€</p>
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

export default ClientLayout;
