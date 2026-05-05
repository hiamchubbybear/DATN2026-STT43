import { useMemo, useState } from 'react';
import avatarUser1 from '../../assets/avatar-user-1.svg';
import avatarUser2 from '../../assets/avatar-user-2.svg';
import avatarUser3 from '../../assets/avatar-user-3.svg';

type ReviewStatus = 'Pending Reply' | 'Resolved';

type ReviewItem = {
  id: number;
  userName: string;
  memberSince: string;
  date: string;
  createdAt: string;
  stars: number;
  title: string;
  content: string;
  status: ReviewStatus;
  avatar: string;
  architectResponse?: string;
};

const reviewData: ReviewItem[] = [
  {
    id: 1,
    userName: 'Luna Tran',
    memberSince: 'Member since Jan 2024',
    date: 'Apr 11, 2026',
    createdAt: '2026-04-11',
    stars: 5,
    title: 'Great matching accuracy and smooth flow',
    content: 'The app consistently suggests relevant profiles and the moderation response is quick and professional.',
    status: 'Pending Reply',
    avatar: avatarUser1,
  },
  {
    id: 2,
    userName: 'Ethan Hoang',
    memberSince: 'Member since Oct 2023',
    date: 'Apr 10, 2026',
    createdAt: '2026-04-10',
    stars: 4,
    title: 'UI is clean but notifications can be improved',
    content: 'Overall experience is positive. Scheduling and reminders are helpful, but timing could be more personalized.',
    status: 'Resolved',
    avatar: avatarUser2,
    architectResponse: 'Thanks for the feedback. We have adjusted segmentation windows and are rolling out adaptive send-time optimization.',
  },
  {
    id: 3,
    userName: 'Mia Nguyen',
    memberSince: 'Member since Mar 2025',
    date: 'Apr 09, 2026',
    createdAt: '2026-04-09',
    stars: 5,
    title: 'Excellent support and trust features',
    content: 'Verification and report handling make the platform safer. The quality of interactions has improved a lot.',
    status: 'Pending Reply',
    avatar: avatarUser3,
  },
  {
    id: 4,
    userName: 'Gia Bao',
    memberSince: 'Member since Dec 2024',
    date: 'Apr 08, 2026',
    createdAt: '2026-04-08',
    stars: 3,
    title: 'Need faster review responses',
    content: 'Report handling is good overall, but in some urgent cases I expected a quicker callback from support.',
    status: 'Resolved',
    avatar: avatarUser1,
    architectResponse: 'We have escalated urgent response flows and enabled priority queueing for critical cases.',
  },
  {
    id: 5,
    userName: 'Quynh Anh',
    memberSince: 'Member since Jul 2022',
    date: 'Apr 07, 2026',
    createdAt: '2026-04-07',
    stars: 4,
    title: 'Good safety features and quality matching',
    content: 'The verification badge and moderation transparency make me feel more confident using the platform daily.',
    status: 'Pending Reply',
    avatar: avatarUser2,
  },
];

const pageSize = 2;

