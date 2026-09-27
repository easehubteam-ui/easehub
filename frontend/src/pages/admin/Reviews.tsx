import React, { useState } from 'react';
import { DataTable, Column } from '../../components/admin/DataTable';
import { StatusBadge } from '../../components/admin/StatusBadge';

interface ReviewItem {
  id: string;
  author: string;
  targetName: string;
  rating: number;
  comment: string;
  status: 'approved' | 'pending' | 'rejected';
  date: string;
}

export const Reviews: React.FC = () => {
  const [reviews, setReviews] = useState<ReviewItem[]>([
    {
      id: 'REV-01',
      author: 'Priya Sharma (BIT Durg)',
      targetName: 'Royal Luxury Boys PG',
      rating: 5,
      comment: 'Super clean rooms with fast Wi-Fi and 24/7 security warden. Highly recommended!',
      status: 'approved',
      date: '2026-09-22',
    },
    {
      id: 'REV-02',
      author: 'Rahul Verma (Rungta)',
      targetName: 'Annapurna Daily Mess',
      rating: 4,
      comment: 'Food quality is great, hot roti served daily on time in hostel.',
      status: 'approved',
      date: '2026-09-21',
    },
    {
      id: 'REV-03',
      author: 'Anonymous Student',
      targetName: 'Campus Express Laundry',
      rating: 1,
      comment: 'Clothes took 3 days instead of 24 hours. Needs better speed.',
      status: 'pending',
      date: '2026-09-24',
    },
  ]);

  const setReviewStatus = (id: string, newStatus: ReviewItem['status']) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );
  };

  const columns: Column<ReviewItem>[] = [
    {
      key: 'id',
      header: 'Review ID',
      render: (item) => <span className="font-mono font-bold text-[#225944]">{item.id}</span>,
    },
    { key: 'author', header: 'Review Author' },
    { key: 'targetName', header: 'PG / Vendor Reviewed' },
    {
      key: 'rating',
      header: 'Stars',
      render: (item) => (
        <div className="flex text-amber-500 font-bold text-xs">
          {'★'.repeat(item.rating)}{'☆'.repeat(5 - item.rating)}
        </div>
      ),
    },
    {
      key: 'comment',
      header: 'Review Comment Text',
      render: (item) => <p className="text-xs text-[#171A18] max-w-xs truncate">{item.comment}</p>,
    },
    {
      key: 'status',
      header: 'Moderation Status',
      render: (item) => <StatusBadge status={item.status} />,
    },
    {
      key: 'actions',
      header: 'Moderate',
      render: (item) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setReviewStatus(item.id, 'approved')}
            className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold hover:bg-emerald-200"
          >
            Approve
          </button>
          <button
            onClick={() => setReviewStatus(item.id, 'rejected')}
            className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px] font-bold hover:bg-rose-200"
          >
            Reject
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <DataTable
        title="Ratings & Reviews Moderation Center"
        subtitle="Review, approve, or hide student feedback submitted for PG stays and mess services"
        columns={columns}
        data={reviews}
        searchPlaceholder="Search review author or vendor..."
      />
    </div>
  );
};

export default Reviews;
