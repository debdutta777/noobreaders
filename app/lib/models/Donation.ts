import mongoose, { Schema } from 'mongoose';

export interface DonationDocument extends mongoose.Document {
  donorId: mongoose.Types.ObjectId; // reader
  receiverId: mongoose.Types.ObjectId; // writer
  novelId?: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  paymentMethod: 'paypal' | 'upi';
  status: 'pending' | 'completed' | 'failed';
  transactionId?: string;
  message?: string;
  createdAt: Date;
  updatedAt: Date;
}

const donationSchema = new Schema<DonationDocument>(
  {
    donorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiverId: {
      type: Schema.Types.ObjectId,
      ref: 'Writer',
      required: true,
    },
    novelId: {
      type: Schema.Types.ObjectId,
      ref: 'Novel',
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      required: true,
      default: 'USD',
    },
    paymentMethod: {
      type: String,
      enum: ['paypal', 'upi'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },
    transactionId: {
      type: String,
    },
    message: {
      type: String,
    },
  },
  {
    timestamps: true,
    collection: 'donations',
  }
);

// Create indexes for faster lookups
donationSchema.index({ donorId: 1 });
donationSchema.index({ receiverId: 1 });

export default mongoose.models.Donation || mongoose.model<DonationDocument>('Donation', donationSchema); 