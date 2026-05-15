import { useRef, useState, type ComponentType } from 'react';
import {
  LayoutDashboard,
  Users,
  BadgeCheck,
  Flag,
  Settings,
  ScrollText,
  Bell,
  Star,
  Activity,
  Upload,
} from 'lucide-react';
import logoImage from '../../assets/logomixer.png';
import notificationIcon from '../../assets/notification.png';
import avatarImage from '../../assets/avatar.jpg';
import useOutsideClick from '../../shared/hooks/useOutsideClick';

export type MenuItem = 'Dashboard' | 'User Management' | 'Verifications' | 'Reports' | 'System Config' | 'Audit Logs' | 'Notifications' | 'Reviews' | 'System Monitor' | 'Test Upload';

type AdminLayoutProps = {
  activeItem: MenuItem;
  onLogout: () => void;
  onMenuSelect: (item: MenuItem) => void;
  children: React.ReactNode;
};

const sideItems: MenuItem[] = ['Dashboard', 'User Management', 'Verifications', 'Reports', 'System Config', 'Audit Logs', 'Notifications', 'Reviews', 'System Monitor', 'Test Upload'];

type IconComponent = ComponentType<{ className?: string }>;

const sideItemIcon: Record<MenuItem, IconComponent> = {
  Dashboard: LayoutDashboard,
  'User Management': Users,
  Verifications: BadgeCheck,
  Reports: Flag,
  'System Config': Settings,
  'Audit Logs': ScrollText,
  Notifications: Bell,
  Reviews: Star,
  'System Monitor': Activity,
  'Test Upload': Upload,
};

export default function AdminLayout({ activeItem, onLogout, onMenuSelect, children }: AdminLayoutProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useOutsideClick(menuRef, () => setShowUserMenu(false));

  const handleMenuSelect = (item: MenuItem) => {
    onMenuSelect(item);
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#F3F3F3] text-slate-700">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 shrink-0 flex-col overflow-y-auto border-r border-slate-200 bg-white px-6 py-8 transition-transform duration-300 ease-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <button
          type="button"
          onClick={() => setIsSidebarOpen(false)}
          className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          aria-label="Close sidebar"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 6l12 12M6 18L18 6" />
          </svg>
        </button>

        <div className="flex flex-col items-center">
          <img src={logoImage} alt="Mixer Admin" className="mb-4 h-20 w-20 rounded-xl object-cover" />
          <h2 className="text-xl font-bold uppercase text-[#E1306C]">Mixer Admin</h2>
        </div>

        <nav className="mt-10 space-y-1">
          {sideItems.map((item) => {
            const isActive = item === activeItem;
            const Icon = sideItemIcon[item];
            return (
              <button
                key={item}
                type="button"
                onClick={() => handleMenuSelect(item)}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition ${
                  isActive
                    ? 'border-l-4 border-[#EE3F57] bg-[#EE3F57]/10 font-semibold text-[#EE3F57]'
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                <Icon className="h-4 w-4" />
                {item}
              </button>
            );
          })}
        </nav>

        <button
          type="button"
          className="mt-auto rounded-2xl bg-[#EE3F57] px-4 py-3.5 font-semibold text-white transition hover:bg-[#d7324a]"
        >
          Create Report
        </button>
      </aside>

      <main className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-[var(--app-max-width)]">
          <header className="sticky top-0 z-20 mb-6 flex flex-col gap-4 rounded-2xl border border-slate-100/80 bg-white/95 px-5 py-4 shadow-[0_16px_34px_-24px_rgba(0,0,0,0.2)] backdrop-blur-md md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsSidebarOpen((prev) => !prev)}
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 transition hover:border-[#EE3F57] hover:text-[#EE3F57]"
                aria-label={isSidebarOpen ? 'Close navigation' : 'Open navigation'}
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="4" y1="6" x2="20" y2="6" />
                  <line x1="4" y1="12" x2="20" y2="12" />
                  <line x1="4" y1="18" x2="20" y2="18" />
                </svg>
              </button>
              <h1
                onClick={() => onMenuSelect('Dashboard')}
                className="cursor-pointer text-2xl font-bold uppercase text-[#E1306C] transition hover:opacity-80"
              >
                Mixer Admin
              </h1>
            </div>

            <div className="w-full md:max-w-md">
              <input
                type="text"
                placeholder="Search analytics..."
                className="w-full rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-[#EE3F57] focus:ring-4 focus:ring-[#EE3F57]/15"
              />
            </div>

            <div className="flex items-center gap-3">
              <button type="button" className="rounded-full bg-[#F3F3F3] p-2.5">
                <img src={notificationIcon} alt="Notifications" className="h-5 w-5 object-contain" />
              </button>
              <div ref={menuRef} className="relative">
                <button
                  type="button"
                  onClick={() => setShowUserMenu((prev) => !prev)}
                  className="overflow-hidden rounded-full border-2 border-[#EE3F57]/30"
                >
                  <img src={avatarImage} alt="Admin Avatar" className="h-10 w-10 object-cover" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 top-12 z-20 w-32 rounded-xl bg-white p-2 shadow-[0_12px_28px_-16px_rgba(0,0,0,0.35)]">
                    <button
                      type="button"
                      onClick={onLogout}
                      className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-[#EE3F57] transition hover:bg-[#F3F3F3]"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          {children}
        </div>
      </main>
    </div>
  );
}
