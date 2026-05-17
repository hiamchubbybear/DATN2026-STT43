import { useEffect, useState } from 'react';
import { adminApi } from '../../shared/services/api';

export default function VerificationsPage() {
  const [list, setList] = useState<any[]>([]);

  useEffect(() => {
    fetchVerifications();
  }, []);

  const fetchVerifications = async () => {
    try {
        const res = await adminApi.getPendingVerifications();
        setList(res.data);
    } catch (e) {
        console.error(e);
    }
  };

  const handleApprove = async (id: string) => {
      try {
          await adminApi.approveVerification(id);
          alert('Approved successfully');
          setList(list.filter(x => x.id !== id));
          setSelectedVerification(null);
      } catch (e) {
          alert('Failed to approve verification');
      }
  };

  const handleReject = async (id: string) => {
      const reason = window.prompt('Reason for rejection:');
      if (!reason) return;
      
      try {
          await adminApi.rejectVerification(id, reason);
          alert('Rejected successfully');
          setList(list.filter(x => x.id !== id));
          setSelectedVerification(null);
      } catch (e) {
          alert('Failed to reject verification');
      }
  };

  const [selectedVerification, setSelectedVerification] = useState<any>(null);

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-bold text-slate-800">KYC Verifications</h2>
        <p className="text-slate-500">Review user identity verification documents</p>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {list.length === 0 && <p className="text-slate-400">No pending verification requests.</p>}
        {list.map(v => (
          <article key={v.id} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between hover:border-[#EE3F57]/50 transition-colors cursor-pointer" onClick={() => setSelectedVerification(v)}>
             <div>
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="font-bold text-slate-800">{v.fullName}</h3>
                        <p className="text-sm text-slate-500 font-mono">ID: {v.idNumber}</p>
                    </div>
                    <span className="bg-amber-100 text-amber-600 px-2 py-1 rounded-lg text-[10px] font-bold uppercase">Pending</span>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <img src={v.frontImageUrl} alt="Front" className="rounded-xl h-32 w-full object-cover border border-slate-100" />
                    <img src={v.backImageUrl} alt="Back" className="rounded-xl h-32 w-full object-cover border border-slate-100" />
                </div>
             </div>

             <div className="flex gap-3">
                <button 
                    onClick={(e) => { e.stopPropagation(); handleApprove(v.id); }}
                    className="flex-1 bg-emerald-500 text-white py-2 rounded-xl font-bold text-sm hover:bg-emerald-600 transition active:scale-95"
                >
                    Approve
                </button>
                <button 
                    onClick={(e) => { e.stopPropagation(); handleReject(v.id); }}
                    className="flex-1 bg-slate-50 border border-slate-200 py-2 rounded-xl font-bold text-sm text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition active:scale-95"
                >
                    Reject
                </button>
             </div>
          </article>
        ))}
      </div>

      {selectedVerification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-[32px] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div>
                        <h3 className="text-xl font-bold text-slate-800">Verification Detail</h3>
                        <p className="text-sm text-slate-500">Submitted on {new Date(selectedVerification.createdAt).toLocaleDateString()}</p>
                    </div>
                    <button 
                        onClick={() => setSelectedVerification(null)}
                        className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8">
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="md:col-span-1 space-y-6">
                            <section>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">User Information</label>
                                <div className="mt-2 space-y-3">
                                    <div>
                                        <p className="text-sm text-slate-500">Full Name</p>
                                        <p className="font-bold text-slate-800">{selectedVerification.fullName}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500">ID / Passport Number</p>
                                        <p className="font-bold text-slate-800 font-mono tracking-tight">{selectedVerification.idNumber}</p>
                                    </div>
                                </div>
                            </section>

                            <section>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">AI Analysis</label>
                                <div className="mt-2 p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                                    <div>
                                        <div className="flex justify-between items-center mb-1">
                                            <p className="text-xs text-slate-500">Liveness Score</p>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${selectedVerification.isLivenessVerified ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                                {selectedVerification.isLivenessVerified ? 'REAL' : 'SPOOF'}
                                            </span>
                                        </div>
                                        <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full rounded-full ${selectedVerification.livenessScore >= 0.8 ? 'bg-emerald-500' : 'bg-amber-500'}`} 
                                                style={{ width: `${(selectedVerification.livenessScore || 0) * 100}%` }}
                                            />
                                        </div>
                                        <p className="text-right text-[10px] font-bold mt-1 text-slate-400">{Math.round((selectedVerification.livenessScore || 0) * 100)}% Confidence</p>
                                    </div>

                                    <div>
                                        <div className="flex justify-between items-center mb-1">
                                            <p className="text-xs text-slate-500">Face Match Similarity</p>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${selectedVerification.isFaceMatched ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                                                {selectedVerification.isFaceMatched ? 'MATCH' : 'MISMATCH'}
                                            </span>
                                        </div>
                                        <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full rounded-full ${selectedVerification.faceSimilarityScore >= 0.8 ? 'bg-emerald-500' : 'bg-amber-500'}`} 
                                                style={{ width: `${(selectedVerification.faceSimilarityScore || 0) * 100}%` }}
                                            />
                                        </div>
                                        <p className="text-right text-[10px] font-bold mt-1 text-slate-400">{Math.round((selectedVerification.faceSimilarityScore || 0) * 100)}% Similarity</p>
                                    </div>
                                </div>
                            </section>

                            <section>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Selfie Verification</label>
                                <div className="mt-2">
                                    <img src={selectedVerification.selfieImageUrl} alt="Selfie" className="rounded-2xl w-full aspect-square object-cover border-4 border-slate-50 shadow-sm" />
                                </div>
                            </section>
                        </div>

                        <div className="md:col-span-2 space-y-6">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Document Photos</label>
                            <div className="grid gap-4">
                                <div className="space-y-2">
                                    <p className="text-xs font-semibold text-slate-500 ml-1">FRONT SIDE</p>
                                    <img src={selectedVerification.frontImageUrl} alt="Front" className="rounded-2xl w-full object-contain bg-slate-900 border border-slate-200 min-h-[300px]" />
                                </div>
                                <div className="space-y-2">
                                    <p className="text-xs font-semibold text-slate-500 ml-1">BACK SIDE</p>
                                    <img src={selectedVerification.backImageUrl} alt="Back" className="rounded-2xl w-full object-contain bg-slate-900 border border-slate-200 min-h-[300px]" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-4">
                    <button 
                        onClick={() => handleReject(selectedVerification.id)}
                        className="flex-1 px-6 py-4 rounded-2xl font-bold text-red-600 bg-white border border-red-100 hover:bg-red-50 transition active:scale-95 shadow-sm"
                    >
                        Reject Submission
                    </button>
                    <button 
                        onClick={() => handleApprove(selectedVerification.id)}
                        className="flex-2 bg-[linear-gradient(135deg,#F27121_10%,#E94057_60%,#8A2387_100%)] text-white px-12 py-4 rounded-2xl font-bold hover:opacity-90 transition active:scale-95 shadow-lg shadow-rose-200"
                    >
                        Approve Verification
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
