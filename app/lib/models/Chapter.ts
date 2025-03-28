import mongoose, { Schema } from 'mongoose';

export interface ChapterDocument extends mongoose.Document {
  title: string;
  content: string;
  novelId: mongoose.Types.ObjectId;
  chapterNumber: number;
  images: string[];
  createdAt: Date;
  updatedAt: Date;
}

const chapterSchema = new Schema<ChapterDocument>(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    novelId: {
      type: Schema.Types.ObjectId,
      ref: 'Novel',
      required: true,
    },
    chapterNumber: {
      type: Number,
      required: true,
    },
    images: [{
      type: String,
    }],
  },
  {
    timestamps: true,
    collection: 'chapters',
  }
);

// Using the existing "chapters" collection
export default mongoose.models.Chapter || mongoose.model<ChapterDocument>('Chapter', chapterSchema); 