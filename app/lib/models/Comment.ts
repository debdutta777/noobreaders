import mongoose, { Schema } from 'mongoose';

export interface CommentDocument extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  chapterId: mongoose.Types.ObjectId;
  content: string;
  likes: number;
  parentCommentId?: mongoose.Types.ObjectId; // for replies
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<CommentDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    chapterId: {
      type: Schema.Types.ObjectId,
      ref: 'Chapter',
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    likes: {
      type: Number,
      default: 0,
    },
    parentCommentId: {
      type: Schema.Types.ObjectId,
      ref: 'Comment',
    },
  },
  {
    timestamps: true,
    collection: 'comments',
  }
);

// Create indexes for faster lookups
commentSchema.index({ chapterId: 1 });
commentSchema.index({ parentCommentId: 1 });

export default mongoose.models.Comment || mongoose.model<CommentDocument>('Comment', commentSchema); 