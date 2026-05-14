import { useEffect, useState } from 'react';
import { adminApi } from '../../shared/services/api';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    adminApi.getAuditLogs().then(res => {
      const sorted = res.data.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setLogs(sorted);
    });
  }, []);

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-bold text-slate-800">Admin Audit Logs</h2>
        <p className="text-slate-500">Record of all administrative actions performed by staff</p>
      </header>

      <section className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Timestamp</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Admin</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Action</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Target</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 transition text-sm">
                  <td className="px-6 py-4 text-slate-500">{new Date(log.createdAt).toLocaleString()}</td>
                  <td className="px-6 py-4 font-semibold text-slate-700">{log.actorEmail}</td>
                  <td className="px-6 py-4">
                    <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-[10px] font-bold">
                        {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs">{log.targetId}</td>
                  <td className="px-6 py-4 text-slate-600">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
