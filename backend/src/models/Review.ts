import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  user?: mongoose.Types.ObjectId;
  userName?: string;
  college?: string;
  city?: string;
  serviceId?: string;
  targetName?: string;
  serviceType?: string;
  booking?: mongoose.Types.ObjectId;
  rating: number;
  badgeTitle?: string;
  comment?: string;
  reviewQuote?: string;
  videoUrl?: string;
  videoDuration?: string;
  status: 'approved' | 'pending' | 'rejected';
  is_published: boolean;
  tag?: string;
  cardBg?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    userName: { type: String, default: 'Verified Resident' },
    college: { type: String, default: '' },
    city: { type: String, default: 'Bhilai' },
    serviceId: { type: String },
    targetName: { type: String, default: 'EaseHub Verified Partner' },
    serviceType: { type: String, default: 'PG' },
    booking: { type: Schema.Types.ObjectId, ref: 'Booking' },
    rating: { type: Number, required: true, min: 1, max: 5, default: 5 },
    badgeTitle: { type: String, default: 'Verified Student Experience' },
    comment: { type: String, default: '' },
    reviewQuote: { type: String, default: '' },
    videoUrl: { type: String, default: '' },
    videoDuration: { type: String, default: '0:45' },
    status: { type: String, enum: ['approved', 'pending', 'rejected'], default: 'approved' },
    is_published: { type: Boolean, default: true },
    tag: { type: String, default: 'Verified Review' },
    cardBg: { type: String, default: 'bg-[#9D76F7]' },
  },
  { timestamps: true }
);

export const Review = mongoose.model<IReview>('Review', ReviewSchema);
