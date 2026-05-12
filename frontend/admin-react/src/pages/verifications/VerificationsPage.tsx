import { useEffect, useState } from 'react';
import { adminApi } from '../../shared/services/api';

export default function VerificationsPage() {
  const [list, setList] = useState<any[]>([]);

  useEffect(() => {
    adminApi.getPendingVerifications().then(res => setList(res.data));
  }, []);

  const handleApprove = async (id: string) => {
      await adminApi.approveVerification(id);
      alert('Đã phê duyệt');
      setList(list.filter(x => x.id !== id));
  };

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-bold text-slate-800">KYC Verifications</h2>
        <p className="text-slate-500">Duyệt hồ sơ xác thực danh tính người dùng</p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        {list.length === 0 && <p className="text-slate-400">Không có hồ sơ nào chờ duyệt.</p>}
        {list.map(v => (
          <article key={v.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
             <div className="flex justify-between items-start mb-4">
                <div>
                   <h3 className="font-bold text-slate-800">{v.fullName}</h3>
                   <p className="text-sm text-slate-500">ID: {v.idNumber}</p>
                </div>
                <span className="bg-orange-100 text-orange-600 px-2 py-1 rounded text-xs font-bold">PENDING</span>
             </div>
             
             <div className="grid grid-cols-2 gap-2 mb-4">
                <img src={v.frontImageUrl} alt="Front" className="rounded-lg h-32 w-full object-cover border" />
                <img src={v.backImageUrl} alt="Back" className="rounded-lg h-32 w-full object-cover border" />
             </div>

             <div className="flex gap-2">
                <button 
                    onClick={() => handleApprove(v.id)}
                    className="flex-1 bg-emerald-500 text-white py-2 rounded-xl font-semibold hover:bg-emerald-600 transition"
                >
                    Phê duyệt
                </button>
                <button className="flex-1 border border-slate-200 py-2 rounded-xl font-semibold hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition">
                    Từ chối
                </button>
             </div>
          </article>
        ))}
      </div>
    </div>
  );
}
