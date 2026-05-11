import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import AdminLayout, { type MenuItem } from '../../layouts/admin/AdminLayout';

type AdminShellProps = {
  onLogout: () => void;
};

const routeByMenu: Record<MenuItem, string> = {
  Dashboard: '/admin/dashboard',
  'User Management': '/admin/user-management',
  Reports: '/admin/reports',
  Notifications: '/admin/notifications',
  Reviews: '/admin/reviews',
  'System Monitor': '/admin/system-monitor',
  'Test Upload': '/admin/test-upload',
};

const menuByRoute: Array<{ prefix: string; menu: MenuItem }> = [
  { prefix: '/admin/dashboard', menu: 'Dashboard' },
  { prefix: '/admin/user-management', menu: 'User Management' },
  { prefix: '/admin/reports', menu: 'Reports' },
  { prefix: '/admin/notifications', menu: 'Notifications' },
  { prefix: '/admin/reviews', menu: 'Reviews' },
  { prefix: '/admin/system-monitor', menu: 'System Monitor' },
  { prefix: '/admin/test-upload', menu: 'Test Upload' },
];

function resolveActiveMenu(pathname: string): MenuItem {
  const matched = menuByRoute.find((item) => pathname.startsWith(item.prefix));
  return matched ? matched.menu : 'Dashboard';
}

export default function AdminShell({ onLogout }: AdminShellProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <AdminLayout
      activeItem={resolveActiveMenu(pathname)}
      onMenuSelect={(menu) => navigate(routeByMenu[menu])}
      onLogout={onLogout}
    >
      <Outlet />
    </AdminLayout>
  );
}
