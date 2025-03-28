import mongoose, { Schema } from 'mongoose';

export interface LibraryDocument extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  novelId: mongoose.Types.ObjectId;
  lastReadChapter: mongoose.Types.ObjectId;
  readingProgress: number; // percentage
  isBookmarked: boolean;
  collectionName?: string; // for custom shelves
  createdAt: Date;
  updatedAt: Date;
}

const librarySchema = new Schema<LibraryDocument>(
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
    lastReadChapter: {
      type: Schema.Types.ObjectId,
      ref: 'Chapter',
    },
    readingProgress: {
      type: Number,
      default: 0,
    },
    isBookmarked: {
      type: Boolean,
      default: false,
    },
    collectionName: {
      type: String,
      default: 'My Library',
    },
  },
  {
    timestamps: true,
    collection: 'library',
  }
);

// Create index for faster lookups
librarySchema.index({ userId: 1, novelId: 1 }, { unique: true });

export default mongoose.models.Library || mongoose.model<LibraryDocument>('Library', librarySchema); 