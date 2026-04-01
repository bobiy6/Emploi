import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ClientLayout from './layouts/ClientLayout';
import Dashboard from './pages/client/Dashboard';
import Store from './pages/client/Store';
import Services from './pages/client/Services';
import Billing from './pages/client/Billing';
import Support from './pages/client/Support';
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import ProductCatalog from './pages/admin/ProductCatalog';
import CategoryManagement from './pages/admin/CategoryManagement';
import OrderManagement from './pages/admin/OrderManagement';
import AdminServiceManagement from './pages/admin/ServiceManagement';
import AdminTicketManagement from './pages/admin/TicketManagement';

const App = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={<ClientLayout><Dashboard /></ClientLayout>} />
          <Route path="/services" element={<ClientLayout><Services /></ClientLayout>} />
          <Route path="/store" element={<ClientLayout><Store /></ClientLayout>} />
          <Route path="/billing" element={<ClientLayout><Billing /></ClientLayout>} />
          <Route path="/support" element={<ClientLayout><Support /></ClientLayout>} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
          <Route path="/admin/users" element={<AdminLayout><UserManagement /></AdminLayout>} />
          <Route path="/admin/products" element={<AdminLayout><ProductCatalog /></AdminLayout>} />
          <Route path="/admin/categories" element={<AdminLayout><CategoryManagement /></AdminLayout>} />
          <Route path="/admin/orders" element={<AdminLayout><OrderManagement /></AdminLayout>} />
          <Route path="/admin/services" element={<AdminLayout><AdminServiceManagement /></AdminLayout>} />
          <Route path="/admin/tickets" element={<AdminLayout><AdminTicketManagement /></AdminLayout>} />

          {/* Redirects */}
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default App;
