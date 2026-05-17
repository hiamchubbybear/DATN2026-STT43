import { useEffect, useState } from 'react';
import { adminApi } from '../../shared/services/api';
import heartIcon from '../../assets/heart.png';

export default function ReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [page, setPage] = useState(1);
  const pageSize = 5;

  // Modal State
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [adminFeedback, setAdminFeedback] = useState('');
  const [banUser, setBanUser] = useState(false);
  const [banReason, setBanReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Notification State
  const [notifyTitle, setNotifyTitle] = useState('Safety Warning');
  const [notifyContent, setNotifyContent] = useState('');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
        setLoading(true);
        const res = await adminApi.getReports();
        setReports(res.data);
    } catch (e) {
        console.error(e);
    } finally {
        setLoading(false);
    }
  };

  const handleOpenResolve = (id: string) => {
    setSelectedReportId(id);
    setAdminFeedback('');
    setBanUser(false);
    setBanReason('');
    setShowResolveModal(true);
  };

  const handleResolveSubmit = async () => {
    if (!selectedReportId) return;
    setIsSubmitting(true);
    try {
        await adminApi.resolveReport(selectedReportId, {
            adminFeedback,
            banUser,
            banReason: banUser ? (banReason || 'Banned for community standards violation') : undefined
        });
        alert('Report resolved successfully');
        setShowResolveModal(false);
        setSelectedReport(null);
        fetchReports();
    } catch (e) {
        alert('Error resolving report');
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleQuickBan = async (userId: string) => {
    const reason = window.prompt("Reason for permanent ban:", "Repeated community violations");
    if (!reason) return;
    
    setIsSubmitting(true);
    try {
        await adminApi.quickBan(userId, reason);
        alert("User banned immediately");
        setSelectedReport(null);
        fetchReports();
    } catch (e) {
        alert("Quick ban failed");
    } finally {
        setIsSubmitting(false);
    }
  }

  const handleSendNotification = async () => {
    if (!selectedReport || !notifyContent.trim()) return;
    setIsSubmitting(true);
    try {
        await adminApi.sendNotification(selectedReport.targetUserId, notifyTitle, notifyContent);
        alert("Notification sent to target user");
        setShowNotifyModal(false);
    } catch (e) {
        alert("Failed to send notification");
    } finally {
        setIsSubmitting(false);
    }
  }

  const handleDismiss = async (id: string) => {
    if (!window.confirm('Are you sure you want to dismiss this report?')) return;
    try {
        await adminApi.dismissReport(id);
        alert('Report dismissed successfully');
        setSelectedReport(null);
        fetchReports();
    } catch (e) {
        alert('Error dismissing report');
    }
  };

  const filteredRows = activeTab === 'ALL' 
    ? reports 
    : reports.filter(r => r.reason?.toUpperCase().includes(activeTab));

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const from = filteredRows.length === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, filteredRows.length);
  const paginatedRows = filteredRows.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-6 bg-[#F3F3F3] min-h-screen p-6">
      <section className="grid gap-4 xl:grid-cols-5">
        <article className="relative overflow-hidden rounded-[24px] bg-white p-6 shadow-sm border border-slate-100 xl:col-span-3">
          <h3 className="text-xl font-bold text-slate-800">Community Moderation</h3>
          <p className="mt-2 text-sm text-slate-500 leading-relaxed max-w-xl">
            Review user-submitted reports regarding profile violations, harassment, or inappropriate content.
          </p>

          <div className="mt-6 flex items-center gap-12">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Resolution Speed</p>
              <p className="text-2xl font-black text-[#EE3F57]">12m avg</p>
            </div>
            <div className="w-px h-8 bg-slate-100" />
            <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Queue</p>
                <p className="text-2xl font-black text-slate-800">{reports.filter(r => r.status === 0).length}</p>
            </div>
          </div>

          <div className="pointer-events-none absolute -right-4 -top-4 flex gap-2 opacity-10 rotate-12">
            <div className="h-24 w-24 rounded-3xl bg-[#EE3F57]" />
            <div className="mt-8 h-20 w-20 rounded-2xl bg-[#F27121]" />
          </div>
        </article>

        <article className="rounded-[24px] bg-[#EE3F57] p-6 text-white shadow-lg shadow-rose-200 xl:col-span-2 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold">Urgent Queue</h3>
            <p className="mt-1 text-sm text-white/80">High-priority reports requiring immediate attention.</p>
          </div>
          <button className="mt-4 w-full bg-white text-[#EE3F57] font-bold py-3 rounded-2xl hover:bg-white/90 transition active:scale-95 text-sm shadow-sm">
            Quick Review
          </button>
        </article>
      </section>

      <section className="rounded-[24px] bg-white p-6 shadow-sm border border-slate-100">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-bold text-slate-800">Reports Log</h3>
            <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100">
                {['ALL', 'HIGH'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => { setActiveTab(tab); setPage(1); }}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === tab ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        {tab === 'ALL' ? 'ALL REPORTS' : 'HIGH PRIORITY'}
                    </button>
                ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-y-3">
            <thead>
              <tr className="text-left text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                <th className="px-4 py-2">Reporter</th>
                <th className="px-4 py-2">Target User</th>
                <th className="px-4 py-2">Preview</th>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2 text-center">Status</th>
                <th className="px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#EE3F57] mx-auto"></div></td></tr>
              ) : paginatedRows.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-20 text-slate-400 font-medium">No reports found.</td></tr>
              ) : (
                paginatedRows.map((row) => (
                  <tr key={row.id} className="bg-slate-50/50 hover:bg-slate-50 transition-colors group">
                    <td className="rounded-l-[20px] px-4 py-4">
                        <div className="flex items-center gap-3">
                            {row.reporterAvatar ? (
                                <img src={row.reporterAvatar} alt="Reporter" className="h-9 w-9 rounded-full object-cover border border-slate-100 shadow-sm" />
                            ) : (
                                <div className="h-9 w-9 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center font-black text-xs text-[#EE3F57] shadow-sm">
                                    {(row.reporterName || 'U').substring(0, 2).toUpperCase()}
                                </div>
                            )}
                            <div className="flex flex-col min-w-0">
                                <span className="text-xs font-bold text-slate-800 truncate max-w-[120px]">{row.reporterName || 'Unknown User'}</span>
                                <span className="text-[10px] text-slate-400 truncate max-w-[120px]" title={row.reporterEmail}>{row.reporterEmail || 'No Email'}</span>
                            </div>
                        </div>
                    </td>
                    <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                            {row.targetUserAvatar ? (
                                <img src={row.targetUserAvatar} alt="Target" className="h-9 w-9 rounded-full object-cover border border-slate-100 shadow-sm" />
                            ) : (
                                <div className="h-9 w-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-600 shadow-sm">
                                    {(row.targetUserName || 'U').substring(0, 2).toUpperCase()}
                                </div>
                            )}
                            <div className="flex flex-col min-w-0">
                                <span className="text-xs font-bold text-slate-800 truncate max-w-[120px]">{row.targetUserName || 'Unknown User'}</span>
                                <span className="text-[10px] text-slate-400 truncate max-w-[120px]" title={row.targetUserEmail}>{row.targetUserEmail || 'No Email'}</span>
                            </div>
                        </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="max-w-[200px]">
                        <p className="text-xs font-bold text-slate-700 truncate">{row.reason}</p>
                        <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{row.description || 'No description'}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-xs font-medium text-slate-500">{new Date(row.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-4">
                        <div className="flex justify-center">
                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${row.status === 0 ? 'bg-amber-100 text-amber-600' : row.status === 1 ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                                {row.status === 0 ? 'Pending' : row.status === 1 ? 'Resolved' : 'Dismissed'}
                            </span>
                        </div>
                    </td>
                    <td className="rounded-r-[20px] px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                            onClick={() => { setSelectedReport(row); setSelectedReportId(row.id); }}
                            className="bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-[10px] font-bold text-slate-600 hover:border-[#EE3F57] hover:text-[#EE3F57] transition-all shadow-sm"
                        >
                            VIEW
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-8 flex flex-col gap-4 text-[11px] font-bold text-slate-400 md:flex-row md:items-center md:justify-between border-t border-slate-50 pt-6">
          <p className="uppercase tracking-widest">Showing {from}-{to} of {filteredRows.length} cases</p>
          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
              <button
                key={pageNumber}
                onClick={() => setPage(pageNumber)}
                className={`h-8 w-8 rounded-xl transition-all ${
                  pageNumber === page ? 'bg-[#EE3F57] text-white shadow-lg shadow-rose-200' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                }`}
              >
                {pageNumber}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Detail Modal */}
      {selectedReport && !showResolveModal && !showNotifyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-[40px] w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                    <div>
                        <h3 className="text-2xl font-black text-slate-800 tracking-tight">Report Details</h3>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Submitted on {new Date(selectedReport.createdAt).toLocaleString()}</p>
                    </div>
                    <button 
                        onClick={() => setSelectedReport(null)}
                        className="p-3 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-8">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="p-5 bg-slate-50 rounded-[24px] border border-slate-100 flex items-start gap-4">
                            {selectedReport.reporterAvatar ? (
                                <img src={selectedReport.reporterAvatar} alt="Reporter" className="h-12 w-12 rounded-full object-cover border-2 border-white shadow-md" />
                            ) : (
                                <div className="h-12 w-12 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center font-black text-sm text-[#EE3F57] shadow-sm">
                                    {(selectedReport.reporterName || 'U').substring(0, 2).toUpperCase()}
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Reporter</p>
                                <p className="font-bold text-slate-800 text-sm truncate">{selectedReport.reporterName || 'Unknown User'}</p>
                                <p className="text-xs text-slate-500 truncate mb-1">{selectedReport.reporterEmail || 'No Email'}</p>
                                <p className="font-mono text-[9px] text-slate-400 truncate" title={selectedReport.reporterId}>ID: {selectedReport.reporterId}</p>
                            </div>
                        </div>
                        <div className="p-5 bg-slate-50 rounded-[24px] border border-slate-100 flex items-start gap-4">
                            {selectedReport.targetUserAvatar ? (
                                <img src={selectedReport.targetUserAvatar} alt="Target" className="h-12 w-12 rounded-full object-cover border-2 border-white shadow-md" />
                            ) : (
                                <div className="h-12 w-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-black text-sm text-slate-600 shadow-sm">
                                    {(selectedReport.targetUserName || 'U').substring(0, 2).toUpperCase()}
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Target User</p>
                                <p className="font-bold text-slate-800 text-sm truncate">{selectedReport.targetUserName || 'Unknown User'}</p>
                                <p className="text-xs text-slate-500 truncate mb-1">{selectedReport.targetUserEmail || 'No Email'}</p>
                                <p className="font-mono text-[9px] text-slate-400 truncate" title={selectedReport.targetUserId}>ID: {selectedReport.targetUserId}</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-red-50 rounded-[24px] border border-red-100 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-red-400" />
                        <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-2">Primary Violation</p>
                        <p className="text-lg font-black text-red-800">{selectedReport.reason}</p>
                    </div>

                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Incident Description</p>
                        <div className="p-6 bg-white border border-slate-100 rounded-[24px] text-slate-700 leading-relaxed text-sm shadow-sm italic">
                            "{selectedReport.description || "No further description provided by the reporter."}"
                        </div>
                    </div>

                    {selectedReport.evidencePhotos && selectedReport.evidencePhotos.length > 0 ? (
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Evidence Photos ({selectedReport.evidencePhotos.length})</p>
                            <div className="grid grid-cols-2 gap-4">
                                {selectedReport.evidencePhotos.map((url: string, idx: number) => (
                                    <div key={idx} className="relative aspect-square rounded-[24px] overflow-hidden border-2 border-slate-50 shadow-sm group">
                                        <img 
                                            src={url} 
                                            alt={`Evidence ${idx + 1}`} 
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 cursor-pointer"
                                            onClick={() => window.open(url, '_blank')}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="p-12 text-center border-2 border-dashed border-slate-100 rounded-[24px]">
                            <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">No evidence photos attached</p>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                        <button 
                            onClick={() => setShowNotifyModal(true)}
                            className="bg-slate-100 text-slate-600 font-bold py-3 rounded-2xl hover:bg-slate-200 transition text-xs uppercase tracking-widest"
                        >
                            Send Warning Notif
                        </button>
                        <button 
                            onClick={() => handleQuickBan(selectedReport.targetUserId)}
                            className="bg-black text-white font-bold py-3 rounded-2xl hover:bg-black/90 transition text-xs uppercase tracking-widest"
                        >
                            Immediate Ban
                        </button>
                    </div>
                </div>

                <div className="p-8 bg-slate-50 border-t border-slate-100 flex gap-4">
                    {selectedReport.status === 0 ? (
                        <>
                            <button 
                                onClick={() => handleDismiss(selectedReport.id)}
                                className="flex-1 py-4 rounded-[20px] font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 transition"
                            >
                                Dismiss
                            </button>
                            <button 
                                onClick={() => handleOpenResolve(selectedReport.id)}
                                className="flex-2 bg-[#EE3F57] text-white px-10 py-4 rounded-[20px] font-bold hover:opacity-90 transition active:scale-95 shadow-lg shadow-rose-200"
                            >
                                Resolve Case
                            </button>
                        </>
                    ) : (
                        <button 
                            onClick={() => setSelectedReport(null)}
                            className="w-full py-4 rounded-[20px] font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 transition"
                        >
                            Close
                        </button>
                    )}
                </div>
            </div>
        </div>
      )}

      {/* Resolve Modal */}
      {showResolveModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-[32px] bg-white p-8 shadow-2xl">
            <h3 className="text-2xl font-black text-slate-800 tracking-tight">Resolve Case</h3>
            <div className="mt-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Admin Feedback</label>
                <textarea
                  value={adminFeedback}
                  onChange={(e) => setAdminFeedback(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 p-4 text-sm outline-none focus:border-[#EE3F57] transition resize-none h-32"
                />
              </div>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" checked={banUser} onChange={(e) => setBanUser(e.target.checked)} className="h-5 w-5 rounded-lg accent-[#EE3F57]" />
                <span className="text-sm font-bold text-slate-700">Ban target user?</span>
              </label>
            </div>
            <div className="mt-8 flex gap-4">
              <button onClick={() => setShowResolveModal(false)} className="flex-1 py-4 rounded-2xl font-bold text-slate-400">Cancel</button>
              <button onClick={handleResolveSubmit} disabled={isSubmitting} className="flex-2 rounded-2xl bg-[#EE3F57] py-4 text-sm font-black text-white">Confirm</button>
            </div>
          </div>
        </div>
      )}

      {/* Notify Modal */}
      {showNotifyModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4">
          <div className="w-full max-w-md rounded-[32px] bg-white p-8 shadow-2xl">
            <h3 className="text-2xl font-black text-slate-800">Send Notification</h3>
            <div className="mt-6 space-y-4">
              <input 
                type="text" 
                value={notifyTitle} 
                onChange={e => setNotifyTitle(e.target.value)} 
                className="w-full rounded-xl border border-slate-200 p-4 text-sm font-bold"
                placeholder="Title"
              />
              <textarea 
                value={notifyContent} 
                onChange={e => setNotifyContent(e.target.value)} 
                className="w-full h-32 rounded-xl border border-slate-200 p-4 text-sm resize-none"
                placeholder="Message content..."
              />
            </div>
            <div className="mt-8 flex gap-4">
              <button onClick={() => setShowNotifyModal(false)} className="flex-1 py-4 rounded-2xl font-bold text-slate-400">Cancel</button>
              <button onClick={handleSendNotification} disabled={isSubmitting} className="flex-2 rounded-2xl bg-black py-4 text-sm font-black text-white">Send Now</button>
            </div>
          </div>
        </div>
      )}

      <section className="rounded-[24px] border-2 border-dashed border-slate-200 bg-white p-6 md:flex md:items-center md:justify-between group hover:border-[#EE3F57]/30 transition-colors">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-[#EE3F57] flex items-center justify-center shadow-lg shadow-rose-100">
            <img src={heartIcon} alt="Shield" className="h-5 w-5 brightness-0 invert" />
          </div>
          <div>
            <h4 className="font-black text-slate-800 tracking-tight">AI Content Shield Active</h4>
            <p className="text-xs text-slate-400 font-medium">Automatic image scanning and toxicity detection is currently active.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
