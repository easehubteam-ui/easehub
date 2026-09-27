import mongoose, { Schema, Document } from 'mongoose';

export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'assigned'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'rejected';

export interface IBooking extends Document {
  user: mongoose.Types.ObjectId;
  service: mongoose.Types.ObjectId;
  vendor?: mongoose.Types.ObjectId;
  bookingNumber: string;
  status: BookingStatus;
  scheduledDate: Date;
  scheduledTime?: string;
  address: string;
  description?: string;
  attachments?: string[];
  amount: number;
  payment?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    service: { type: Schema.Types.ObjectId, ref: 'Service', required: true },
    vendor: { type: Schema.Types.ObjectId, ref: 'User' },
    bookingNumber: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: [
        'pending',
        'confirmed',
        'assigned',
        'in_progress',
        'completed',
        'cancelled',
        'rejected',
      ],
      default: 'pending',
    },
    scheduledDate: { type: Date, required: true },
    scheduledTime: { type: String },
    address: { type: String, required: true },
    description: { type: String },
    attachments: [{ type: String }],
    amount: { type: Number, required: true },
    payment: { type: Schema.Types.ObjectId, ref: 'Payment' },
  },
  { timestamps: true }
);

export const Booking = mongoose.model<IBooking>('Booking', BookingSchema);
