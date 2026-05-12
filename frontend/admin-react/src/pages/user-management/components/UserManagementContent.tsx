import { useEffect, useState } from 'react';
import { adminApi } from '../../../shared/services/api';
import avatarUser1 from '../../../assets/avatar-user-1.svg';
import avatarUser2 from '../../../assets/avatar-user-2.svg';
import avatarUser3 from '../../../assets/avatar-user-3.svg';

type UserCard = {
  id: string;
  email: string;
  isVerified: boolean;
  isBanned: boolean;
  role: string;
};

export default function UserManagementContent() {
  const [users, setUsers] = useState<UserCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await adminApi.getUsers();
      setUsers(response.data.users);
    } catch (error) {
      console.error('Failed to fetch users', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBan = async (userId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn khóa tài khoản này?')) {
      try {
        await adminApi.banUser(userId, 'Vi phạm tiêu chuẩn cộng đồng');
        fetchUsers();
      } catch (error) {
        alert('Khóa tài khoản thất bại');
      }
    }
  };

  const handleUnban = async (userId: string) => {
    try {
      await adminApi.unbanUser(userId);
      fetchUsers();
    } catch (error) {
      alert('Mở khóa tài khoản thất bại');
    }
  };
  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-fluid-xs font-semibold tracking-[0.16em] text-[#EE3F57]">MANAGEMENT DASHBOARD</p>
          <h2 className="mt-2 text-fluid-xl font-bold text-slate-800">QUẢN LÝ HỒ SƠ NGƯỜI DÙNG</h2>
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
              placeholder="Tìm kiếm hồ sơ..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-fluid-sm outline-none transition focus:border-[#EE3F57] focus:ring-4 focus:ring-[#EE3F57]/15"
            />
          </label>

          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#ADAFBB] bg-white px-4 py-2.5 text-fluid-sm font-medium text-slate-600 transition hover:border-[#EE3F57] hover:text-[#EE3F57]"
          >
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
              <path d="M4 6h16M7 12h10m-7 6h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Lọc nâng cao
          </button>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {loading ? (
          <p>Đang tải dữ liệu...</p>
        ) : (
          users.map((user) => (
            <article key={user.id} className="rounded-2xl bg-white p-5 shadow-[0_16px_34px_-24px_rgba(0,0,0,0.2)]">
              <div className="mb-4 flex items-start justify-between">
                <div className="relative">
                  <img src={avatarUser1} alt={user.email} className="h-14 w-14 rounded-full object-cover" />
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

              <h3 className="text-fluid-base font-bold text-slate-800 truncate" title={user.email}>{user.email}</h3>
              <p className="mt-1 text-fluid-sm text-[#ADAFBB]">
                Role: {user.role}
              </p>

              <div className="mt-5 flex gap-2">
                <button
                  type="button"
                  className="flex-1 rounded-xl bg-[#8A2387]/10 px-3 py-2 text-fluid-sm font-medium text-[#8A2387] transition hover:bg-[#8A2387]/15"
                >
                  Xem chi tiết
                </button>
                {user.isBanned ? (
                  <button
                    type="button"
                    onClick={() => handleUnban(user.id)}
                    className="flex-1 rounded-xl border border-emerald-200 bg-white px-3 py-2 text-fluid-sm font-medium text-emerald-600 transition hover:border-emerald-500 hover:text-emerald-500"
                  >
                    Mở khóa
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleBan(user.id)}
                    className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-fluid-sm font-medium text-slate-600 transition hover:border-[#EE3F57] hover:text-[#EE3F57]"
                  >
                    Khóa tài khoản
                  </button>
                )}
              </div>
            </article>
          ))
        )}

        <article className="flex min-h-[230px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#ADAFBB] bg-white/70 p-5 text-center">
          <span className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-2xl text-[#ADAFBB]">+</span>
          <h4 className="text-fluid-base font-semibold text-slate-700">Tạo hồ sơ mới</h4>
          <p className="mt-1 text-fluid-sm text-[#ADAFBB]">Tạo hồ sơ người dùng thủ công</p>
        </article>
      </section>

      <footer className="flex flex-col gap-3 rounded-2xl bg-white px-5 py-4 text-fluid-sm shadow-[0_16px_34px_-24px_rgba(0,0,0,0.2)] md:flex-row md:items-center md:justify-between">
        <p className="text-slate-500">Hiển thị 1-6 trong tổng số 2,450 người dùng</p>

        <div className="flex items-center gap-2">
          <button type="button" className="h-8 w-8 rounded-lg bg-[#EE3F57] text-sm font-semibold text-white">1</button>
          <button type="button" className="h-8 w-8 rounded-lg bg-slate-100 text-sm text-slate-500">2</button>
          <button type="button" className="h-8 w-8 rounded-lg bg-slate-100 text-sm text-slate-500">3</button>
        </div>

        <div className="flex items-center gap-4 text-slate-500">
          <span className="inline-flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            842 Online
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ADAFBB]" />
            1,608 Offline
          </span>
        </div>
      </footer>
    </div>
  );
}
