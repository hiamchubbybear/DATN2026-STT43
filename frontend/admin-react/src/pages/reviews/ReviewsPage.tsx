import { useMemo, useState, useEffect } from 'react';
import { adminApi } from '../../shared/services/api';

type FilterState = {
  rating: 'all' | '5' | '4plus';
  sortDate: 'new' | 'old';
  status: 'all' | 'pending' | 'resolved';
};

const pageSize = 10;

export default function ReviewsPage() {
  const [draftFilters, setDraftFilters] = useState<FilterState>({
    rating: 'all',
    sortDate: 'new',
    status: 'all',
  });
  const [appliedFilters, setAppliedFilters] = useState<FilterState>({
    rating: 'all',
    sortDate: 'new',
    status: 'all',
  });
  const [reviewData, setReviewData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  // Reply Modal State
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState<any>(null);
  const [replyText, setReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
        setLoading(true);
        const res = await adminApi.getAppReviews();
        setReviewData(res.data);
    } catch (e) {
        console.error(e);
    } finally {
        setLoading(false);
    }
  };

  const handleReplySubmit = async () => {
    if (!selectedReview || !replyText.trim()) return;
    setIsSubmitting(true);
    try {
        await adminApi.replyToReview(selectedReview.id, replyText);
        alert("Reply sent successfully");
        setShowReplyModal(false);
        fetchReviews();
    } catch (e) {
        alert("Failed to send reply");
    } finally {
        setIsSubmitting(false);
    }
  };

  const filteredReviews = useMemo(() => {
    let result = reviewData.filter((review) => {
      // Rating filter
      if (appliedFilters.rating === '5' && review.rating !== 5) return false;
      if (appliedFilters.rating === '4plus' && review.rating < 4) return false;
      
      // Status filter
      if (appliedFilters.status === 'pending' && review.adminReply) return false;
      if (appliedFilters.status === 'resolved' && !review.adminReply) return false;
      
      return true;
    });

    // Sorting
    result.sort((left, right) => {
      const leftTime = new Date(left.createdAt).getTime();
      const rightTime = new Date(right.createdAt).getTime();
      return appliedFilters.sortDate === 'new' ? rightTime - leftTime : leftTime - rightTime;
    });

    return result;
  }, [reviewData, appliedFilters]);

  const totalPages = Math.max(1, Math.ceil(filteredReviews.length / pageSize));
  const pagedReviews = filteredReviews.slice((page - 1) * pageSize, page * pageSize);

  const from = filteredReviews.length === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, filteredReviews.length);

  return (
    <div className="space-y-6 bg-[#F3F3F3] min-h-screen p-6">
      <header className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">App Reviews</h2>
          <p className="mt-1 text-slate-500">Manage user feedback and improve the app experience</p>
        </div>

        <div className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-100 flex gap-8">
            <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Avg. Rating</p>
                <div className="flex items-center gap-2">
                    <span className="text-2xl font-black text-slate-800">4.8</span>
                    <span className="text-[#EE3F57] text-xl">★★★★★</span>
                </div>
            </div>
            <div className="w-px bg-slate-100" />
            <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Feedback</p>
                <p className="text-2xl font-black text-slate-800">{reviewData.length}</p>
            </div>
        </div>
      </header>

      <section className="grid gap-3 md:grid-cols-4 bg-white p-4 rounded-[20px] shadow-sm border border-slate-100">
        <select
          value={draftFilters.rating}
          onChange={(e) => setDraftFilters({ ...draftFilters, rating: e.target.value as any })}
          className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[#EE3F57]/20 transition"
        >
          <option value="all">All Ratings</option>
          <option value="5">5 Stars only</option>
          <option value="4plus">4+ Stars</option>
        </select>
        <select
          value={draftFilters.sortDate}
          onChange={(e) => setDraftFilters({ ...draftFilters, sortDate: e.target.value as any })}
          className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[#EE3F57]/20 transition"
        >
          <option value="new">Newest First</option>
          <option value="old">Oldest First</option>
        </select>
        <select
          value={draftFilters.status}
          onChange={(e) => setDraftFilters({ ...draftFilters, status: e.target.value as any })}
          className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[#EE3F57]/20 transition"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending Reply</option>
          <option value="resolved">Replied</option>
        </select>
        <button
          onClick={() => { setAppliedFilters(draftFilters); setPage(1); }}
          className="rounded-xl bg-[#EE3F57] text-white font-bold py-2 hover:bg-[#EE3F57]/90 transition active:scale-95"
        >
          Filter
        </button>
      </section>

      <main className="space-y-4">
        {loading ? (
            <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#EE3F57]"></div></div>
        ) : pagedReviews.length === 0 ? (
            <div className="bg-white p-12 rounded-[24px] text-center text-slate-400 border border-slate-100">No reviews found.</div>
        ) : (
            pagedReviews.map((review) => (
                <article key={review.id} className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100 hover:border-[#EE3F57]/30 transition-all group">
                    <div className="flex justify-between items-start gap-6">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 uppercase">
                                    {review.userName?.[0] || 'U'}
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800">{review.userName || "User"}</h4>
                                    <div className="flex items-center gap-2">
                                        <div className="text-amber-400 text-xs">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</div>
                                        <span className="text-[10px] text-slate-400">•</span>
                                        <span className="text-[10px] text-slate-400 font-medium">{new Date(review.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                            <p className="text-slate-600 leading-relaxed text-sm mb-4">{review.comment}</p>
                            
                            {review.adminReply && (
                                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-[#EE3F57]/50" />
                                    <p className="text-[10px] font-bold text-[#EE3F57] uppercase tracking-widest mb-1">Official Response</p>
                                    <p className="text-sm text-slate-700 italic">"{review.adminReply}"</p>
                                    <p className="mt-2 text-[9px] text-slate-400 font-medium">{new Date(review.repliedAt).toLocaleString()}</p>
                                </div>
                            )}
                        </div>

                        <div className="shrink-0">
                            {!review.adminReply && (
                                <button 
                                    onClick={() => { setSelectedReview(review); setReplyText(''); setShowReplyModal(true); }}
                                    className="bg-slate-50 text-slate-600 px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#EE3F57] hover:text-white transition-all active:scale-95 shadow-sm"
                                >
                                    Reply
                                </button>
                            )}
                        </div>
                    </div>
                </article>
            ))
        )}
      </main>

      <footer className="flex justify-between items-center py-6">
        <p className="text-sm text-slate-400 font-medium">Showing {from}-{to} of {filteredReviews.length} reviews</p>
        <div className="flex gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button 
                    key={p} 
                    onClick={() => setPage(p)}
                    className={`h-9 w-9 rounded-xl font-bold text-xs transition ${page === p ? 'bg-[#EE3F57] text-white shadow-lg shadow-rose-200' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-100'}`}
                >
                    {p}
                </button>
            ))}
        </div>
      </footer>

      {/* Reply Modal */}
      {showReplyModal && selectedReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-[32px] w-full max-w-lg shadow-2xl overflow-hidden transform transition-all scale-100">
                <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-bold text-slate-800">Reply to Feedback</h3>
                        <p className="text-xs text-slate-500 mt-1">Responding to {selectedReview.userName}</p>
                    </div>
                    <button onClick={() => setShowReplyModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="p-8 space-y-6">
                    <div className="p-4 bg-slate-50 rounded-2xl text-sm text-slate-600 border border-slate-100">
                        <p className="font-bold text-slate-400 uppercase text-[10px] mb-2 tracking-widest">Original Comment</p>
                        "{selectedReview.comment}"
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Your Response</label>
                        <textarea 
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Type your message here..."
                            className="w-full h-32 p-4 rounded-2xl border border-slate-200 bg-white outline-none focus:ring-4 focus:ring-[#EE3F57]/10 focus:border-[#EE3F57] transition resize-none text-sm"
                        />
                    </div>
                </div>

                <div className="p-8 bg-slate-50 flex gap-4">
                    <button 
                        onClick={() => setShowReplyModal(false)}
                        className="flex-1 py-4 rounded-2xl font-bold text-slate-600 hover:bg-slate-200 transition"
                    >
                        Discard
                    </button>
                    <button 
                        onClick={handleReplySubmit}
                        disabled={isSubmitting || !replyText.trim()}
                        className="flex-2 bg-[linear-gradient(135deg,#F27121_10%,#E94057_60%,#8A2387_100%)] text-white px-10 py-4 rounded-2xl font-bold hover:opacity-90 transition active:scale-95 disabled:opacity-50 shadow-lg shadow-rose-200"
                    >
                        {isSubmitting ? 'Sending...' : 'Send Response'}
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
