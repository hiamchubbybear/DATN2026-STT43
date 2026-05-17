import { useState, useEffect } from 'react';
import { adminApi } from '../../shared/services/api';
import notificationIcon from '../../assets/notification.png';
import monthlyActiveIcon from '../../assets/Monthly-Active.png';

export default function NotificationsPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [broadcasts, setBroadcasts] = useState<any[]>([]);

  const fetchBroadcasts = async () => {
    try {
      const res = await adminApi.getBroadcasts();
      setBroadcasts(res.data || []);
    } catch (e) {
      console.error('Failed to fetch broadcasts:', e);
    }
  };

  useEffect(() => {
    fetchBroadcasts();
  }, []);

  const handleLaunch = async () => {
    if (!title || !content) {
      alert('Vui lòng nhập đầy đủ tiêu đề và nội dung');
      return;
    }
    
    setLoading(true);
    try {
      await adminApi.broadcast(title, content);
      alert('Đã gửi thông báo đến toàn bộ người dùng');
      setTitle('');
      setContent('');
      fetchBroadcasts(); // Reload history
    } catch (e) {
      alert('Gửi thông báo thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-fluid-xs font-semibold tracking-[0.16em] text-[#EE3F57]">CAMPAIGN MANAGEMENT</p>
          <h2 className="mt-2 text-fluid-xl font-bold text-slate-800">Notifications</h2>
        </div>
        <button type="button" className="rounded-xl border border-[#D0D5DD] bg-white px-4 py-2 text-fluid-sm font-medium text-slate-600">
          Export Data
        </button>
      </section>

      <section className="grid gap-4 xl:grid-cols-5">
        <div className="space-y-4 xl:col-span-2">
          <article className="rounded-2xl bg-white p-5 shadow-[0_16px_34px_-24px_rgba(0,0,0,0.16)]">
            <h3 className="text-fluid-base font-semibold text-slate-800">New Campaign</h3>

            <form className="mt-4 space-y-4" onSubmit={(e) => { e.preventDefault(); handleLaunch(); }}>
              <div>
                <label htmlFor="title" className="mb-1.5 block text-fluid-sm font-medium text-slate-600">Title</label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Input Title"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-fluid-sm outline-none transition focus:border-[#EE3F57] focus:ring-4 focus:ring-[#EE3F57]/15"
                />
              </div>

              <div>
                <label htmlFor="message" className="mb-1.5 block text-fluid-sm font-medium text-slate-600">Message Body</label>
                <textarea
                  id="message"
                  rows={5}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your campaign message..."
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-fluid-sm outline-none transition focus:border-[#EE3F57] focus:ring-4 focus:ring-[#EE3F57]/15"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="audience" className="mb-1.5 block text-fluid-sm font-medium text-slate-600">Audience Segment</label>
                  <select
                    id="audience"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-fluid-sm text-slate-600 outline-none transition focus:border-[#EE3F57] focus:ring-4 focus:ring-[#EE3F57]/15"
                    defaultValue="all"
                  >
                    <option value="all">All Users</option>
                    <option value="new">New Users</option>
                    <option value="active">Active Users</option>
                    <option value="inactive">Inactive Users</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="scheduling" className="mb-1.5 block text-fluid-sm font-medium text-slate-600">Scheduling</label>
                  <select
                    id="scheduling"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-fluid-sm text-slate-600 outline-none transition focus:border-[#EE3F57] focus:ring-4 focus:ring-[#EE3F57]/15"
                    defaultValue="now"
                  >
                    <option value="now">Send now</option>
                    <option value="later">Schedule later</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#EE3F57] px-4 py-3 text-fluid-sm font-semibold text-white transition hover:bg-[#d63249] disabled:opacity-50"
              >
                {loading ? 'Sending...' : (
                    <>
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
                            <path d="M3 12h14m0 0-4-4m4 4-4 4M19 5l2 2-2 2M19 15l2 2-2 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Launch Notification
                    </>
                )}
              </button>
            </form>
          </article>

          <article className="rounded-2xl bg-white p-5 shadow-[0_16px_34px_-24px_rgba(0,0,0,0.16)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-fluid-sm text-slate-500">Avg Delivery rate</p>
                <p className="mt-1 text-fluid-xl font-bold text-slate-800">98.4%</p>
              </div>
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#EE3F57]/10">
                <img src={monthlyActiveIcon} alt="Delivery rate" className="h-5 w-5 object-contain" />
              </span>
            </div>
          </article>
        </div>

        <article className="rounded-2xl bg-white p-5 shadow-[0_16px_34px_-24px_rgba(0,0,0,0.16)] xl:col-span-3">
          <h3 className="text-fluid-base font-semibold text-slate-800">Campaign History</h3>

          <div className="mt-4 space-y-3 max-h-[450px] overflow-y-auto pr-1">
            {broadcasts.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-fluid-sm">
                No campaign history found.
              </div>
            ) : (
              broadcasts.map((campaign: any) => (
                <div key={campaign.id} className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-3">
                      <span className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#EE3F57]/10">
                        <img src={notificationIcon} alt="Campaign" className="h-4 w-4 object-contain" />
                      </span>
                      <div>
                        <p className="font-semibold text-slate-800">{campaign.title}</p>
                        <p className="mt-1 text-fluid-sm text-slate-500">{campaign.content}</p>
                        <p className="mt-2 text-fluid-sm font-medium text-slate-700">Reached {campaign.sentCount} users</p>
                        <p className="text-fluid-xs text-slate-400">Target: {campaign.targetPlatform || 'All'} • Sent at {new Date(campaign.createdAt).toLocaleString('vi-VN')}</p>
                      </div>
                    </div>
                    <span className="w-fit rounded-full px-3 py-1 text-xs font-semibold bg-emerald-100 text-emerald-700">COMPLETED</span>
                  </div>
                </div>
              ))
            )}
          </div>

          <button type="button" className="mt-4 text-fluid-sm font-semibold text-[#EE3F57] hover:underline">
            View All Notification Logs
          </button>
        </article>
      </section>

      <section className="rounded-2xl bg-[#111827] px-5 py-4 text-white shadow-[0_16px_34px_-24px_rgba(0,0,0,0.35)] md:flex md:items-center md:justify-between">
        <div>
          <p className="text-fluid-xs font-semibold tracking-[0.16em] text-white/70">ENGAGEMENT PULSE</p>
          <h3 className="mt-1 text-fluid-lg font-semibold">Push Notification CTR is up 12%</h3>
          <p className="mt-1 text-fluid-sm text-white/70">User interaction quality improved after segmentation and optimized send windows.</p>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 md:mt-0">
          <div className="rounded-xl bg-white/10 px-4 py-3 text-center">
            <p className="text-fluid-lg font-bold text-white">18.2%</p>
            <p className="text-fluid-xs text-white/70">Open Rate</p>
          </div>
          <div className="rounded-xl bg-white/10 px-4 py-3 text-center">
            <p className="text-fluid-lg font-bold text-[#EE3F57]">4.5%</p>
            <p className="text-fluid-xs text-white/70">Click Rate</p>
          </div>
        </div>
      </section>
    </div>
  );
}
