import mongoose, { Schema } from 'mongoose';

export interface ReviewDocument extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  novelId: mongoose.Types.ObjectId;
  rating: number; // 1-5 stars
  content: string;
  likes: number;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<ReviewDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    novelId: {
      type: Schema.Types.ObjectId,
      ref: 'Novel',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    content: {
      type: String,
      required: true,
    },
    likes: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    collection: 'reviews',
  }
);

// Create index for faster lookups
reviewSchema.index({ userId: 1, novelId: 1 }, { unique: true });

export default mongoose.models.Review || mongoose.model<ReviewDocument>('Review', reviewSchema); 