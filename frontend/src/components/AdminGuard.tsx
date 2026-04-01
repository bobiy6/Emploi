import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const AdminGuard = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;

  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPPORT')) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
