import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import api from '../../api';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setError('');
    setMessage('');
    setLoading(true);

    try {
      const res = await api.post('/auth/reset-password', { token, password });
      setMessage(res.data.message);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#f8fafc]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600">Jeton manquant</h2>
          <p className="text-gray-500 mt-2">Le lien de réinitialisation est invalide.</p>
          <Link to="/login" className="mt-4 inline-block text-blue-600 font-bold">Retour à la connexion</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#f8fafc]">
      <div className="hidden md:flex md:w-1/2 bg-[#001747] relative overflow-hidden items-center justify-center p-12">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#0050d7] rounded-full filter blur-[120px] opacity-20"></div>
        <div className="relative z-10 max-w-lg text-center">
          <div className="w-20 h-20 bg-white/10 backdrop-blur-xl rounded-3xl flex items-center justify-center mx-auto mb-8 border border-white/20 shadow-2xl">
            <span className="text-4xl font-black text-white italic">IX</span>
          </div>
          <h1 className="text-5xl font-black text-white mb-6 leading-tight tracking-tight">
            Nouveau <span className="text-blue-400">Départ</span>.
          </h1>
          <p className="text-xl text-blue-100/70 font-light leading-relaxed">
            Choisissez un mot de passe robuste pour protéger vos données.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div>
            <h2 className="text-4xl font-black text-[#001747] tracking-tight mb-3">Réinitialisation</h2>
            <p className="text-gray-500 font-medium">Définissez votre nouveau mot de passe.</p>
          </div>

          {message && (
            <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-xl text-sm font-bold flex items-center gap-3">
              {message}
            </div>
          )}

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-xl text-sm font-bold flex items-center gap-3">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-[#001747] uppercase tracking-widest ml-1">Nouveau mot de passe</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-14 border-gray-200 bg-white shadow-sm focus:ring-[#0050d7] focus:border-[#0050d7] rounded-2xl"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-[#001747] uppercase tracking-widest ml-1">Confirmer le mot de passe</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="h-14 border-gray-200 bg-white shadow-sm focus:ring-[#0050d7] focus:border-[#0050d7] rounded-2xl"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-14 bg-gradient-to-r from-[#0050d7] to-[#0037a5] hover:shadow-lg hover:shadow-blue-200 transition-all duration-300 rounded-2xl text-lg font-bold"
              isLoading={loading}
            >
              Enregistrer le mot de passe
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
