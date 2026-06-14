import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { useAuth } from '../../hooks/useAuth';
import api from '../../api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const payload = {
        email: email.toLowerCase().trim(),
        password
    };

    console.log('[DEBUG] Logging in with payload:', payload);

    try {
      const res = await api({
        method: 'POST',
        url: '/auth/login',
        data: payload
      });
      login(res.data.token, res.data.user);

      // Give state a moment to update
      setTimeout(() => {
        navigate(res.data.user.role === 'ADMIN' || res.data.user.role === 'SUPPORT' ? '/admin' : '/dashboard');
      }, 100);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#f8fafc]">
      {/* Left side: Branding/Decoration (Hidden on mobile) */}
      <div className="hidden md:flex md:w-1/2 bg-[#001747] relative overflow-hidden items-center justify-center p-12">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#0050d7] rounded-full filter blur-[120px] opacity-20 animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-[#0050d7] rounded-full filter blur-[100px] opacity-10"></div>

        <div className="relative z-10 max-w-lg text-center">
          <div className="w-20 h-20 bg-white/10 backdrop-blur-xl rounded-3xl flex items-center justify-center mx-auto mb-8 border border-white/20 shadow-2xl">
            <span className="text-4xl font-black text-white italic">IX</span>
          </div>
          <h1 className="text-5xl font-black text-white mb-6 leading-tight tracking-tight">
            Propulsez vos projets vers <span className="text-blue-400">l'excellence</span>.
          </h1>
          <p className="text-xl text-blue-100/70 font-light leading-relaxed">
            Une infrastructure haute performance conçue pour les développeurs et les entreprises ambitieuses.
          </p>

          <div className="mt-12 flex items-center justify-center gap-8 text-white/50 text-sm font-medium">
            <div className="flex flex-col items-center gap-2">
              <span className="text-white text-2xl font-bold">99.9%</span>
              <span>Uptime</span>
            </div>
            <div className="w-px h-8 bg-white/10"></div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-white text-2xl font-bold">NVMe</span>
              <span>Storage</span>
            </div>
            <div className="w-px h-8 bg-white/10"></div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-white text-2xl font-bold">24/7</span>
              <span>Support</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side: Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="md:hidden text-center mb-12">
             <div className="w-16 h-16 bg-[#001747] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-black text-white italic">IX</span>
             </div>
             <h2 className="text-2xl font-bold text-[#001747]">Infralyonix</h2>
          </div>

          <div>
            <h2 className="text-4xl font-black text-[#001747] tracking-tight mb-3">Ravi de vous revoir !</h2>
            <p className="text-gray-500 font-medium">Accédez à votre espace de gestion Infralyonix.</p>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-xl text-sm font-bold flex items-center gap-3">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-[#001747] uppercase tracking-widest ml-1">Adresse Email</label>
              <Input
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-14 border-gray-200 bg-white shadow-sm focus:ring-[#0050d7] focus:border-[#0050d7] rounded-2xl"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-black text-[#001747] uppercase tracking-widest">Mot de passe</label>
                <Link to="/forgot-password" className="text-xs font-bold text-blue-600 hover:text-blue-700">
                  Oublié ?
                </Link>
              </div>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-14 border-gray-200 bg-white shadow-sm focus:ring-[#0050d7] focus:border-[#0050d7] rounded-2xl"
              />
            </div>

            <div className="flex items-center gap-2 py-2">
              <input type="checkbox" id="remember" className="w-4 h-4 rounded border-gray-300 text-[#0050d7] focus:ring-[#0050d7]" />
              <label htmlFor="remember" className="text-sm font-bold text-gray-600 cursor-pointer">Rester connecté</label>
            </div>

            <Button
              type="submit"
              className="w-full h-14 bg-gradient-to-r from-[#0050d7] to-[#0037a5] hover:shadow-lg hover:shadow-blue-200 transition-all duration-300 rounded-2xl text-lg font-bold"
              isLoading={loading}
            >
              Se connecter
            </Button>
          </form>

          <div className="pt-6 text-center border-t border-gray-100">
            <p className="text-gray-500 font-medium">
              Pas encore de compte ?{' '}
              <Link to="/register" className="text-[#0050d7] font-black hover:text-[#001747] transition-colors">
                Rejoignez-nous maintenant
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
