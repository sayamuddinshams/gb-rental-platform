import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';

// CSS Base styling
import './index.css';

// Layouts
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Public Pages
import Home from './pages/public/Home';
import PropertyList from './pages/public/PropertyList';
import PropertyDetail from './pages/public/PropertyDetail';
import AuthPages from './pages/public/AuthPages';

// Tenant Portal Pages
import TenantDashboard from './pages/tenant/TenantDashboard';
import TenantBookings from './pages/tenant/TenantBookings';
import TenantMessages from './pages/tenant/TenantMessages';
import TenantProfile from './pages/tenant/TenantProfile';

// Owner Portal Pages
import OwnerDashboard from './pages/owner/OwnerDashboard';
import OwnerProperties from './pages/owner/OwnerProperties';
import OwnerBookings from './pages/owner/OwnerBookings';
import OwnerProfile from './pages/owner/OwnerProfile';

// Admin Portal Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminProperties from './pages/admin/AdminProperties';
import AdminReports from './pages/admin/AdminReports';
import AdminLogs from './pages/admin/AdminLogs';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <NotificationProvider>
          <AuthProvider>
            <Routes>
              
              {/* Public Routes under MainLayout wrapper */}
              <Route path="/" element={<MainLayout />}>
                <Route index element={<Home />} />
                <Route path="properties" element={<PropertyList />} />
                <Route path="properties/:id" element={<PropertyDetail />} />
                <Route path="login" element={<AuthPages />} />
              </Route>

              {/* Portal routes under role-secured DashboardLayout wrapper */}
              <Route path="/" element={<DashboardLayout />}>
                
                {/* Tenant Portal */}
                <Route path="tenant/dashboard" element={<TenantDashboard />} />
                <Route path="tenant/bookings" element={<TenantBookings />} />
                <Route path="tenant/messages" element={<TenantMessages />} />
                <Route path="tenant/profile" element={<TenantProfile />} />
                
                {/* Owner Portal */}
                <Route path="owner/dashboard" element={<OwnerDashboard />} />
                <Route path="owner/properties" element={<OwnerProperties />} />
                <Route path="owner/bookings" element={<OwnerBookings />} />
                <Route path="owner/profile" element={<OwnerProfile />} />

                {/* Admin Portal */}
                <Route path="admin/dashboard" element={<AdminDashboard />} />
                <Route path="admin/users" element={<AdminUsers />} />
                <Route path="admin/properties" element={<AdminProperties />} />
                <Route path="admin/reports" element={<AdminReports />} />
                <Route path="admin/logs" element={<AdminLogs />} />

              </Route>

              {/* Catch-all Redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />

            </Routes>
          </AuthProvider>
        </NotificationProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
