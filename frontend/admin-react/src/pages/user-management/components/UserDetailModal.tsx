import { useEffect, useState } from 'react';
import { adminApi } from '../../../shared/services/api';

type UserDetail = {
  userId: string;
  displayName: string;
  age: number;
  email: string;
  bio: string;
  location: string;
  status: 'Active' | 'Suspended' | 'Banned' | 'ShadowBanned' | string;
  createdAt: string;
  photos: string[];
};

type UserDetailModalProps = {
  userId: string;
  onClose: () => void;
  onRefresh?: () => void;
};

const statusBadgeClass: Record<string, string> = {
  Active: 'bg-emerald-100 text-emerald-600',
  Suspended: 'bg-amber-100 text-amber-600',
  Banned: 'bg-red-100 text-red-600',
  ShadowBanned: 'bg-slate-200 text-slate-600',
};

export default function UserDetailModal({ userId, onClose, onRefresh }: UserDetailModalProps) {
  const [data, setData] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [notifyTitle, setNotifyTitle] = useState('Safety Warning');
  const [notifyContent, setNotifyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await adminApi.getUserDetails(userId);
        setData(res.data);
      } catch (e) {
        console.error(e);
        alert('Failed to fetch user details');
        onClose();
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  if (loading || !data) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="rounded-3xl bg-white px-8 py-6 text-sm font-semibold text-slate-500">
          Loading user details...
        </div>
      </div>
    );
  }

  const isBanned = data.status === 'Banned';
  const isVerified = data.status === 'Active';
  const badgeClass = statusBadgeClass[data.status] ?? 'bg-slate-100 text-slate-600';

  const handleQuickBan = async () => {
    const reason = window.prompt('Reason for permanent ban:', 'Community standards violation');
    if (!reason) return;
    setIsSubmitting(true);
    try {
      await adminApi.quickBan(data.userId, reason);
      alert('User banned immediately');
      if (onRefresh) onRefresh();
      onClose();
    } catch (e) {
      console.error(e);
      alert('Quick ban failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendNotification = async () => {
    if (!notifyContent.trim()) return;
    setIsSubmitting(true);
    try {
      await adminApi.sendNotification(data.userId, notifyTitle, notifyContent);
      alert('Notification sent successfully');
      setShowNotifyModal(false);
    } catch (e) {
      console.error(e);
      alert('Failed to send notification');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-4xl rounded-[40px] bg-white p-8 shadow-2xl animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">User Profile</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">ID: {data.userId}</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-100 rounded-full transition-colors">
            <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5">
            <div className="relative mb-8">
              <img
                src={data.photos?.[0] || 'https://via.placeholder.com/400'}
                alt="Avatar"
                className="w-full aspect-square rounded-[32px] object-cover shadow-2xl border-4 border-white"
              />
              {isVerified && (
                <span className="absolute -bottom-3 -right-3 bg-emerald-500 text-white p-3 rounded-full border-4 border-white shadow-xl">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                  </svg>
                </span>
              )}
            </div>

            <div className="bg-slate-50 rounded-[32px] p-8 border border-slate-100 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setShowNotifyModal(true)}
                  className="bg-white border border-slate-200 text-slate-600 font-bold py-4 rounded-2xl hover:border-slate-400 transition text-xs uppercase tracking-widest shadow-sm"
                >
                  Send Notif
                </button>
                {!isBanned && (
                  <button
                    onClick={handleQuickBan}
                    className="bg-black text-white font-bold py-4 rounded-2xl hover:bg-black/80 transition text-xs uppercase tracking-widest shadow-lg shadow-slate-200"
                  >
                    Quick Ban
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-10">
            <section className="grid grid-cols-2 gap-4">
              <div className="p-6 bg-slate-50 rounded-[24px] border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Email</p>
                <p className="text-slate-800 font-bold truncate">{data.email || 'N/A'}</p>
              </div>
              <div className="p-6 bg-slate-50 rounded-[24px] border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Display Name</p>
                <p className="text-slate-800 font-bold text-lg">{data.displayName || 'N/A'}</p>
              </div>
            </section>

            <section>
              <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4">Profile Insights</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-50 p-4 rounded-[20px] border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Age</p>
                  <p className="text-sm font-bold text-slate-700">{data.age || 'N/A'}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-[20px] border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Location</p>
                  <p className="text-sm font-bold text-slate-700 truncate">{data.location || 'N/A'}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-[20px] border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Status</p>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase ${badgeClass}`}>
                    {data.status}
                  </span>
                </div>
              </div>
            </section>

            <section>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Bio / About</p>
              <div className="p-6 bg-slate-50 rounded-[24px] border border-slate-100 min-h-[120px] leading-relaxed text-slate-700 italic text-sm">
                "{data.bio || "This user hasn't written a bio yet."}"
              </div>
            </section>

            <section>
              <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4">Media Library ({data.photos?.length || 0})</h4>
              <div className="grid grid-cols-4 gap-3">
                {data.photos?.map((url, idx) => (
                  <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden shadow-sm border border-slate-100">
                    <img src={url} className="w-full h-full object-cover" alt={`Photo ${idx + 1}`} />
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Notify Modal */}
      {showNotifyModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-[32px] bg-white p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-black text-slate-800 tracking-tight">Direct Notification</h3>
            <p className="mt-1 text-xs font-bold text-slate-400 uppercase tracking-widest">To: {data.displayName || data.email}</p>

            <div className="mt-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Message Title</label>
                <input
                  type="text"
                  value={notifyTitle}
                  onChange={e => setNotifyTitle(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 p-4 text-sm font-bold outline-none focus:border-[#EE3F57] transition"
                  placeholder="e.g. Safety Warning"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Message Content</label>
                <textarea
                  value={notifyContent}
                  onChange={e => setNotifyContent(e.target.value)}
                  className="w-full h-40 rounded-2xl border border-slate-200 p-4 text-sm outline-none focus:border-[#EE3F57] transition resize-none leading-relaxed"
                  placeholder="Write your message here..."
                />
              </div>
            </div>

            <div className="mt-8 flex gap-4">
              <button onClick={() => setShowNotifyModal(false)} className="flex-1 py-4 rounded-2xl font-bold text-slate-400 hover:text-slate-600 transition uppercase tracking-widest text-xs">Cancel</button>
              <button
                onClick={handleSendNotification}
                disabled={isSubmitting}
                className="flex-2 rounded-2xl bg-black py-4 text-xs font-black text-white hover:bg-black/90 disabled:opacity-50 transition active:scale-95 shadow-lg shadow-slate-200 uppercase tracking-widest"
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
