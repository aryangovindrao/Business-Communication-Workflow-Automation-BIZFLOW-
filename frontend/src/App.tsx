import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthLayout } from '@/layouts/auth-layout';
import { DashboardLayout } from '@/layouts/dashboard-layout';
import { ProtectedRoute, RoleGuard } from '@/routes/protected-route';
import { LoginPage } from '@/pages/login';
import { SignUpPage } from '@/pages/signup';
import { ForgotPasswordPage } from '@/pages/forgot-password';
import { ResetPasswordPage } from '@/pages/reset-password';
import { DashboardPage } from '@/pages/dashboard';
import { InboxPage } from '@/pages/inbox';
import { CrmPage } from '@/pages/crm';
import { WorkflowsPage } from '@/pages/workflows';
import { WorkflowBuilderPage } from '@/pages/workflow-builder';
import { AnalyticsPage } from '@/pages/analytics';
import { NotificationsPage } from '@/pages/notifications';
import { SettingsPage } from '@/pages/settings';

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Route>

      {/* Authenticated */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/inbox" element={<InboxPage />} />
          <Route path="/inbox/:id" element={<InboxPage />} />
          <Route path="/crm" element={<CrmPage />} />
          <Route path="/workflows" element={<WorkflowsPage />} />
          <Route path="/workflows/new" element={<WorkflowBuilderPage />} />
          <Route path="/workflows/:id" element={<WorkflowBuilderPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />

          {/* RBAC-restricted */}
          <Route element={<RoleGuard roles={['Admin', 'Manager']} />}>
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
