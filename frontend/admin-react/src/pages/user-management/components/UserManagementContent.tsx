import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { adminApi } from '../../../shared/services/api';
import UserDetailModal from './UserDetailModal';
import CreateUserModal from './CreateUserModal';

type UserStatus = 'Active' | 'Suspended' | 'Banned' | 'ShadowBanned';

type UserCard = {
  userId: string;
  displayName: string;
  age: number;
  email: string;
  location: string;
  status: UserStatus;
  createdAt: string;
};

const statusBadgeClass: Record<UserStatus, string> = {
  Active: 'bg-emerald-100 text-emerald-600',
  Suspended: 'bg-amber-100 text-amber-600',
  Banned: 'bg-red-100 text-red-600',
  ShadowBanned: 'bg-slate-200 text-slate-600',
};

export default function UserManagementContent() {
  const [users, setUsers] = useState<UserCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | UserStatus>('ALL');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statusFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getUsers({
        search: search || undefined,
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        page: 1,
        pageSize: 200,
      });
      const data = Array.isArray(response.data) ? response.data : [];
      setUsers(data);
      setCurrentPage(1);
    } catch (error) {
      console.error('Failed to fetch users', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBan = async (userId: string) => {
    const reason = window.prompt('Reason for ban:', 'Community standards violation');
    if (!reason) return;
    try {
      await adminApi.moderateUser(userId, 'Ban', reason);
      fetchUsers();
    } catch (error) {
      console.error(error);
      alert('Failed to ban account');
    }
  };

  const handleUnban = async (userId: string) => {
    try {
      await adminApi.moderateUser(userId, 'Unban', 'Unbanned by admin');
      fetchUsers();
    } catch (error) {
      console.error(error);
      alert('Failed to unban account');
    }
  };

  const totalCount = users.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const from = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, totalCount);
  const pagedUsers = users.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-fluid-xs font-semibold tracking-[0.16em] text-[#EE3F57]">MANAGEMENT DASHBOARD</p>
          <div className="mt-2 flex items-center gap-4">
            <h2 className="text-fluid-xl font-bold text-slate-800">USER PROFILE MANAGEMENT</h2>
          </div>
        </div>

        <div className="flex w-full flex-col gap-3 sm:flex-row md:w-auto">
          <label className="relative block min-w-[260px]">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#ADAFBB]"
              aria-hidden
            />
            <input
              type="text"
              placeholder="Search profiles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-fluid-sm outline-none transition focus:border-[#EE3F57] focus:ring-4 focus:ring-[#EE3F57]/15"
            />
          </label>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'ALL' | UserStatus)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-fluid-sm font-medium text-slate-600 outline-none transition focus:border-[#EE3F57]"
          >
            <option value="ALL">All Status</option>
            <option value="Active">Active</option>
            <option value="Suspended">Suspended</option>
            <option value="Banned">Banned</option>
            <option value="ShadowBanned">Shadow Banned</option>
          </select>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {loading ? (
          <p>Loading data...</p>
        ) : (
          pagedUsers.map((user) => {
            const initial = (user.displayName || user.email || 'U').substring(0, 1).toUpperCase();
            const badgeClass = statusBadgeClass[user.status] ?? 'bg-slate-100 text-slate-600';
            return (
              <article key={user.userId} className="rounded-2xl bg-white p-5 shadow-[0_16px_34px_-24px_rgba(0,0,0,0.2)] border border-slate-50">
                <div className="mb-4 flex items-start justify-between">
                  <div className="h-14 w-14 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500 text-lg">
                    {initial}
                  </div>

                  <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${badgeClass}`}>
                    {user.status}
                  </span>
                </div>

                <h3 className="text-fluid-base font-bold text-slate-800 truncate">
                  {user.displayName || (user.email ? user.email.split('@')[0] : 'Unknown User')}
                </h3>
                <p className="text-xs text-[#ADAFBB] mb-2 truncate">{user.email || 'No email'}</p>

                <div className="space-y-1.5 mb-4">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="font-semibold text-slate-700">Age:</span> {user.age || 'N/A'}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="font-semibold text-slate-700">Location:</span> {user.location || 'Not set'}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="font-semibold text-slate-700">Joined:</span> {new Date(user.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div className="mt-5 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedUserId(user.userId)}
                    className="flex-1 rounded-xl bg-[#8A2387]/10 px-3 py-2 text-fluid-sm font-medium text-[#8A2387] transition hover:bg-[#8A2387]/15"
                  >
                    View Details
                  </button>
                  {user.status === 'Banned' ? (
                    <button
                      type="button"
                      onClick={() => handleUnban(user.userId)}
                      className="flex-1 rounded-xl border border-emerald-200 bg-white px-3 py-2 text-fluid-sm font-medium text-emerald-600 transition hover:border-emerald-500 hover:text-emerald-500"
                    >
                      Unban
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleBan(user.userId)}
                      className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-fluid-sm font-medium text-slate-600 transition hover:border-[#EE3F57] hover:text-[#EE3F57]"
                    >
                      Ban Account
                    </button>
                  )}
                </div>
              </article>
            );
          })
        )}

        <article
          onClick={() => setShowCreateModal(true)}
          className="flex min-h-[230px] cursor-pointer group flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#ADAFBB] bg-white/70 p-5 text-center transition hover:border-[#EE3F57] hover:bg-white"
        >
          <span className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-2xl text-[#ADAFBB] group-hover:bg-[#EE3F57] group-hover:text-white transition">+</span>
          <h4 className="text-fluid-base font-semibold text-slate-700 group-hover:text-[#EE3F57]">Create New Profile</h4>
          <p className="mt-1 text-fluid-sm text-[#ADAFBB]">Manually create a user profile</p>
        </article>
      </section>

      <footer className="flex flex-col gap-3 rounded-2xl bg-white px-5 py-4 text-fluid-sm shadow-[0_16px_34px_-24px_rgba(0,0,0,0.2)] md:flex-row md:items-center md:justify-between">
        <p className="text-slate-500">Showing {from}-{to} of {totalCount} users</p>

        <div className="flex items-center gap-2">
          {(() => {
            const delta = 2;
            const pages: (number | string)[] = [];
            for (let i = 1; i <= totalPages; i++) {
              if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
                pages.push(i);
              } else if (pages[pages.length - 1] !== '...') {
                pages.push('...');
              }
            }
            return pages.map((p, i) => (
              <button
                key={i}
                disabled={p === '...'}
                onClick={() => typeof p === 'number' && setCurrentPage(p)}
                className={`h-8 w-8 rounded-lg text-xs font-semibold transition ${
                  p === '...' ? 'cursor-default text-slate-300' :
                  currentPage === p ? 'bg-[#EE3F57] text-white shadow-lg shadow-[#EE3F57]/20' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {p}
              </button>
            ));
          })()}
        </div>

        <div className="flex items-center gap-4 text-slate-500">
          <span className="inline-flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            Live System
          </span>
        </div>
      </footer>

      {selectedUserId && (
        <UserDetailModal
          userId={selectedUserId}
          onClose={() => setSelectedUserId(null)}
          onRefresh={fetchUsers}
        />
      )}

      {showCreateModal && (
        <CreateUserModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={fetchUsers}
        />
      )}
    </div>
  );
}
