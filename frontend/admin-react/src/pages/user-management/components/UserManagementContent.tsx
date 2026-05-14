import { useEffect, useState } from 'react';
import { adminApi } from '../../../shared/services/api';
import UserDetailModal from './UserDetailModal';
import CreateUserModal from './CreateUserModal';

type UserCard = {
  id: string;
  email: string;
  displayName: string;
  gender: string;
  avatar?: string;
  location: string;
  isVerified: boolean;
  isBanned: boolean;
  role: string;
  createdAt: string;
};

export default function UserManagementContent() {
  const [users, setUsers] = useState<UserCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    status: 'ALL', // ALL, ACTIVE, BANNED
    verified: 'ALL', // ALL, VERIFIED, UNVERIFIED
    gender: '', // Male, Female, Other
  });
  const [selectedUserData, setSelectedUserData] = useState<any>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 500);
    return () => clearTimeout(timer);
  }, [search, filters, currentPage]);

  const fetchUsers = async () => {
    try {
      const isBanned = filters.status === 'BANNED' ? true : filters.status === 'ACTIVE' ? false : undefined;
      const isVerified = filters.verified === 'VERIFIED' ? true : filters.verified === 'UNVERIFIED' ? false : undefined;

      const response = await adminApi.getUsers({
        search,
        isBanned,
        isVerified,
        gender: filters.gender || undefined,
        page: currentPage,
        pageSize
      });
      setUsers(response.data.users);
      setTotalCount(response.data.total);
    } catch (error) {
      console.error('Failed to fetch users', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = async (userId: string) => {
    try {
      const res = await adminApi.getUserDetails(userId);
      setSelectedUserData(res.data);
    } catch (e) {
      alert('Failed to fetch user details');
    }
  };

  const handleBan = async (userId: string) => {
    if (window.confirm('Are you sure you want to ban this account?')) {
      try {
        await adminApi.banUser(userId, 'Community standards violation');
        fetchUsers();
      } catch (error) {
        alert('Failed to ban account');
      }
    }
  };

  const handleUnban = async (userId: string) => {
    try {
      await adminApi.unbanUser(userId);
      fetchUsers();
    } catch (error) {
      alert('Failed to unban account');
    }
  };
  const totalPages = Math.ceil(totalCount / pageSize);
  const from = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, totalCount);

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
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#ADAFBB]"
            >
              <path d="M11 4a7 7 0 1 1 0 14 7 7 0 0 1 0-14Zm0 0 9 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              placeholder="Search profiles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-fluid-sm outline-none transition focus:border-[#EE3F57] focus:ring-4 focus:ring-[#EE3F57]/15"
            />
          </label>

          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-fluid-sm font-medium text-slate-600 outline-none transition focus:border-[#EE3F57]"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="BANNED">Banned</option>
          </select>

          <select
            value={filters.verified}
            onChange={(e) => setFilters(prev => ({ ...prev, verified: e.target.value }))}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-fluid-sm font-medium text-slate-600 outline-none transition focus:border-[#EE3F57]"
          >
            <option value="ALL">Verification</option>
            <option value="VERIFIED">Verified</option>
            <option value="UNVERIFIED">Unverified</option>
          </select>

          <select
            value={filters.gender}
            onChange={(e) => setFilters(prev => ({ ...prev, gender: e.target.value }))}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-fluid-sm font-medium text-slate-600 outline-none transition focus:border-[#EE3F57]"
          >
            <option value="">Genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {loading ? (
          <p>Loading data...</p>
        ) : (
          users.map((user) => (
            <article key={user.id} className="rounded-2xl bg-white p-5 shadow-[0_16px_34px_-24px_rgba(0,0,0,0.2)] border border-slate-50">
              <div className="mb-4 flex items-start justify-between">
                <div className="relative">
                  {user.avatar ? (
                    <img 
                      src={user.avatar} 
                      className="h-14 w-14 rounded-full object-cover border-2 border-[#EE3F57]/20" 
                      alt={user.displayName} 
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  {(!user.avatar || user.avatar) && (
                    <div className={`${user.avatar ? 'hidden' : ''} h-14 w-14 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-400`}>
                      {(user.displayName || user.email.split('@')[0] || 'U').substring(0, 1).toUpperCase()}
                    </div>
                  )}
                  {user.isVerified && (
                    <span className="absolute -bottom-1 -right-1 inline-flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-emerald-500 text-[10px] text-white">
                      ✓
                    </span>
                  )}
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    user.isBanned ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'
                  }`}
                >
                  {user.isBanned ? 'BANNED' : 'ACTIVE'}
                </span>
              </div>

              <h3 className="text-fluid-base font-bold text-slate-800 truncate">{user.displayName || user.email.split('@')[0] || 'Unknown User'}</h3>
              <p className="text-xs text-[#ADAFBB] mb-2">{user.email}</p>
              
              <div className="space-y-1.5 mb-4">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="font-semibold text-slate-700">Role:</span> {user.role}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="font-semibold text-slate-700">Gender:</span> {user.gender}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="font-semibold text-slate-700">Location:</span> {user.location}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="font-semibold text-slate-700">Joined:</span> {new Date(user.createdAt).toLocaleDateString()}
                </div>
              </div>

              <div className="mt-5 flex gap-2">
                <button
                  type="button"
                  onClick={() => handleViewDetail(user.id)}
                  className="flex-1 rounded-xl bg-[#8A2387]/10 px-3 py-2 text-fluid-sm font-medium text-[#8A2387] transition hover:bg-[#8A2387]/15"
                >
                  View Details
                </button>
                {user.isBanned ? (
                  <button
                    type="button"
                    onClick={() => handleUnban(user.id)}
                    className="flex-1 rounded-xl border border-emerald-200 bg-white px-3 py-2 text-fluid-sm font-medium text-emerald-600 transition hover:border-emerald-500 hover:text-emerald-500"
                  >
                    Unban
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleBan(user.id)}
                    className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-fluid-sm font-medium text-slate-600 transition hover:border-[#EE3F57] hover:text-[#EE3F57]"
                  >
                    Ban Account
                  </button>
                )}
              </div>
            </article>
          ))
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
            const delta = 2; // Số trang hiển thị quanh trang hiện tại
            const pages = [];
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

      {selectedUserData && (
        <UserDetailModal 
          data={selectedUserData} 
          onClose={() => setSelectedUserData(null)} 
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
