import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { DashboardLayout } from './layout/DashboardLayout';

// Pages split as requested
import { LandingPage } from './pages/index';
import { LoginPage } from './pages/login/LoginPage';
import { LogoutPage } from './pages/logout/LogoutPage';
import { SignupPage } from './pages/signup/SignupPage';
import { ForgotPasswordPage } from './pages/forget-password/ForgotPasswordPage';

// Dashboard feature pages
import { InboxPage } from './pages/dashboard/InboxPage';
import { BotBuilderPage } from './pages/dashboard/BotBuilderPage';
import { KnowledgeBasePage } from './pages/dashboard/KnowledgeBasePage';
import { IntegrationsPage } from './pages/dashboard/IntegrationsPage';
import { AnalyticsPage } from './pages/dashboard/AnalyticsPage';

export const App: React.FC = () => {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          {/* 1. Landing Page (index) */}
          <Route path="/" element={<LandingPage />} />

          {/* 2. Authentication Pages */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/logout" element={<LogoutPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forget-password" element={<ForgotPasswordPage />} />

          {/* 3. Dashboard / Admin Panel Routes (wrapped in DashboardLayout) */}
          <Route
            path="/dashboard"
            element={<Navigate to="/dashboard/inbox" replace />}
          />
          <Route
            path="/dashboard/inbox"
            element={
              <DashboardLayout>
                <InboxPage />
              </DashboardLayout>
            }
          />
          <Route
            path="/dashboard/bot-builder"
            element={
              <DashboardLayout>
                <BotBuilderPage />
              </DashboardLayout>
            }
          />
          <Route
            path="/dashboard/knowledge"
            element={
              <DashboardLayout>
                <KnowledgeBasePage />
              </DashboardLayout>
            }
          />
          <Route
            path="/dashboard/integrations"
            element={
              <DashboardLayout>
                <IntegrationsPage />
              </DashboardLayout>
            }
          />
          <Route
            path="/dashboard/analytics"
            element={
              <DashboardLayout>
                <AnalyticsPage />
              </DashboardLayout>
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
