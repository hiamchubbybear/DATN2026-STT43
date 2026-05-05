import userIcon from '../../assets/user.png';
import monthlyActiveIcon from '../../assets/Monthly-Active.png';
import heartIcon from '../../assets/heart.png';

type KpiCard = {
  title: string;
  value: string;
  delta: string;
  icon: string;
};

const kpis: KpiCard[] = [
  { title: 'Total Users', value: '1,284,092', delta: '+12.5%', icon: userIcon },
  { title: 'Monthly Active', value: '842,100', delta: '+4.2%', icon: monthlyActiveIcon },
  { title: 'Successful Matches', value: '45,392', delta: '+28%', icon: heartIcon },
];

const ageDemographics = [
  { label: '18-24', male: 74, female: 61 },
  { label: '25-34', male: 92, female: 80 },
  { label: '35-44', male: 77, female: 69 },
  { label: '45-54', male: 58, female: 50 },
  { label: '55-64', male: 43, female: 36 },
  { label: '65+', male: 31, female: 26 },
];

const trendMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-fluid-xl font-bold text-slate-800">System Performance</h2>
          <p className="mt-1 text-fluid-sm text-slate-500">Real-time data orchestration across growth, safety and engagement indicators.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded-xl border border-[#D0D5DD] bg-white px-4 py-2 text-sm font-medium text-slate-600"
          >
            Last 30 Days
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl bg-[#E1306C] px-4 py-2 text-sm font-semibold text-white"
          >
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
              <path d="M12 4v10m0 0 4-4m-4 4-4-4M5 18h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Export PDF
          </button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {kpis.map((item) => (
          <article key={item.title} className="rounded-2xl bg-white p-5 shadow-[0_16px_34px_-24px_rgba(0,0,0,0.16)]">
            <div className="mb-4 flex items-center justify-between">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E1306C]/10">
                <img src={item.icon} alt={item.title} className="h-7 w-7 object-contain" />
              </span>
              <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">{item.delta}</span>
            </div>
            <p className="text-fluid-sm text-slate-500">{item.title}</p>
            <p className="mt-1 text-fluid-lg font-bold text-slate-800">{item.value}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-5">
        <article className="rounded-2xl bg-white p-5 shadow-[0_16px_34px_-24px_rgba(0,0,0,0.16)] xl:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-fluid-base font-semibold text-slate-800">User Growth Momentum</h3>
            <span className="rounded-full bg-[#E1306C]/10 px-3 py-1 text-fluid-xs font-semibold text-[#E1306C]">2024 Year to Date</span>
          </div>
          <div className="rounded-xl bg-gradient-to-b from-[#E1306C]/10 to-white p-3">
            <svg viewBox="0 0 600 260" className="h-56 w-full">
              <defs>
                <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#E1306C" stopOpacity="0.32" />
                  <stop offset="100%" stopColor="#E1306C" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M20 210 C80 180, 120 190, 170 150 C220 110, 270 130, 330 95 C390 60, 440 80, 500 45 C530 28, 555 35, 580 25 L580 240 L20 240 Z"
                fill="url(#trendGradient)"
              />
              <path
                d="M20 210 C80 180, 120 190, 170 150 C220 110, 270 130, 330 95 C390 60, 440 80, 500 45 C530 28, 555 35, 580 25"
                stroke="#E1306C"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
              />
              {trendMonths.map((month, index) => (
                <text key={month} x={40 + index * 78} y={254} fontSize="12" fill="#98A2B3">
                  {month}
                </text>
              ))}
            </svg>
          </div>
        </article>

        <article className="rounded-2xl bg-white p-5 shadow-[0_16px_34px_-24px_rgba(0,0,0,0.16)] xl:col-span-2">
          <h3 className="mb-4 text-fluid-base font-semibold text-slate-800">Safety Report Distribution</h3>
          <div className="flex flex-col items-center">
            <div className="relative h-48 w-48 rounded-full bg-[conic-gradient(#E1306C_0_65%,#F970A9_65%_90%,#F2F4F7_90%_100%)] p-7">
              <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-white text-center">
                <p className="text-fluid-xs text-slate-500">2.4k</p>
                <p className="text-fluid-sm font-semibold text-slate-700">TOTAL REPORTS</p>
              </div>
            </div>
            <div className="mt-5 grid w-full gap-2 text-fluid-sm text-slate-600">
              <p className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#E1306C]" />Harassment (65%)</p>
              <p className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#F970A9]" />Fake Profile (25%)</p>
              <p className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#D0D5DD]" />Other (10%)</p>
            </div>
          </div>
        </article>
      </section>

      <section className="rounded-2xl bg-white p-5 shadow-[0_16px_34px_-24px_rgba(0,0,0,0.16)]">
        <h3 className="mb-4 text-fluid-base font-semibold text-slate-800">Age Demographics</h3>
        <div className="grid grid-cols-3 gap-3 md:grid-cols-6">
          {ageDemographics.map((item) => (
            <div key={item.label} className="flex flex-col items-center">
              <div className="mb-2 flex h-44 w-full max-w-[70px] items-end gap-1 rounded-xl bg-[#F8F9FB] p-2">
                <div className="w-1/2 rounded-t bg-[#D92D20]" style={{ height: `${item.male}%` }} />
                <div className="w-1/2 rounded-t bg-[#F970A9]" style={{ height: `${item.female}%` }} />
              </div>
              <span className="text-fluid-xs font-medium text-slate-500">{item.label}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-5 text-fluid-sm text-slate-600">
          <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#D92D20]" />Male</span>
          <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#F970A9]" />Female</span>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl bg-white p-5 shadow-[0_16px_34px_-24px_rgba(0,0,0,0.16)]">
          <h3 className="text-fluid-base font-semibold text-slate-800">Insights of the Day</h3>
          <p className="mt-2 text-fluid-sm leading-6 text-slate-600">
            Peak user sessions appear between 20:00 and 22:00, with profile-complete users showing 1.8x higher engagement and faster first-match conversion.
          </p>
        </article>

        <article className="rounded-2xl bg-white p-5 shadow-[0_16px_34px_-24px_rgba(0,0,0,0.16)]">
          <h3 className="text-fluid-base font-semibold text-slate-800">Moderation Health</h3>
          <p className="mt-2 text-fluid-sm leading-6 text-slate-600">
            AI moderation currently auto-resolves 82% of flagged cases with low false-positive rates, while manual escalation SLA remains under 2 hours.
          </p>
        </article>
      </section>
    </div>
  );
}
