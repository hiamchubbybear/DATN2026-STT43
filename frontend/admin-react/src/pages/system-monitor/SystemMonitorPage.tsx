import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Database, 
  Server, 
  ShieldCheck, 
  Clock, 
  Terminal,
  RefreshCw,
  Cpu,
  HardDrive
} from 'lucide-react';
import { adminApi } from '../../shared/services/api';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

// Mock data for charts
const generateData = () => {
  const data = [];
  const now = new Date();
  for (let i = 20; i >= 0; i--) {
    data.push({
      time: new Date(now.getTime() - i * 5000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      requests: Math.floor(Math.random() * 50) + 10,
      latency: Math.floor(Math.random() * 100) + 20,
      cpu: Math.floor(Math.random() * 30) + 5,
    });
  }
  return data;
};

const SystemMonitorPage: React.FC = () => {
  const [data, setData] = useState(generateData());
  const [health, setHealth] = useState({
    status: 'Loading...',
    mongodb: '...',
    redis: '...',
    uptime: '...',
    version: '1.0.4-stable'
  });
  const [logs, setLogs] = useState<any[]>([]);

  const fetchHealth = async () => {
    try {
      const res = await adminApi.getHealth();
      const json = res.data;
      setHealth(prev => ({
        ...prev,
        status: json.status,
        mongodb: json.database,
        uptime: 'Live', // Backend logic cho uptime có thể thêm sau
        version: json.version
      }));
    } catch (e) {
      setHealth(prev => ({ ...prev, status: 'Error', mongodb: 'Offline', redis: 'Offline' }));
    }
  };

  const fetchSysInfo = async () => {
    try {
      const res = await adminApi.getSystemInfo();
      const json = res.data;
      setHealth(prev => ({ ...prev, uptime: json.uptime }));
    } catch (e) {}
  };

  const fetchLogs = async () => {
    try {
      const res = await adminApi.getLogs(50);
      const rawLogs = res.data;
      
      const parsedLogs = rawLogs.map((line: string, idx: number) => {
        // Simple fallback regex-ish
        const parts = line.match(/\[(.*?) (.*?)\] (.*)/);
        if (parts) return { id: idx, time: parts[1], level: parts[2], message: parts[3], service: 'App' };
        return { id: idx, time: '', level: 'INFO', message: line, service: 'App' };
      });
      setLogs(parsedLogs.reverse());
    } catch (e) {}
  };

  useEffect(() => {
    fetchHealth();
    fetchSysInfo();
    fetchLogs();
    
    const interval = setInterval(() => {
      fetchHealth();
      fetchLogs();
      fetchSysInfo();
      fetchLogs();
      // ... existing data generator for charts
      setData(prev => {
        const newData = [...prev.slice(1)];
        const lastTime = new Date();
        newData.push({
          time: lastTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          requests: Math.floor(Math.random() * 50) + 10,
          latency: Math.floor(Math.random() * 100) + 20,
          cpu: Math.floor(Math.random() * 30) + 5,
        });
        return newData;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">System Monitoring</h2>
          <p className="text-slate-500">Real-time performance and health overview</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm border border-slate-200 hover:bg-slate-50 transition">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-600">
          <ShieldCheck className="h-4 w-4" />
          {health.status}
        </div>
        </div>
      </header>

      {/* Health Stats */}
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
              <Database className="h-6 w-6" />
            </div>
            <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
          </div>
          <p className="text-sm font-medium text-slate-500">MongoDB Status</p>
          <p className="text-xl font-bold text-slate-800">{health.mongodb}</p>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <div className="rounded-lg bg-red-50 p-2 text-red-600">
              <Activity className="h-6 w-6" />
            </div>
            <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
          </div>
          <p className="text-sm font-medium text-slate-500">Redis Status</p>
          <p className="text-xl font-bold text-slate-800">{health.redis}</p>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <div className="rounded-lg bg-purple-50 p-2 text-purple-600">
              <Clock className="h-6 w-6" />
            </div>
          </div>
          <p className="text-sm font-medium text-slate-500">System Uptime</p>
          <p className="text-xl font-bold text-slate-800">{health.uptime}</p>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <div className="rounded-lg bg-orange-50 p-2 text-orange-600">
              <Server className="h-6 w-6" />
            </div>
          </div>
          <p className="text-sm font-medium text-slate-500">Version</p>
          <p className="text-xl font-bold text-slate-800">{health.version}</p>
        </div>
      </section>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-semibold text-slate-800">
              <Activity className="h-5 w-5 text-[#E1306C]" />
              Request Throughput
            </h3>
            <span className="text-xs font-medium text-slate-400">Requests / 5s</span>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E1306C" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#E1306C" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="time" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{fill: '#94a3b8'}}
                />
                <YAxis 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{fill: '#94a3b8'}}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="requests" 
                  stroke="#E1306C" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorRequests)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-semibold text-slate-800">
              <Cpu className="h-5 w-5 text-blue-500" />
              Resource Usage
            </h3>
            <div className="flex gap-4">
              <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <span className="h-2 w-2 rounded-full bg-blue-500"></span> CPU %
              </span>
              <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <span className="h-2 w-2 rounded-full bg-indigo-500"></span> Latency ms
              </span>
            </div>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="time" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{fill: '#94a3b8'}}
                />
                <YAxis 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{fill: '#94a3b8'}}
                />
                <Tooltip 
                   contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="cpu" 
                  stroke="#3b82f6" 
                  strokeWidth={3} 
                  dot={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="latency" 
                  stroke="#6366f1" 
                  strokeWidth={2} 
                  dot={false}
                  strokeDasharray="5 5"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </article>
      </div>

      {/* Logs Section */}
      <article className="rounded-2xl bg-slate-900 shadow-2xl overflow-hidden border border-slate-800">
        <div className="flex items-center justify-between bg-slate-800/50 px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <Terminal className="h-5 w-5 text-emerald-400" />
            <h3 className="font-semibold text-slate-200">System Logs</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 animate-pulse rounded-full bg-emerald-400"></span>
            <span className="text-xs font-mono text-emerald-400">LIVE</span>
          </div>
        </div>
        <div className="p-4 font-mono text-sm h-[300px] overflow-y-auto space-y-2">
          {logs.map((log) => (
            <div key={log.id} className="flex gap-4 group hover:bg-slate-800/30 p-1 rounded transition">
              <span className="text-slate-500 shrink-0">{log.time}</span>
              <span className={`font-bold shrink-0 w-12 ${
                log.level === 'ERROR' ? 'text-red-400' : 
                log.level === 'WARN' ? 'text-orange-400' : 
                'text-blue-400'
              }`}>{log.level}</span>
              <span className="text-emerald-500 shrink-0">[{log.service}]</span>
              <span className="text-slate-300">{log.message}</span>
            </div>
          ))}
          <div className="flex gap-4 animate-pulse">
            <span className="text-slate-700">_</span>
          </div>
        </div>
      </article>

      {/* Resource Cards */}
      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="rounded-xl bg-slate-50 p-3 text-slate-600">
            <HardDrive className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Storage Usage</p>
            <div className="mt-1 flex items-baseline gap-2">
              <p className="text-xl font-bold text-slate-800">42.8 GB</p>
              <p className="text-xs text-slate-400">/ 100 GB</p>
            </div>
            <div className="mt-2 h-1.5 w-32 rounded-full bg-slate-100">
              <div className="h-full w-[42%] rounded-full bg-emerald-500"></div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="rounded-xl bg-slate-50 p-3 text-slate-600">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Active Threads</p>
            <p className="mt-1 text-xl font-bold text-slate-800">124</p>
            <p className="text-xs text-emerald-500">Normal workload</p>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="rounded-xl bg-slate-50 p-3 text-slate-600">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Security Scans</p>
            <p className="mt-1 text-xl font-bold text-slate-800">Passed</p>
            <p className="text-xs text-slate-400">Last scan: 2h ago</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SystemMonitorPage;
