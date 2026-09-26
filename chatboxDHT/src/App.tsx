import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { DashboardLayout } from './layout/DashboardLayout';
import { PricingPage } from './pages/PricingPage';
import WidgetPage from './pages/WidgetPage';
import { LandingPage } from './pages/index';
import { LoginPage } from './pages/login/LoginPage';
import { LogoutPage } from './pages/logout/LogoutPage';
import { SignupPage } from './pages/signup/SignupPage';
import { ForgotPasswordPage } from './pages/forget-password/ForgotPasswordPage';

import { InboxPage } from './pages/dashboard/InboxPage';
import { BotBuilderPage } from './pages/dashboard/BotBuilderPage';
import { KnowledgeBasePage } from './pages/dashboard/KnowledgeBasePage';
import { IntegrationsPage } from './pages/dashboard/IntegrationsPage';
import { AnalyticsPage } from './pages/dashboard/AnalyticsPage';
import { AccountManagementPage } from './pages/dashboard/AccountManagementPage';
import { UserPortalPage } from './pages/UserPortalPage';
import { UserProfilePage } from './pages/UserProfilePage';
import { UserProfile } from './types';

// Component Bảo vệ Route & Phân quyền nâng cao
const ProtectedRoute: React.FC<{ 
  children: React.ReactNode; 
  allowedRoles?: string[];
  adminOnly?: boolean;
}> = ({
  children,
  allowedRoles,
  adminOnly = false
}) => {
  const token = localStorage.getItem('token');
  const savedUser = localStorage.getItem('user');
  let user: UserProfile | null = null;

  try {
    user = savedUser ? (JSON.parse(savedUser) as UserProfile) : null;
  } catch {
    localStorage.removeItem('user');
  }

  // 1. Chưa đăng nhập -> Đẩy về trang Login
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // 2. Nếu là tài khoản 'user' cố truy cập vào phân vùng Dashboard Admin -> Đẩy về /portal
  if (user.role === 'user' && !allowedRoles?.includes('user')) {
    return <Navigate to="/portal" replace />;
  }

  // 3. Nếu là Admin/Agent cố truy cập trang /portal của User -> Đẩy về /dashboard/inbox
  if (user.role !== 'user' && allowedRoles?.includes('user') && allowedRoles.length === 1) {
    return <Navigate to="/dashboard/inbox" replace />;
  }

  // 4. Kiểm tra quyền Admin dành riêng cho các trang cấu hình hệ thống
  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/dashboard/inbox" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Pages */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/widget" element={<WidgetPage />} />
          <Route path="/customer" element={<WidgetPage />} />
          <Route path="/chat" element={<WidgetPage />} />

          {/* Auth Pages */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/logout" element={<LogoutPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forget-password" element={<ForgotPasswordPage />} />

          {/* Dashboard Main Redirect */}
          <Route path="/dashboard" element={<Navigate to="/dashboard/inbox" replace />} />

          {/* ========================================== */}
          {/* PHÂN VÙNG 1: DÀNH RIÊNG CHO USER PORTAL    */}
          {/* ========================================== */}
          <Route
            path="/portal"
            element={
              <ProtectedRoute allowedRoles={['user']}>
                <UserPortalPage />
              </ProtectedRoute>
            }
          />

          {/* ========================================== */}
          {/* PHÂN VÙNG 2: DÀNH RIÊNG CHO ADMIN & CSKH   */}
          {/* ========================================== */}
          <Route
            path="/dashboard/inbox"
            element={
              <ProtectedRoute allowedRoles={['admin', 'agent', 'supervisor']}>
                <DashboardLayout><InboxPage /></DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/bot-builder"
            element={
              <ProtectedRoute allowedRoles={['admin']} adminOnly>
                <DashboardLayout><BotBuilderPage /></DashboardLayout>
              </ProtectedRoute>
            }

          />
          <Route
            path="/dashboard/knowledge"
            element={
              <ProtectedRoute allowedRoles={['admin']} adminOnly>
                <DashboardLayout><KnowledgeBasePage /></DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/integrations"
            element={
              <ProtectedRoute allowedRoles={['admin']} adminOnly>
                <DashboardLayout><IntegrationsPage /></DashboardLayout>
              </ProtectedRoute>
            }
            
          />
          <Route 
            path="/pricing" 
            element={
              <ProtectedRoute allowedRoles={['user', 'admin', 'agent', 'supervisor']}>
                <PricingPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute allowedRoles={['user', 'admin', 'agent', 'supervisor']}>
                <UserProfilePage />
              </ProtectedRoute>
            } 
          />
          <Route
            path="/dashboard/analytics"
            element={
              <ProtectedRoute allowedRoles={['admin']} adminOnly>
                <DashboardLayout><AnalyticsPage /></DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/accounts"
            element={
              <ProtectedRoute allowedRoles={['admin']} adminOnly>
                <DashboardLayout><AccountManagementPage /></DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
};

export default App;