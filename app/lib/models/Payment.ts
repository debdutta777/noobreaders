import mongoose, { Schema } from 'mongoose';

export interface PaymentDocument extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  paymentType: 'upi' | 'paypal';
  upiId?: string;
  upiQrImage?: string;
  paypalEmail?: string;
  paypalUsername?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<PaymentDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'Writer',
      required: true,
    },
    paymentType: {
      type: String,
      enum: ['upi', 'paypal'],
      required: true,
    },
    upiId: {
      type: String,
    },
    upiQrImage: {
      type: String,
    },
    paypalEmail: {
      type: String,
    },
    paypalUsername: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: 'payments',
  }
);

// Using the existing "payments" collection
export default mongoose.models.Payment || mongoose.model<PaymentDocument>('Payment', paymentSchema); 