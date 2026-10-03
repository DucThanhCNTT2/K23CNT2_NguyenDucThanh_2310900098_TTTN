import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
import { ChannelCustomersPage } from './pages/dashboard/ChannelCustomersPage';
import { BotBuilderPage } from './pages/dashboard/BotBuilderPage';
import { KnowledgeBasePage } from './pages/dashboard/KnowledgeBasePage';
import { IntegrationsPage } from './pages/dashboard/IntegrationsPage';
import { AnalyticsPage } from './pages/dashboard/AnalyticsPage';
import { AccountManagementPage } from './pages/dashboard/AccountManagementPage';
import { UserPortalPage } from './pages/UserPortalPage';
import { UserProfilePage } from './pages/UserProfilePage';
import { OAuthCallbackPage } from './pages/OAuthCallbackPage';
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

const MotionEffects: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reducedMotion.matches || !('IntersectionObserver' in window)) return;

    document.documentElement.classList.add('motion-ready');
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -36px 0px' }
    );

    const observeReveals = (root: ParentNode) => {
      root.querySelectorAll('[data-reveal]:not(.is-visible)').forEach((element) => {
        revealObserver.observe(element);
      });
    };

    observeReveals(document);
    const mutations = new MutationObserver((records) => {
      records.forEach((record) => {
        record.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement) observeReveals(node);
        });
      });
    });
    mutations.observe(document.body, { childList: true, subtree: true });

    return () => {
      mutations.disconnect();
      revealObserver.disconnect();
      document.documentElement.classList.remove('motion-ready');
    };
  }, []);

  useEffect(() => {
    if (location.hash) return;
    const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
    window.scrollTo({ top: 0, behavior });
  }, [location.pathname, location.hash]);

  return null;
};

// Component con nằm bên trong BrowserRouter để sử dụng hook useLocation an toàn
const AppContent: React.FC = () => {
  const location = useLocation();

  return (
    <>
      <MotionEffects />
      <Routes>
        {/* Public Pages */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/widget" element={<WidgetPage />} />
        <Route path="/customer" element={<WidgetPage />} />
        <Route path="/chat" element={<WidgetPage />} />

        {/* Auth Pages */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/callback" element={<OAuthCallbackPage />} />
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
              <UserPortalPage key={location.pathname} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/portal/billing"
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <UserPortalPage key={location.pathname} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/portal/billing/report"
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <UserPortalPage key={location.pathname} />
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
          path="/dashboard/customers"
          element={
            <ProtectedRoute allowedRoles={['admin', 'agent', 'supervisor']}>
              <DashboardLayout><ChannelCustomersPage /></DashboardLayout>
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
    </>
  );
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AppProvider>
  );
};

export default App;