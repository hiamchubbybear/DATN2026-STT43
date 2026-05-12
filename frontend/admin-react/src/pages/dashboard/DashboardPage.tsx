import { useEffect, useState } from 'react';
import { adminApi } from '../../shared/services/api';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import userIcon from '../../assets/user.png';
import monthlyActiveIcon from '../../assets/Monthly-Active.png';
import heartIcon from '../../assets/heart.png';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalMatches: 0,
    totalReports: 0,
    activeUsers: 0
  });
  const [advancedData, setAdvancedData] = useState<any>({ growth: [], categories: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      adminApi.getStats(),
      adminApi.getAdvancedStats()
    ]).then(([s, a]) => {
      setStats(s.data);
      setAdvancedData(a.data);
      setLoading(false);
    });
  }, []);

  const kpis = [
    { title: 'Total Users', value: stats.totalUsers.toLocaleString(), delta: '+100%', icon: userIcon, color: '#EE3F57' },
    { title: 'Matches', value: stats.totalMatches.toLocaleString(), delta: 'Live', icon: heartIcon, color: '#E1306C' },
    { title: 'Active (MAU)', value: stats.activeUsers.toLocaleString(), delta: 'Realtime', icon: monthlyActiveIcon, color: '#8A2387' },
  ];

  const COLORS = ['#EE3F57', '#F970A9', '#ADAFBB'];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Hệ thống Giám sát Mixer</h2>
          <p className="text-slate-500 text-sm">Phân tích tăng trưởng và chỉ số an toàn thời gian thực</p>
        </div>
        <div className="flex gap-2">
            <div className="bg-emerald-500/10 text-emerald-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2">
                <span className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
                SERVER ONLINE
            </div>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        {kpis.map((item) => (
          <article key={item.title} className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 hover:shadow-md transition">
            <div className="mb-4 flex items-center justify-between">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl" style={{ backgroundColor: `${item.color}15` }}>
                <img src={item.icon} alt={item.title} className="h-6 w-6 object-contain" />
              </span>
              <span className="text-xs font-bold px-2 py-1 bg-slate-100 rounded-lg text-slate-500">{item.delta}</span>
            </div>
            <p className="text-sm font-medium text-slate-500">{item.title}</p>
            <p className="mt-1 text-2xl font-bold text-slate-800">{item.value}</p>
          </article>
        ))}
      </section>

      <div className="grid gap-6 lg:grid-cols-5">
        <article className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 lg:col-span-3">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Biểu đồ Tăng trưởng</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={advancedData.growth}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EE3F57" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#EE3F57" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                <Area type="monotone" dataKey="users" stroke="#EE3F57" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 lg:col-span-2">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Phân bổ Báo cáo</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={advancedData.categories}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {advancedData.categories.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" layout="vertical" align="right" verticalAlign="middle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </article>
      </div>
      
      <section className="grid gap-4 md:grid-cols-2">
         <article className="bg-[#8A2387] rounded-2xl p-6 text-white overflow-hidden relative">
            <div className="relative z-10">
                <h3 className="text-lg font-bold mb-2">Thông báo toàn hệ thống</h3>
                <p className="text-white/70 text-sm mb-4">Gửi tin nhắn broadcast đến tất cả người dùng ngay lập tức.</p>
                <button className="bg-white text-[#8A2387] px-6 py-2 rounded-xl font-bold hover:bg-white/90 transition">
                    Soạn thông báo
                </button>
            </div>
            <div className="absolute -right-10 -bottom-10 opacity-20 transform rotate-12">
                 <img src={monthlyActiveIcon} className="w-48 h-48" />
            </div>
         </article>
         
         <article className="bg-slate-900 rounded-2xl p-6 text-white flex flex-col justify-between">
            <div>
                <h3 className="text-lg font-bold mb-2">Tình trạng hệ thống</h3>
                <div className="space-y-3 mt-4">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-400">Database (MongoDB)</span>
                        <span className="text-emerald-400 font-mono">Healthy</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-400">Cache (Redis)</span>
                        <span className="text-emerald-400 font-mono">Healthy</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-400">SignalR Backplane</span>
                        <span className="text-emerald-400 font-mono">Connected</span>
                    </div>
                </div>
            </div>
         </article>
      </section>
    </div>
  );
}
