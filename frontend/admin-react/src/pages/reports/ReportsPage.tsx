import { useEffect, useState } from 'react';
import { adminApi } from '../../shared/services/api';
import userIcon from '../../assets/user.png';
import heartIcon from '../../assets/heart.png';
import monthlyActiveIcon from '../../assets/Monthly-Active.png';

export default function ReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
        const res = await adminApi.getReports();
        setReports(res.data);
    } catch (e) {
        console.error(e);
    } finally {
        setLoading(false);
    }
  };

  const handleResolve = async (id: string) => {
    try {
        await adminApi.resolveReport(id);
        alert('Đã xử lý báo cáo');
        fetchReports();
    } catch (e) {
        alert('Lỗi khi xử lý báo cáo');
    }
  };
, filteredRows.length);

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
              {loading ? (
                <tr><td colSpan={6} className="text-center py-10 text-slate-400">Đang tải dữ liệu...</td></tr>
              ) : (
                reports.map((row) => (
                  <tr key={row.id} className="rounded-xl bg-[#F9FAFB] text-sm text-slate-700">
                    <td className="rounded-l-xl px-2 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs text-slate-500">
                            {row.reporterId.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">Reporter</p>
                          <p className="text-xs text-slate-500">{row.reporterId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-2 py-3">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white">
                          <img src={userIcon} alt="Target" className="h-4 w-4 object-contain" />
                        </span>
                        <div>
                          <p className="font-semibold text-slate-800">Target User</p>
                          <p className="text-xs text-slate-500">{row.targetUserId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-2 py-3">
                      <span className="rounded-full px-2.5 py-1 text-xs font-semibold bg-red-100 text-red-600">{row.reason}</span>
                    </td>
                    <td className="px-2 py-3 text-sm text-slate-600">{new Date(row.createdAt).toLocaleDateString()}</td>
                    <td className="px-2 py-3">
                      <span className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600">
                        <span className={`h-2.5 w-2.5 rounded-full ${row.status === 0 ? 'bg-[#EE3F57]' : 'bg-emerald-500'}`} />
                        {row.status === 0 ? 'PENDING' : 'RESOLVED'}
                      </span>
                    </td>
                    <td className="rounded-r-xl px-2 py-3">
                      <div className="flex items-center gap-2">
                        {row.status === 0 && (
                            <button 
                                onClick={() => handleResolve(row.id)}
                                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-600 hover:bg-[#EE3F57] hover:text-white transition"
                            >
                                RESOLVE
                            </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
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
