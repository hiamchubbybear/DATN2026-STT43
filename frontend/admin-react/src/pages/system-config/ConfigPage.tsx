import { useEffect, useState } from 'react';
import { adminApi } from '../../shared/services/api';

type Config = {
  key: string;
  value: string;
  description: string;
};

export default function ConfigPage() {
  const [configs, setConfigs] = useState<Config[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      const res = await adminApi.getConfigs();
      setConfigs(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (key: string, newValue: string) => {
    try {
      await adminApi.updateConfig(key, newValue);
      alert('Cập nhật thành công');
      fetchConfigs();
    } catch (e) {
      alert('Cập nhật thất bại');
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-bold text-slate-800">System Configuration</h2>
        <p className="text-slate-500">Quản lý các tham số vận hành hệ thống</p>
      </header>

      <section className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Key</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Description</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Value</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {configs.map((c) => (
              <tr key={c.key} className="hover:bg-slate-50/50 transition">
                <td className="px-6 py-4 font-mono text-sm text-blue-600">{c.key}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{c.description}</td>
                <td className="px-6 py-4">
                  <input 
                    type="text" 
                    defaultValue={c.value} 
                    className="border border-slate-200 rounded-lg px-3 py-1 text-sm outline-none focus:border-[#EE3F57]"
                    onBlur={(e) => {
                        if (e.target.value !== c.value) {
                            handleUpdate(c.key, e.target.value);
                        }
                    }}
                  />
                </td>
                <td className="px-6 py-4">
                   <button className="text-xs text-[#EE3F57] font-semibold hover:underline">Update</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
