import notificationIcon from '../../assets/notification.png';
import monthlyActiveIcon from '../../assets/Monthly-Active.png';

export default function NotificationsPage() {
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

            <form className="mt-4 space-y-4">
              <div>
                <label htmlFor="title" className="mb-1.5 block text-fluid-sm font-medium text-slate-600">Title</label>
                <input
                  id="title"
                  type="text"
                  placeholder="Input Title"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-fluid-sm outline-none transition focus:border-[#EE3F57] focus:ring-4 focus:ring-[#EE3F57]/15"
                />
              </div>

              <div>
                <label htmlFor="message" className="mb-1.5 block text-fluid-sm font-medium text-slate-600">Message Body</label>
                <textarea
                  id="message"
                  rows={5}
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
                    defaultValue=""
                  >
                    <option value="" disabled>Select segment</option>
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
                    defaultValue=""
                  >
                    <option value="" disabled>Select schedule</option>
                    <option value="now">Send now</option>
                    <option value="later">Schedule later</option>
                  </select>
                </div>
              </div>

              <button
                type="button"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#EE3F57] px-4 py-3 text-fluid-sm font-semibold text-white transition hover:bg-[#d63249]"
              >
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
                  <path d="M3 12h14m0 0-4-4m4 4-4 4M19 5l2 2-2 2M19 15l2 2-2 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Launch Notification
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

          <div className="mt-4 space-y-3">
            {[
              {
                title: 'Weekend Match Boost',
                status: 'COMPLETED',
                description: 'Special campaign for high-intent users with profile recommendations.',
                reached: 'Reached 84,200 users',
                meta: 'Target: Active Segment • Sent 09:30 AM',
                statusClass: 'bg-emerald-100 text-emerald-700',
              },
              {
                title: 'Profile Completion Reminder',
                status: 'SCHEDULED',
                description: 'Automated reminder for users with less than 60% profile completion.',
                reached: 'Estimated reach: 29,500 users',
                meta: 'Target: Incomplete Profiles • Tomorrow 08:00 AM',
                statusClass: 'bg-sky-100 text-sky-700',
              },
              {
                title: 'Safety Guideline Update',
                status: 'COMPLETED',
                description: 'Policy update for safer conversations and verified account usage.',
                reached: 'Reached 112,340 users',
                meta: 'Target: All Users • Sent 06:00 PM',
                statusClass: 'bg-emerald-100 text-emerald-700',
              },
            ].map((campaign) => (
              <div key={campaign.title} className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-3">
                    <span className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#EE3F57]/10">
                      <img src={notificationIcon} alt="Campaign" className="h-4 w-4 object-contain" />
                    </span>
                    <div>
                      <p className="font-semibold text-slate-800">{campaign.title}</p>
                      <p className="mt-1 text-fluid-sm text-slate-500">{campaign.description}</p>
                      <p className="mt-2 text-fluid-sm font-medium text-slate-700">{campaign.reached}</p>
                      <p className="text-fluid-xs text-slate-400">{campaign.meta}</p>
                    </div>
                  </div>
                  <span className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${campaign.statusClass}`}>{campaign.status}</span>
                </div>
              </div>
            ))}
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
