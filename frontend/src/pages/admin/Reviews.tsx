import React, { useState, useEffect } from 'react';
import { DataTable, Column } from '../../components/admin/DataTable';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { insforge } from '../../services/insforge';

interface ReviewItem {
  id: string;
  author: string;
  targetName: string;
  rating: number;
  comment: string;
  status: 'approved' | 'pending' | 'rejected';
  date: string;
  dbId?: string;
}

export const Reviews: React.FC = () => {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const { data, error } = await insforge.database
        .from('reviews')
        .select('*');

      if (!error && Array.isArray(data)) {
        const mapped: ReviewItem[] = data.map((r: any) => ({
          id: r.id ? `REV-${r.id.slice(0, 6)}` : 'REV-UNKNOWN',
          author: r.userName || r.user_id ? `User (${(r.user_id || '').slice(0, 6)})` : 'Verified Resident',
          targetName: r.service_name || r.property_name || 'EaseHub Partner',
          rating: Number(r.rating) || 5,
          comment: r.comment || 'No comment text provided.',
          status: r.is_published ? 'approved' : 'pending',
          date: r.created_at ? new Date(r.created_at).toLocaleDateString('en-IN') : '—',
          dbId: r.id,
        }));
        setReviews(mapped);
      } else {
        setReviews([]);
      }
    } catch (err) {
      console.error('Failed to load reviews:', err);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const setReviewStatus = async (item: ReviewItem, newStatus: ReviewItem['status']) => {
    if (item.dbId) {
      try {
        await insforge.database
          .from('reviews')
          .update({ is_published: newStatus === 'approved' })
          .eq('id', item.dbId);
      } catch (err) {
        console.error('Failed to update review status:', err);
      }
    }
    setReviews((prev) =>
      prev.map((r) => (r.id === item.id ? { ...r, status: newStatus } : r))
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
            onClick={() => setReviewStatus(item, 'approved')}
            className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold hover:bg-emerald-200"
          >
            Approve
          </button>
          <button
            onClick={() => setReviewStatus(item, 'rejected')}
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
