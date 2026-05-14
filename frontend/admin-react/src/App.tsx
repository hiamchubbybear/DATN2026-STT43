import { useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/auth/login/LoginPage';
import AdminShell from './pages/admin/AdminShell';
import DashboardPage from './pages/dashboard/DashboardPage';
import UserManagementPage from './pages/user-management/UserManagementPage';
import ReportsPage from './pages/reports/ReportsPage';
import NotificationsPage from './pages/notifications/NotificationsPage';
import ReviewsPage from './pages/reviews/ReviewsPage';
import UploadTestPage from './pages/test/UploadTestPage';
import SystemMonitorPage from './pages/system-monitor/SystemMonitorPage';
import VerificationsPage from './pages/verifications/VerificationsPage';
import ConfigPage from './pages/system-config/ConfigPage';
import AuditLogsPage from './pages/audit-logs/AuditLogsPage';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('admin_token'));

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/admin/dashboard" replace />
            ) : (
              <LoginPage onLoginSuccess={() => setIsAuthenticated(true)} />
            )
          }
        />

        <Route
          path="/admin"
          element={
            isAuthenticated ? (
              <AdminShell onLogout={() => setIsAuthenticated(false)} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="user-management" element={<UserManagementPage />} />
          <Route path="verifications" element={<VerificationsPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="system-config" element={<ConfigPage />} />
          <Route path="audit-logs" element={<AuditLogsPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="reviews" element={<ReviewsPage />} />
          <Route path="test-upload" element={<UploadTestPage />} />
          <Route path="system-monitor" element={<SystemMonitorPage />} />
        </Route>

        <Route path="*" element={<Navigate to={isAuthenticated ? '/admin/dashboard' : '/login'} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App
