import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Unsubscribe from './pages/auth/Unsubscribe';
import ClientLayout from './layouts/ClientLayout';
import Dashboard from './pages/client/Dashboard';
import Store from './pages/client/Store';
import Services from './pages/client/Services';
import Billing from './pages/client/Billing';
import Support from './pages/client/Support';
import Settings from './pages/client/Settings';
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import ProductCatalog from './pages/admin/ProductCatalog';
import CategoryManagement from './pages/admin/CategoryManagement';
import OrderManagement from './pages/admin/OrderManagement';
import AdminServiceManagement from './pages/admin/ServiceManagement';
import AdminTicketManagement from './pages/admin/TicketManagement';
import ModuleSettings from './pages/admin/ModuleSettings';
import Accounting from './pages/admin/Accounting';
import Infrastructure from './pages/admin/Infrastructure';
import LogViewer from './pages/admin/LogViewer';
import DatabaseManager from './pages/admin/DatabaseManager';
import EmailManager from './pages/admin/EmailManager';
import { AdminGuard } from './components/AdminGuard';
import { AuthGuard } from './components/AuthGuard';
import { AuthProvider } from './hooks/useAuth';

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unsubscribe" element={<Unsubscribe />} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={<AuthGuard><ClientLayout><Dashboard /></ClientLayout></AuthGuard>} />
          <Route path="/services" element={<AuthGuard><ClientLayout><Services /></ClientLayout></AuthGuard>} />
          <Route path="/store" element={<AuthGuard><ClientLayout><Store /></ClientLayout></AuthGuard>} />
          <Route path="/billing" element={<AuthGuard><ClientLayout><Billing /></ClientLayout></AuthGuard>} />
          <Route path="/support" element={<AuthGuard><ClientLayout><Support /></ClientLayout></AuthGuard>} />
          <Route path="/settings" element={<AuthGuard><ClientLayout><Settings /></ClientLayout></AuthGuard>} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminGuard><AdminLayout><AdminDashboard /></AdminLayout></AdminGuard>} />
          <Route path="/admin/users" element={<AdminGuard><AdminLayout><UserManagement /></AdminLayout></AdminGuard>} />
          <Route path="/admin/products" element={<AdminGuard><AdminLayout><ProductCatalog /></AdminLayout></AdminGuard>} />
          <Route path="/admin/categories" element={<AdminGuard><AdminLayout><CategoryManagement /></AdminLayout></AdminGuard>} />
          <Route path="/admin/orders" element={<AdminGuard><AdminLayout><OrderManagement /></AdminLayout></AdminGuard>} />
          <Route path="/admin/services" element={<AdminGuard><AdminLayout><AdminServiceManagement /></AdminLayout></AdminGuard>} />
          <Route path="/admin/tickets" element={<AdminGuard><AdminLayout><AdminTicketManagement /></AdminLayout></AdminGuard>} />
          <Route path="/admin/accounting" element={<AdminGuard><AdminLayout><Accounting /></AdminLayout></AdminGuard>} />
          <Route path="/admin/infrastructure" element={<AdminGuard><AdminLayout><Infrastructure /></AdminLayout></AdminGuard>} />
          <Route path="/admin/logs" element={<AdminGuard><AdminLayout><LogViewer /></AdminLayout></AdminGuard>} />
          <Route path="/admin/db" element={<AdminGuard><AdminLayout><DatabaseManager /></AdminLayout></AdminGuard>} />
          <Route path="/admin/email" element={<AdminGuard><AdminLayout><EmailManager /></AdminLayout></AdminGuard>} />
          <Route path="/admin/settings" element={<AdminGuard><AdminLayout><ModuleSettings /></AdminLayout></AdminGuard>} />

          {/* Redirects */}
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
