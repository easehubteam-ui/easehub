import React, { useState, useEffect } from 'react';
import { DataTable, Column } from '../../components/admin/DataTable';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { reviewApi, ReviewItem } from '../../services/reviewApi';
import { Star, CheckCircle, Video, Plus, Trash2, Check, X, RefreshCw } from 'lucide-react';

interface MappedReview {
  id: string;
  author: string;
  college: string;
  targetName: string;
  serviceType: string;
  rating: number;
  badgeTitle: string;
  comment: string;
  status: 'approved' | 'pending' | 'rejected';
  videoDuration?: string;
  tag?: string;
  date: string;
  dbId: string;
}

export const Reviews: React.FC = () => {
  const [reviews, setReviews] = useState<MappedReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState<'all' | 'approved' | 'pending' | 'rejected'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // New review form state
  const [formData, setFormData] = useState({
    userName: '',
    college: '',
    city: 'Bhilai',
    targetName: '',
    serviceType: 'PG',
    badgeTitle: '',
    comment: '',
    rating: 5,
    videoDuration: '0:45',
    cardBg: 'bg-[#9D76F7]',
    tag: 'Verified PG',
  });

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const data = await reviewApi.getAdminReviews();
      if (Array.isArray(data) && data.length > 0) {
        const mapped: MappedReview[] = data.map((r: any, idx: number) => {
          const rawId = r.id || r._id || `rv-${idx}`;
          const isApproved = r.status === 'approved' || (r.is_published && r.status !== 'rejected');
          const isRejected = r.status === 'rejected';
          const calcStatus: 'approved' | 'pending' | 'rejected' = isRejected
            ? 'rejected'
            : isApproved
            ? 'approved'
            : 'pending';

          return {
            id: rawId.startsWith('REV-') ? rawId : `REV-${String(rawId).replace(/[^a-zA-Z0-9]/g, '').slice(-6).toUpperCase()}`,
            author: r.userName || r.author || 'Verified Student',
            college: r.college || 'BIT Durg / CSVTU',
            targetName: r.targetName || r.property_name || r.service_name || 'EaseHub Accommodation',
            serviceType: r.serviceType || 'PG',
            rating: Number(r.rating) || 5,
            badgeTitle: r.badgeTitle || 'Student Review',
            comment: r.reviewQuote || r.comment || 'Verified student review on EaseHub campus living platform.',
            status: calcStatus,
            videoDuration: r.videoDuration || '0:48',
            tag: r.tag || 'Verified',
            date: r.createdAt || r.created_at ? new Date(r.createdAt || r.created_at).toLocaleDateString('en-IN') : 'Recent',
            dbId: rawId,
          };
        });
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

  const handleStatusChange = async (item: MappedReview, newStatus: 'approved' | 'pending' | 'rejected') => {
    try {
      await reviewApi.updateStatus(item.dbId, newStatus);
      setReviews((prev) =>
        prev.map((r) => (r.id === item.id || r.dbId === item.dbId ? { ...r, status: newStatus } : r))
      );
    } catch (err) {
      console.error('Failed to update review status:', err);
    }
  };

  const handleDelete = async (item: MappedReview) => {
    if (!window.confirm(`Are you sure you want to permanently delete review ${item.id}?`)) return;
    try {
      await reviewApi.deleteReview(item.dbId);
      setReviews((prev) => prev.filter((r) => r.id !== item.id && r.dbId !== item.dbId));
    } catch (err) {
      console.error('Failed to delete review:', err);
    }
  };

  const handleCreateReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.userName || !formData.comment) {
      alert('Student name and review comment are required');
      return;
    }
    setSubmitting(true);
    try {
      await reviewApi.createReview({
        userName: formData.userName,
        college: formData.college,
        city: formData.city,
        targetName: formData.targetName || 'EaseHub Student Stay',
        serviceType: formData.serviceType,
        rating: Number(formData.rating),
        badgeTitle: formData.badgeTitle || 'Quick campus move',
        comment: formData.comment,
        videoDuration: formData.videoDuration || '0:45',
      });
      setIsAddModalOpen(false);
      setFormData({
        userName: '',
        college: '',
        city: 'Bhilai',
        targetName: '',
        serviceType: 'PG',
        badgeTitle: '',
        comment: '',
        rating: 5,
        videoDuration: '0:45',
        cardBg: 'bg-[#9D76F7]',
        tag: 'Verified PG',
      });
      await fetchReviews();
    } catch (err) {
      console.error('Failed to create review:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredReviews = reviews.filter((r) => {
    if (filterTab === 'all') return true;
    return r.status === filterTab;
  });

  const columns: Column<MappedReview>[] = [
    {
      key: 'id',
      header: 'Review ID',
      render: (item) => (
        <div className="flex flex-col">
          <span className="font-mono font-bold text-[#225944] text-xs">{item.id}</span>
          <span className="text-[10px] text-[#6B6B63]">{item.date}</span>
        </div>
      ),
    },
    {
      key: 'author',
      header: 'Student & Campus',
      render: (item) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#225944]/10 text-[#225944] font-bold text-xs flex items-center justify-center shrink-0">
            {item.author.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-[#171A18] truncate flex items-center gap-1">
              {item.author}
              <CheckCircle className="h-3 w-3 text-[#225944]" />
            </p>
            <p className="text-[11px] text-[#6B6B63] truncate">{item.college}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'targetName',
      header: 'Listing Reviewed',
      render: (item) => (
        <div>
          <p className="text-xs font-semibold text-[#171A18]">{item.targetName}</p>
          <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold bg-[#EAE7DC] text-[#171A18]">
            {item.serviceType}
          </span>
        </div>
      ),
    },
    {
      key: 'rating',
      header: 'Rating & Video',
      render: (item) => (
        <div className="flex flex-col gap-1">
          <div className="flex text-amber-500 font-bold text-xs">
            {'★'.repeat(item.rating)}{'☆'.repeat(Math.max(0, 5 - item.rating))}
          </div>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#225944] bg-[#225944]/10 px-2 py-0.5 rounded-full w-max">
            <Video className="h-3 w-3" /> {item.videoDuration}
          </span>
        </div>
      ),
    },
    {
      key: 'comment',
      header: 'Badge & Experience Quote',
      render: (item) => (
        <div className="max-w-xs space-y-1">
          <span className="text-[11px] font-bold text-[#171A18] bg-black/5 px-2 py-0.5 rounded">
            {item.badgeTitle}
          </span>
          <p className="text-xs text-[#55554E] line-clamp-2 leading-relaxed">{item.comment}</p>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => <StatusBadge status={item.status} />,
    },
    {
      key: 'actions',
      header: 'Moderation Actions',
      render: (item) => (
        <div className="flex items-center gap-1.5">
          {item.status !== 'approved' && (
            <button
              onClick={() => handleStatusChange(item, 'approved')}
              title="Approve & Publish to Homepage"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 text-[11px] font-bold hover:bg-emerald-200 transition-colors cursor-pointer"
            >
              <Check className="h-3 w-3" /> Approve
            </button>
          )}
          {item.status !== 'rejected' && (
            <button
              onClick={() => handleStatusChange(item, 'rejected')}
              title="Reject / Hide from Homepage"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-100 text-amber-900 text-[11px] font-bold hover:bg-amber-200 transition-colors cursor-pointer"
            >
              <X className="h-3 w-3" /> Reject
            </button>
          )}
          <button
            onClick={() => handleDelete(item)}
            title="Delete Review"
            className="p-1 rounded-md text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner & Stats Overview */}
      <div className="bg-white rounded-3xl p-6 border border-[#E5E1D6] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-[#225944] tracking-tight">
              Student Video Reviews & Moderation
            </h1>
            <span className="px-3 py-1 rounded-full bg-[#EECA3A]/30 text-[#171A18] text-xs font-bold">
              {reviews.length} Total Stories
            </span>
          </div>
          <p className="mt-1 text-xs text-[#6B6B63] max-w-2xl">
            Manage, approve, or hide student video testimonials displayed on the EaseHub homepage carousel and campus corridors.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchReviews}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#E5E1D6] text-xs font-bold text-[#171A18] hover:bg-black/5 transition-colors cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#225944] text-white text-xs font-bold hover:bg-[#184232] shadow-sm transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Add Video Review
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-[#E5E1D6] pb-3">
        {(['all', 'approved', 'pending', 'rejected'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilterTab(tab)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold capitalize transition-all cursor-pointer ${
              filterTab === tab
                ? 'bg-[#225944] text-white shadow-xs'
                : 'bg-white text-[#6B6B63] hover:text-[#171A18] border border-[#E5E1D6]'
            }`}
          >
            {tab} (
            {tab === 'all'
              ? reviews.length
              : reviews.filter((r) => r.status === tab).length}
            )
          </button>
        ))}
      </div>

      {/* Reviews Data Table */}
      <DataTable
        title="Student Reviews Feed"
        subtitle="Live feed synced with InsForge database and homepage carousel"
        columns={columns}
        data={filteredReviews}
        searchPlaceholder="Search by student name, campus, or PG/service..."
      />

      {/* Add Review Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#E5E1D6] space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E1D6]">
              <div>
                <h3 className="text-lg font-black text-[#225944]">Add Student Video Review</h3>
                <p className="text-xs text-[#6B6B63]">Directly publish a verified student story to the carousel</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center hover:bg-black/10 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateReview} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#171A18]">Student Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.userName}
                    onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                    placeholder="e.g. Aman Verma"
                    className="mt-1 w-full px-3 py-2 rounded-xl border border-[#E5E1D6] text-xs font-medium focus:outline-[#225944]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#171A18]">College & Year</label>
                  <input
                    type="text"
                    value={formData.college}
                    onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                    placeholder="e.g. BIT Durg • CSE 2nd Year"
                    className="mt-1 w-full px-3 py-2 rounded-xl border border-[#E5E1D6] text-xs font-medium focus:outline-[#225944]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#171A18]">City</label>
                  <select
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="mt-1 w-full px-3 py-2 rounded-xl border border-[#E5E1D6] text-xs font-medium focus:outline-[#225944]"
                  >
                    <option value="Bhilai">Bhilai</option>
                    <option value="Durg">Durg</option>
                    <option value="Raipur">Raipur</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-[#171A18]">Service Vertical</label>
                  <select
                    value={formData.serviceType}
                    onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                    className="mt-1 w-full px-3 py-2 rounded-xl border border-[#E5E1D6] text-xs font-medium focus:outline-[#225944]"
                  >
                    <option value="PG">PG Stay</option>
                    <option value="Meals">Daily Mess</option>
                    <option value="Laundry">Laundry</option>
                    <option value="Support">Support</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-[#171A18]">Rating (1-5)</label>
                  <select
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                    className="mt-1 w-full px-3 py-2 rounded-xl border border-[#E5E1D6] text-xs font-medium focus:outline-[#225944]"
                  >
                    <option value="5">★★★★★ (5.0)</option>
                    <option value="4">★★★★☆ (4.0)</option>
                    <option value="3">★★★☆☆ (3.0)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#171A18]">PG / Partner Name</label>
                <input
                  type="text"
                  value={formData.targetName}
                  onChange={(e) => setFormData({ ...formData, targetName: e.target.value })}
                  placeholder="e.g. Shiv Shakti Boys PG, Junwani"
                  className="mt-1 w-full px-3 py-2 rounded-xl border border-[#E5E1D6] text-xs font-medium focus:outline-[#225944]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#171A18]">Badge Headline *</label>
                <input
                  type="text"
                  required
                  value={formData.badgeTitle}
                  onChange={(e) => setFormData({ ...formData, badgeTitle: e.target.value })}
                  placeholder="e.g. Found my stay in 15 mins"
                  className="mt-1 w-full px-3 py-2 rounded-xl border border-[#E5E1D6] text-xs font-medium focus:outline-[#225944]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#171A18]">Review Quote / Feedback *</label>
                <textarea
                  required
                  rows={3}
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  placeholder="Detailed student feedback quote..."
                  className="mt-1 w-full px-3 py-2 rounded-xl border border-[#E5E1D6] text-xs font-medium focus:outline-[#225944] resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#171A18]">Video Length Pill</label>
                  <input
                    type="text"
                    value={formData.videoDuration}
                    onChange={(e) => setFormData({ ...formData, videoDuration: e.target.value })}
                    placeholder="e.g. 0:48"
                    className="mt-1 w-full px-3 py-2 rounded-xl border border-[#E5E1D6] text-xs font-medium focus:outline-[#225944]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#171A18]">Card Background Theme</label>
                  <select
                    value={formData.cardBg}
                    onChange={(e) => setFormData({ ...formData, cardBg: e.target.value })}
                    className="mt-1 w-full px-3 py-2 rounded-xl border border-[#E5E1D6] text-xs font-medium focus:outline-[#225944]"
                  >
                    <option value="bg-[#9D76F7]">Lavender (#9D76F7)</option>
                    <option value="bg-[#F0EDE6]">Sand (#F0EDE6)</option>
                    <option value="bg-[#E0F2FE]">Sky Blue (#E0F2FE)</option>
                    <option value="bg-[#225944]">Forest Green (#225944)</option>
                    <option value="bg-[#EECA3A]">Gold (#EECA3A)</option>
                    <option value="bg-[#171A18]">Charcoal (#171A18)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#E5E1D6]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#6B6B63] hover:bg-black/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-[#225944] text-white text-xs font-bold hover:bg-[#184232] shadow-sm disabled:opacity-50"
                >
                  {submitting ? 'Publishing...' : 'Publish to Carousel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reviews;
