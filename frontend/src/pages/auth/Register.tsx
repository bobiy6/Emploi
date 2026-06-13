import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { useAuth } from '../../hooks/useAuth';
import api from '../../api';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isCompany, setIsCompany] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [vatNumber, setVatNumber] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const payload = {
        name,
        email: email.toLowerCase().trim(),
        password,
        isCompany,
        companyName: isCompany ? companyName : null,
        vatNumber: isCompany ? vatNumber : null
    };

    console.log('[DEBUG] Registering with payload:', payload);

    try {
      const res = await api({
        method: 'POST',
        url: '/auth/register',
        data: payload
      });
      login(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#f8fafc]">
      {/* Left side: Branding (Hidden on mobile) */}
      <div className="hidden md:flex md:w-1/2 bg-[#001747] relative overflow-hidden items-center justify-center p-12">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-[#0050d7] rounded-full filter blur-[150px] opacity-20"></div>

        <div className="relative z-10 max-w-lg text-center">
          <div className="w-20 h-20 bg-white/10 backdrop-blur-xl rounded-3xl flex items-center justify-center mx-auto mb-8 border border-white/20">
            <span className="text-4xl font-black text-white italic">IX</span>
          </div>
          <h1 className="text-5xl font-black text-white mb-6 leading-tight tracking-tight">
            Rejoignez le futur du <span className="text-blue-400">Cloud</span>.
          </h1>
          <p className="text-xl text-blue-100/70 font-light leading-relaxed mb-10">
            Créez votre compte en quelques secondes et déployez votre infrastructure mondiale aujourd'hui.
          </p>

          <div className="space-y-6">
            <div className="flex items-start gap-4 text-left p-6 bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10">
              <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor font-bold"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">Déploiement Instantané</h3>
                <p className="text-blue-100/60 text-sm">Vos serveurs sont prêts en moins de 60 secondes.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 text-left p-6 bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10">
              <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor font-bold"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">Facturation Flexible</h3>
                <p className="text-blue-100/60 text-sm">Payez uniquement ce que vous utilisez avec notre système de crédits.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side: Register Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 overflow-y-auto">
        <div className="w-full max-w-md space-y-8 py-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div>
            <h2 className="text-4xl font-black text-[#001747] tracking-tight mb-3">Créer un compte</h2>
            <p className="text-gray-500 font-medium">Commencez votre expérience Infralyonix dès maintenant.</p>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-xl text-sm font-bold">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-[#001747] uppercase tracking-widest ml-1">Nom Complet</label>
              <Input
                placeholder="Ex: Jean Dupont"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-14 border-gray-200 bg-white rounded-2xl"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black text-[#001747] uppercase tracking-widest ml-1">Adresse Email</label>
              <Input
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-14 border-gray-200 bg-white rounded-2xl"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black text-[#001747] uppercase tracking-widest ml-1">Mot de passe</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-14 border-gray-200 bg-white rounded-2xl"
              />
            </div>

            <div className="p-5 bg-blue-50/50 rounded-3xl border border-blue-100/50 space-y-4">
              <div className="flex items-center gap-3">
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    id="isCompany"
                    className="w-6 h-6 rounded-lg border-gray-300 text-[#0050d7] focus:ring-[#0050d7] cursor-pointer appearance-none checked:bg-[#0050d7] transition-all border-2"
                    checked={isCompany}
                    onChange={e => setIsCompany(e.target.checked)}
                  />
                  {isCompany && (
                    <svg className="w-4 h-4 text-white absolute left-1 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}><path d="M5 13l4 4L19 7" /></svg>
                  )}
                </div>
                <label htmlFor="isCompany" className="text-sm font-black text-[#001747] cursor-pointer">Je représente une entreprise</label>
              </div>

              {isCompany && (
                <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
                  <Input
                    label="Nom de l'entreprise"
                    value={companyName}
                    onChange={e => setCompanyName(e.target.value)}
                    required
                    className="h-12 border-blue-100"
                  />
                  <Input
                    label="Numéro de TVA"
                    placeholder="Ex: BE0123456789"
                    value={vatNumber}
                    onChange={e => setVatNumber(e.target.value)}
                    required
                    className="h-12 border-blue-100"
                  />
                </div>
              )}
            </div>

            <div className="text-xs text-gray-400 font-medium px-2 leading-relaxed">
              En créant un compte, vous acceptez nos <Link to="/terms" disable-link="true" className="text-blue-600 font-bold underline">Conditions d'Utilisation</Link> et notre <Link to="/privacy" disable-link="true" className="text-blue-600 font-bold underline">Politique de Confidentialité</Link>.
            </div>

            <Button
              type="submit"
              className="w-full h-14 bg-gradient-to-r from-[#0050d7] to-[#0037a5] hover:shadow-xl hover:shadow-blue-200 transition-all duration-300 rounded-2xl text-lg font-bold mt-2"
              isLoading={loading}
            >
              Créer mon compte
            </Button>
          </form>

          <div className="pt-6 text-center border-t border-gray-100">
            <p className="text-gray-500 font-medium">
              Déjà membre ?{' '}
              <Link to="/login" className="text-blue-600 font-black hover:text-[#001747] transition-colors">
                Connectez-vous ici
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
