import mongoose, { Schema } from 'mongoose';

export interface NovelDocument extends mongoose.Document {
  title: string;
  description: string;
  coverImage: string;
  author: mongoose.Types.ObjectId;
  genres: string[];
  status: 'ongoing' | 'completed' | 'hiatus';
  tags: string[];
  views: number;
  likes: number;
  createdAt: Date;
  updatedAt: Date;
}

const novelSchema = new Schema<NovelDocument>(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    coverImage: {
      type: String,
      required: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'Writer',
      required: true,
    },
    genres: [{
      type: String,
    }],
    status: {
      type: String,
      enum: ['ongoing', 'completed', 'hiatus'],
      default: 'ongoing',
    },
    tags: [{
      type: String,
    }],
    views: {
      type: Number,
      default: 0,
    },
    likes: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    collection: 'novels',
  }
);

// Using the existing "novels" collection
export default mongoose.models.Novel || mongoose.model<NovelDocument>('Novel', novelSchema); 