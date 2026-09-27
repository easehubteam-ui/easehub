import mongoose, { Schema, Document } from 'mongoose';

export type PaymentMethod = 'qr' | 'online';
export type PaymentStatus =
  | 'pending'
  | 'verification_pending'
  | 'verified'
  | 'rejected'
  | 'refunded';

export interface IPayment extends Document {
  booking: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  utr?: string;
  screenshotUrl?: string;
  verifiedBy?: mongoose.Types.ObjectId;
  verifiedAt?: Date;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    booking: { type: Schema.Types.ObjectId, ref: 'Booking', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    method: { type: String, enum: ['qr', 'online'], required: true },
    status: {
      type: String,
      enum: ['pending', 'verification_pending', 'verified', 'rejected', 'refunded'],
      default: 'pending',
    },
    transactionId: { type: String },
    utr: { type: String },
    screenshotUrl: { type: String },
    verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    verifiedAt: { type: Date },
    rejectionReason: { type: String },
  },
  { timestamps: true }
);

export const Payment = mongoose.model<IPayment>('Payment', PaymentSchema);