type FilterState = {
  rating: 'all' | '5' | '4plus';
  sortDate: 'new' | 'old';
  status: 'all' | 'pending' | 'resolved';
};

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
  const [page, setPage] = useState(1);

  const filteredReviews = useMemo(() => {
    const byRating = reviewData.filter((review) => {
      if (appliedFilters.rating === 'all') return true;
      if (appliedFilters.rating === '5') return review.stars === 5;
      return review.stars >= 4;
    });

    const byStatus = byRating.filter((review) => {
      if (appliedFilters.status === 'all') return true;
      if (appliedFilters.status === 'pending') return review.status === 'Pending Reply';
      return review.status === 'Resolved';
    });

    const sorted = [...byStatus].sort((left, right) => {
      const leftTime = new Date(left.createdAt).getTime();
      const rightTime = new Date(right.createdAt).getTime();
      return appliedFilters.sortDate === 'new' ? rightTime - leftTime : leftTime - rightTime;
    });

    return sorted;
  }, [appliedFilters]);

  const totalPages = Math.max(1, Math.ceil(filteredReviews.length / pageSize));
  const pagedReviews = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredReviews.slice(start, start + pageSize);
  }, [filteredReviews, page]);

  const from = filteredReviews.length === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, filteredReviews.length);

  return (
    <div className="space-y-6 bg-[#F3F3F3]">
      <section className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h2 className="text-fluid-xl font-bold text-slate-800">Review Management</h2>
          <p className="mt-1 text-fluid-sm text-[#ADAFBB]">Track user sentiment, reply faster, and improve service quality in real time.</p>
        </div>

        <article className="w-full max-w-xl rounded-2xl bg-white p-4 shadow-[0_16px_34px_-24px_rgba(0,0,0,0.16)]">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-fluid-xs font-semibold tracking-[0.14em] text-[#ADAFBB]">GLOBAL RATING</p>
              <div className="mt-1 flex items-end gap-2">
                <p className="text-fluid-xl font-bold text-slate-800">4.8</p>
                <div className="mb-1 text-[#EE3F57]">★★★★★</div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-fluid-xs font-semibold tracking-[0.14em] text-[#ADAFBB]">TOTAL REVIEWS</p>
              <p className="mt-1 text-fluid-xl font-bold text-slate-800">1,284</p>
            </div>
          </div>
        </article>
      </section>

      <section className="grid gap-3 md:grid-cols-4">
        <select
          value={draftFilters.rating}
          onChange={(event) => setDraftFilters((prev) => ({ ...prev, rating: event.target.value as FilterState['rating'] }))}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-fluid-sm text-slate-600 outline-none focus:border-[#EE3F57]"
        >
          <option value="all">Rating: All Stars</option>
          <option value="5">Rating: 5 Stars</option>
          <option value="4plus">Rating: 4+ Stars</option>
        </select>
        <select
          value={draftFilters.sortDate}
          onChange={(event) => setDraftFilters((prev) => ({ ...prev, sortDate: event.target.value as FilterState['sortDate'] }))}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-fluid-sm text-slate-600 outline-none focus:border-[#EE3F57]"
        >
          <option value="new">Sort by Date: New</option>
          <option value="old">Sort by Date: Old</option>
        </select>
        <select
          value={draftFilters.status}
          onChange={(event) => setDraftFilters((prev) => ({ ...prev, status: event.target.value as FilterState['status'] }))}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-fluid-sm text-slate-600 outline-none focus:border-[#EE3F57]"
        >
          <option value="all">Status: All</option>
          <option value="pending">Status: Pending Reply</option>
          <option value="resolved">Status: Resolved</option>
        </select>
        <button
          type="button"
          onClick={() => {
            setAppliedFilters(draftFilters);
            setPage(1);
          }}
          className="rounded-xl bg-[linear-gradient(135deg,#F27121_10%,#E94057_60%,#8A2387_100%)] px-4 py-2.5 text-fluid-sm font-semibold text-white"
        >
          Apply Filters
        </button>
      </section>

      <section className="space-y-4">
        {pagedReviews.length === 0 && (
          <article className="rounded-2xl bg-white p-6 text-center text-sm text-slate-500 shadow-[0_16px_34px_-24px_rgba(0,0,0,0.16)]">
            No reviews found for selected filters.
          </article>
        )}
        {pagedReviews.map((review) => {
          const isResolved = review.status === 'Resolved';

          return (
            <article key={review.id} className="rounded-2xl bg-white p-5 shadow-[0_16px_34px_-24px_rgba(0,0,0,0.16)]">
              <div className="grid gap-4 xl:grid-cols-12">
                <div className="xl:col-span-3">
                  <div className="flex items-center gap-3">
                    <img src={review.avatar} alt={review.userName} className="h-12 w-12 rounded-full object-cover" />
                    <div>
                      <p className="font-semibold text-slate-800">{review.userName}</p>
                      <p className="text-xs text-[#ADAFBB]">{review.memberSince}</p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-[#EE3F57]">{'★'.repeat(review.stars)}{'☆'.repeat(5 - review.stars)}</p>
                  <p className="text-xs text-[#ADAFBB]">{review.date}</p>
                </div>

                <div className="xl:col-span-6">
                  <h3 className="font-semibold text-slate-800">{review.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{review.content}</p>

                  <span
                    className={`mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                      isResolved ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <span className={`h-2 w-2 rounded-full ${isResolved ? 'bg-emerald-500' : 'bg-[#EE3F57]'}`} />
                    {review.status}
                  </span>

                  {review.architectResponse && (
                    <div className="mt-3 rounded-xl bg-slate-100 p-3">
                      <p className="text-xs font-semibold text-slate-500">Architect Response</p>
                      <p className="mt-1 text-sm italic text-slate-600">{review.architectResponse}</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 xl:col-span-3 xl:items-end">
                  <button
                    type="button"
                    className={`${isResolved ? 'bg-slate-100 text-slate-700' : 'bg-[#EE3F57] text-white'} rounded-xl px-4 py-2 text-sm font-semibold`}
                  >
                    {isResolved ? 'Edit Reply' : 'Reply'}
                  </button>
                  <button type="button" className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
                    Delete
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </section>

      <button
        type="button"
        className="fixed bottom-6 right-6 z-20 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[linear-gradient(135deg,#F27121_10%,#E94057_60%,#8A2387_100%)] text-white shadow-[0_18px_30px_-18px_rgba(0,0,0,0.5)]"
        aria-label="Download reviews"
      >
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5">
          <path d="M12 4v10m0 0 4-4m-4 4-4-4M5 19h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <footer className="flex flex-col gap-3 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
        <p>Showing {from} - {to} of {filteredReviews.length} reviews</p>
        <div className="flex items-center gap-2">
          {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
            <button
              key={pageNumber}
              type="button"
              onClick={() => setPage(pageNumber)}
              className={`h-8 w-8 rounded-lg text-xs font-semibold ${
                pageNumber === page ? 'bg-[#EE3F57] text-white' : 'bg-white text-slate-500'
              }`}
            >
              {pageNumber}
            </button>
          ))}
        </div>
      </footer>
    </div>
  );
}
