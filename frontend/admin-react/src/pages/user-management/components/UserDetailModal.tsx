import { useState } from 'react';
import { adminApi } from '../../../shared/services/api';

type UserDetailModalProps = {
  data: any;
  onClose: () => void;
  onRefresh?: () => void;
};

export default function UserDetailModal({ data, onClose, onRefresh }: UserDetailModalProps) {
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [notifyTitle, setNotifyTitle] = useState('Safety Warning');
  const [notifyContent, setNotifyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!data) return null;

  const { user, profile } = data;

  const handleDeletePhoto = async (photoId: string) => {
    if (window.confirm('Are you sure you want to delete this photo?')) {
      try {
        await adminApi.deletePhoto(user.id, photoId);
        alert('Photo deleted successfully');
        if (onRefresh) onRefresh();
        onClose();
      } catch (e) {
        alert('Failed to delete photo');
      }
    }
  };

  const handleQuickBan = async () => {
    const reason = window.prompt("Reason for permanent ban:", "Community standards violation");
    if (!reason) return;
    
    setIsSubmitting(true);
    try {
        await adminApi.quickBan(user.id, reason);
        alert("User banned immediately");
        if (onRefresh) onRefresh();
        onClose();
    } catch (e) {
        alert("Quick ban failed");
    } finally {
        setIsSubmitting(false);
    }
  }

  const handleSendNotification = async () => {
    if (!notifyContent.trim()) return;
    setIsSubmitting(true);
    try {
        await adminApi.sendNotification(user.id, notifyTitle, notifyContent);
        alert("Notification sent successfully");
        setShowNotifyModal(false);
    } catch (e) {
        alert("Failed to send notification");
    } finally {
        setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-4xl rounded-[40px] bg-white p-8 shadow-2xl animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">User Profile</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">ID: {user.id}</p>
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
                 src={profile?.photos?.find((p: any) => p.isPrimary)?.url || 'https://via.placeholder.com/400'} 
                 alt="Avatar" 
                 className="w-full aspect-square rounded-[32px] object-cover shadow-2xl border-4 border-white"
               />
               {user.isVerified && (
                 <span className="absolute -bottom-3 -right-3 bg-emerald-500 text-white p-3 rounded-full border-4 border-white shadow-xl">
                   <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>
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
                    {!user.isBanned && (
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
                    <p className="text-slate-800 font-bold truncate">{user.email}</p>
                </div>
                <div className="p-6 bg-slate-50 rounded-[24px] border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Display Name</p>
                    <p className="text-slate-800 font-bold text-lg">{profile?.basicInfo?.displayName || 'N/A'}</p>
                </div>
            </section>

            <section>
               <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4">Profile Insights</h4>
               <div className="grid grid-cols-3 gap-4">
                  <div className="bg-slate-50 p-4 rounded-[20px] border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Birthday</p>
                    <p className="text-sm font-bold text-slate-700">{profile?.basicInfo?.dob ? new Date(profile.basicInfo.dob).toLocaleDateString() : 'N/A'}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-[20px] border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Gender</p>
                    <p className="text-sm font-bold text-slate-700">{profile?.basicInfo?.gender === 1 ? 'Male' : profile?.basicInfo?.gender === 2 ? 'Female' : 'Other'}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-[20px] border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Status</p>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${user.isBanned ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                        {user.isBanned ? 'BANNED' : 'ACTIVE'}
                    </span>
                  </div>
               </div>
            </section>

            <section>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Bio / About</p>
              <div className="p-6 bg-slate-50 rounded-[24px] border border-slate-100 min-h-[120px] leading-relaxed text-slate-700 italic text-sm">
                "{profile?.bio || "This user hasn't written a bio yet."}"
              </div>
            </section>

            <section>
               <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4">Media Library ({profile?.photos?.length || 0})</h4>
               <div className="grid grid-cols-4 gap-3">
                  {profile?.photos?.map((photo: any) => (
                    <div key={photo.id} className="relative group aspect-square rounded-2xl overflow-hidden shadow-sm border border-slate-100">
                      <img src={photo.url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="User upload" />
                      <button 
                        onClick={() => handleDeletePhoto(photo.id)}
                        className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
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
            <p className="mt-1 text-xs font-bold text-slate-400 uppercase tracking-widest">To: {profile?.basicInfo?.displayName || user.email}</p>
            
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
