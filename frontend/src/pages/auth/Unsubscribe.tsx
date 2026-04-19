import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, XCircle, Mail, ArrowLeft } from 'lucide-react';

const Unsubscribe = () => {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const email = searchParams.get('email');

    useEffect(() => {
        if (!email) {
            setStatus('error');
            return;
        }

        const doUnsubscribe = async () => {
            try {
                await axios.post('/api/auth/unsubscribe', { email });
                setStatus('success');
            } catch (err) {
                setStatus('error');
            }
        };

        doUnsubscribe();
    }, [email]);

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
            <div className="bg-slate-900 border border-slate-800 p-10 rounded-2xl shadow-2xl max-w-md w-full text-center">
                <div className="flex justify-center mb-6">
                    <div className="p-4 bg-blue-500/10 rounded-full">
                        <Mail className="w-12 h-12 text-blue-500" />
                    </div>
                </div>

                {status === 'loading' && (
                    <div className="space-y-4">
                        <h1 className="text-2xl font-bold text-white">Désinscription en cours...</h1>
                        <p className="text-slate-400">Veuillez patienter pendant que nous mettons à jour vos préférences.</p>
                        <div className="flex justify-center mt-4">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        </div>
                    </div>
                )}

                {status === 'success' && (
                    <div className="space-y-4">
                        <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                        <h1 className="text-2xl font-bold text-white">C'est fait !</h1>
                        <p className="text-slate-400">Vous avez été désinscrit avec succès de nos emails marketing.</p>
                        <p className="text-slate-500 text-sm">Vous continuerez à recevoir les emails transactionnels (factures, support, etc.).</p>
                        <Link to="/login" className="inline-flex items-center gap-2 text-blue-500 hover:text-blue-400 font-medium pt-4">
                            <ArrowLeft className="w-4 h-4" /> Retour au site
                        </Link>
                    </div>
                )}

                {status === 'error' && (
                    <div className="space-y-4">
                        <XCircle className="w-16 h-16 text-red-500 mx-auto" />
                        <h1 className="text-2xl font-bold text-white">Une erreur est survenue</h1>
                        <p className="text-slate-400">Nous n'avons pas pu traiter votre demande de désinscription.</p>
                        <p className="text-slate-500 text-sm">Si le problème persiste, veuillez contacter notre support.</p>
                        <Link to="/login" className="inline-flex items-center gap-2 text-blue-500 hover:text-blue-400 font-medium pt-4">
                            <ArrowLeft className="w-4 h-4" /> Retour au site
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Unsubscribe;
