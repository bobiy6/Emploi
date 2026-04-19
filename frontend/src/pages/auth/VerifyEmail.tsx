import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../api';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

const VerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');
    const token = searchParams.get('token');
    const navigate = useNavigate();

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('Token de vérification manquant.');
            return;
        }

        const verify = async () => {
            try {
                await api.post('/auth/verify-email', { token });
                setStatus('success');
                setTimeout(() => navigate('/login'), 3000);
            } catch (err: any) {
                setStatus('error');
                setMessage(err.response?.data?.message || 'La vérification a échoué.');
            }
        };

        verify();
    }, [token, navigate]);

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
            <div className="bg-slate-900 border border-slate-800 p-10 rounded-2xl shadow-2xl max-w-md w-full text-center">
                {status === 'loading' && (
                    <div className="space-y-4">
                        <Loader2 className="w-16 h-16 text-blue-500 animate-spin mx-auto" />
                        <h1 className="text-2xl font-bold text-white">Vérification de votre email...</h1>
                    </div>
                )}

                {status === 'success' && (
                    <div className="space-y-4">
                        <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                        <h1 className="text-2xl font-bold text-white">Email vérifié !</h1>
                        <p className="text-slate-400">Votre compte est maintenant actif. Redirection vers la page de connexion...</p>
                    </div>
                )}

                {status === 'error' && (
                    <div className="space-y-4">
                        <XCircle className="w-16 h-16 text-red-500 mx-auto" />
                        <h1 className="text-2xl font-bold text-white">Erreur de vérification</h1>
                        <p className="text-slate-400">{message}</p>
                        <button
                            onClick={() => navigate('/login')}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
                        >
                            Retour à la connexion
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VerifyEmail;
