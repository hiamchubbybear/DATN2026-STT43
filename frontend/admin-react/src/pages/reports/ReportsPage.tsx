import { useMemo, useState } from 'react';
import avatarUser1 from '../../assets/avatar-user-1.svg';
import avatarUser2 from '../../assets/avatar-user-2.svg';
import avatarUser3 from '../../assets/avatar-user-3.svg';
import userIcon from '../../assets/user.png';
import heartIcon from '../../assets/heart.png';
import monthlyActiveIcon from '../../assets/Monthly-Active.png';

type ReportRow = {
  id: string;
  reporterName: string;
  reporterId: string;
  reporterAvatar: string;
  profileName: string;
  reason: string;
  reasonClass: string;
  date: string;
  status: 'PENDING' | 'RESOLVED';
  priority: 'HIGH' | 'NORMAL';
  reached: string;
  meta: string;
};

const reportRows: ReportRow[] = [
  {
    id: 'RP-1029',
    reporterName: 'Luna Tran',
    reporterId: '#U21384',
    reporterAvatar: avatarUser1,
    profileName: 'Kai Nguyen',
    reason: 'Harassment',
    reasonClass: 'bg-[#FEE4E2] text-[#EE3F57]',
    date: 'Apr 11, 2026 • 09:24',
    status: 'PENDING',
    priority: 'HIGH',
    reached: 'Reached by 42 users',
    meta: 'Target: Nearby Matches • 9m ago',
  },
  {
    id: 'RP-1031',
    reporterName: 'Minh Le',
    reporterId: '#U21902',
    reporterAvatar: avatarUser2,
    profileName: 'Noah Vu',
    reason: 'Spam',
    reasonClass: 'bg-[#FFF3E0] text-[#F27121]',
    date: 'Apr 11, 2026 • 10:17',
    status: 'PENDING',
    priority: 'HIGH',
    reached: 'Reached by 18 users',
    meta: 'Target: New Members • 4m ago',
  },
  {
    id: 'RP-1022',
    reporterName: 'Anna Pham',
    reporterId: '#U20883',
    reporterAvatar: avatarUser3,
    profileName: 'Jason Ho',
    reason: 'Fake Profile',
    reasonClass: 'bg-[#FEE4E2] text-[#EE3F57]',
    date: 'Apr 10, 2026 • 18:40',
    status: 'RESOLVED',
    priority: 'NORMAL',
    reached: 'Reached by 63 users',
    meta: 'Target: All Users • Yesterday',
  },
  {
    id: 'RP-1018',
    reporterName: 'Gia Bao',
    reporterId: '#U20441',
    reporterAvatar: avatarUser1,
    profileName: 'Mika Pham',
    reason: 'Harassment',
    reasonClass: 'bg-[#FEE4E2] text-[#EE3F57]',
    date: 'Apr 09, 2026 • 14:08',
    status: 'RESOLVED',
    priority: 'HIGH',
    reached: 'Reached by 52 users',
    meta: 'Target: Premium Tier • 1d ago',
  },
  {
    id: 'RP-1009',
    reporterName: 'Quynh Anh',
    reporterId: '#U19870',
    reporterAvatar: avatarUser2,
    profileName: 'Rin Do',
    reason: 'Spam',
    reasonClass: 'bg-[#FFF3E0] text-[#F27121]',
    date: 'Apr 08, 2026 • 11:20',
    status: 'PENDING',
    priority: 'NORMAL',
    reached: 'Reached by 27 users',
    meta: 'Target: New Members • 2d ago',
  },
  {
    id: 'RP-1003',
    reporterName: 'Duc Nguyen',
    reporterId: '#U19024',
    reporterAvatar: avatarUser3,
    profileName: 'Nora Le',
    reason: 'Fake Profile',
    reasonClass: 'bg-[#FEE4E2] text-[#EE3F57]',
    date: 'Apr 07, 2026 • 08:15',
    status: 'RESOLVED',
    priority: 'HIGH',
    reached: 'Reached by 71 users',
    meta: 'Target: All Users • 3d ago',
  },
];

