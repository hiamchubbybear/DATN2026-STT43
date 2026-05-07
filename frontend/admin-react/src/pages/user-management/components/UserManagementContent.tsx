import avatarUser1 from '../../../assets/avatar-user-1.svg';
import avatarUser2 from '../../../assets/avatar-user-2.svg';
import avatarUser3 from '../../../assets/avatar-user-3.svg';

type UserCard = {
  id: number;
  name: string;
  age: number;
  location: string;
  verified: boolean;
  avatar: string;
};

const users: UserCard[] = [
  { id: 1, name: 'Nguyễn Minh Anh', age: 24, location: 'Quận 1, TP.HCM', verified: true, avatar: avatarUser1 },
  { id: 2, name: 'Trần Gia Hân', age: 26, location: 'Hà Đông, Hà Nội', verified: false, avatar: avatarUser2 },
  { id: 3, name: 'Lê Quang Huy', age: 29, location: 'Hải Châu, Đà Nẵng', verified: true, avatar: avatarUser3 },
  { id: 4, name: 'Phạm Thanh Vy', age: 23, location: 'Ninh Kiều, Cần Thơ', verified: true, avatar: avatarUser1 },
  { id: 5, name: 'Đỗ Hoàng Nam', age: 31, location: 'Biên Hòa, Đồng Nai', verified: false, avatar: avatarUser2 },
];

export default function UserManagementContent() {
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
        {users.map((user) => (
          <article key={user.id} className="rounded-2xl bg-white p-5 shadow-[0_16px_34px_-24px_rgba(0,0,0,0.2)]">
            <div className="mb-4 flex items-start justify-between">
              <div className="relative">
                <img src={user.avatar} alt={user.name} className="h-14 w-14 rounded-full object-cover" />
                {user.verified && (
                  <span className="absolute -bottom-1 -right-1 inline-flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-emerald-500 text-[10px] text-white">
                    ✓
                  </span>
                )}
              </div>

              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  user.verified ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {user.verified ? 'VERIFIED' : 'UNVERIFIED'}
              </span>
            </div>

            <h3 className="text-fluid-base font-bold text-slate-800">{user.name}</h3>
            <p className="mt-1 text-fluid-sm text-[#ADAFBB]">
              {user.age} tuổi • {user.location}
            </p>

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                className="flex-1 rounded-xl bg-[#8A2387]/10 px-3 py-2 text-fluid-sm font-medium text-[#8A2387] transition hover:bg-[#8A2387]/15"
              >
                Xem chi tiết
              </button>
              <button
                type="button"
                className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-fluid-sm font-medium text-slate-600 transition hover:border-[#EE3F57] hover:text-[#EE3F57]"
              >
                Khóa tài khoản
              </button>
            </div>
          </article>
        ))}

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