const pageSize = 3;

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<'ALL' | 'HIGH'>('ALL');
  const [page, setPage] = useState(1);

  const filteredRows = useMemo(
    () => (activeTab === 'ALL' ? reportRows : reportRows.filter((row) => row.priority === 'HIGH')),
    [activeTab],
  );

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));

  const paginatedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, page]);

  const from = filteredRows.length === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, filteredRows.length);

  return (
    <div className="space-y-6 bg-[#F3F3F3]">
      <section className="grid gap-4 xl:grid-cols-5">
        <article className="relative overflow-hidden rounded-2xl bg-white p-5 shadow-[0_16px_34px_-24px_rgba(0,0,0,0.16)] xl:col-span-3">
          <h3 className="text-fluid-base font-semibold text-slate-800">Pending Flags</h3>
          <p className="mt-2 max-w-2xl text-fluid-sm text-slate-500">
            Cases that require moderation review are currently queued with anomaly signals and priority scoring.
          </p>

          <div className="mt-4 flex items-center gap-8">
            <div>
              <p className="text-fluid-xs text-slate-500">Resolution Speed</p>
              <p className="text-fluid-lg font-bold text-[#EE3F57]">12m avg</p>
            </div>
            <div>
              <p className="text-fluid-xs text-slate-500">Accuracy</p>
              <p className="text-fluid-lg font-bold text-slate-800">94.2%</p>
            </div>
          </div>

          <div className="pointer-events-none absolute -right-2 top-3 flex gap-2 opacity-20">
            <span className="h-8 w-8 rounded-lg bg-[#EE3F57]" />
            <span className="mt-4 h-6 w-6 rounded-md bg-[#F27121]" />
            <span className="mt-1 h-10 w-10 rounded-xl bg-[#8A2387]" />
          </div>
        </article>

        <article className="rounded-2xl bg-[#EE3F57] p-5 text-white shadow-[0_16px_34px_-24px_rgba(0,0,0,0.24)] xl:col-span-2">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-fluid-base font-semibold">Urgent Queue</h3>
              <p className="mt-1 text-fluid-sm text-white/85">High-risk reports waiting for immediate action.</p>
            </div>
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
              <img src={monthlyActiveIcon} alt="Urgent" className="h-5 w-5 object-contain brightness-0 invert" />
            </span>
          </div>

          <button
            type="button"
            className="mt-6 rounded-xl bg-white px-4 py-2 text-fluid-sm font-semibold text-[#EE3F57] transition hover:bg-white/90"
          >
            Review Now
          </button>
        </article>
      </section>

      <section className="rounded-2xl bg-white p-5 shadow-[0_16px_34px_-24px_rgba(0,0,0,0.16)]">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="mr-2 text-fluid-base font-semibold text-slate-800">Activity Log</h3>
            <button
              type="button"
              onClick={() => {
                setActiveTab('ALL');
                setPage(1);
              }}
              className={`rounded-full px-3 py-1 text-fluid-xs font-semibold ${
                activeTab === 'ALL' ? 'bg-slate-100 text-slate-700' : 'bg-slate-50 text-slate-400'
              }`}
            >
              ALL REPORTS
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('HIGH');
                setPage(1);
              }}
              className={`rounded-full px-3 py-1 text-fluid-xs font-semibold ${
                activeTab === 'HIGH' ? 'bg-[#FEE4E2] text-[#EE3F57]' : 'bg-slate-50 text-slate-400'
              }`}
            >
              HIGH PRIORITY
            </button>
          </div>

          <button
            type="button"
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600"
          >
            Advanced Filters
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[960px] w-full border-separate border-spacing-y-2">
            <thead>
              <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                <th className="px-2 py-2">Reporter</th>
                <th className="px-2 py-2">Reported Profile</th>
                <th className="px-2 py-2">Reason</th>
                <th className="px-2 py-2">Date</th>
                <th className="px-2 py-2">Status</th>
                <th className="px-2 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRows.map((row) => (
                <tr key={row.id} className="rounded-xl bg-[#F9FAFB] text-sm text-slate-700">
                  <td className="rounded-l-xl px-2 py-3">
                    <div className="flex items-center gap-3">
                      <img src={row.reporterAvatar} alt={row.reporterName} className="h-9 w-9 rounded-full object-cover" />
                      <div>
                        <p className="font-semibold text-slate-800">{row.reporterName}</p>
                        <p className="text-xs text-slate-500">{row.reporterId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-2 py-3">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white">
                        <img src={userIcon} alt={row.profileName} className="h-4 w-4 object-contain" />
                      </span>
                      <div>
                        <p className="font-semibold text-slate-800">{row.profileName}</p>
                        <p className="text-xs text-slate-500">{row.meta}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-2 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${row.reasonClass}`}>{row.reason}</span>
                  </td>
                  <td className="px-2 py-3 text-sm text-slate-600">{row.date}</td>
                  <td className="px-2 py-3">
                    <span className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600">
                      <span className={`h-2.5 w-2.5 rounded-full ${row.status === 'PENDING' ? 'bg-[#EE3F57]' : 'bg-emerald-500'}`} />
                      {row.status}
                    </span>
                  </td>
                  <td className="rounded-r-xl px-2 py-3">
                    <div className="flex items-center gap-2">
                      <button type="button" className="rounded-full bg-white p-2" aria-label="Match action">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#8A2387]">
                          <path d="m12 20-1.45-1.32C5.4 14.04 2 10.94 2 7.15 2 4.05 4.42 2 7.4 2c1.74 0 3.41.81 4.6 2.09C13.19 2.81 14.86 2 16.6 2 19.58 2 22 4.05 22 7.15c0 3.79-3.4 6.89-8.55 11.54L12 20Z" fill="currentColor"/>
                        </svg>
                      </button>
                      <button type="button" className="rounded-full bg-white p-2" aria-label="Decline action">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#F27121]">
                          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                          <path d="M8.5 15.5 15.5 8.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-600"
                      >
                        VIEW DETAILS
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex flex-col gap-3 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
          <p>Showing {from}-{to} of {filteredRows.length} flagged activities</p>
          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
              <button
                key={pageNumber}
                type="button"
                onClick={() => setPage(pageNumber)}
                className={`h-8 w-8 rounded-lg text-xs font-semibold ${
                  pageNumber === page ? 'bg-[#EE3F57] text-white' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {pageNumber}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-4 shadow-[0_16px_34px_-24px_rgba(0,0,0,0.12)] md:flex md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#F27121_10%,#E94057_60%,#8A2387_100%)] text-white">
            <img src={heartIcon} alt="Fraud detection" className="h-4 w-4 object-contain brightness-0 invert" />
          </span>
          <div>
            <h4 className="font-semibold text-slate-800">AI Fraud Detection is Active</h4>
            <p className="text-sm text-slate-500">Suspicious profile clusters are being mapped in real time to prevent escalation.</p>
          </div>
        </div>

        <button type="button" className="mt-3 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white md:mt-0">
          VIEW HEATMAP
        </button>
      </section>
    </div>
  );
}
