import mongoose, { Schema } from 'mongoose';

export interface UserDocument extends mongoose.Document {
  name: string;
  email: string;
  password?: string;
  image?: string;
  userType: 'reader' | 'writer';
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<UserDocument>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
    },
    image: {
      type: String,
    },
    userType: {
      type: String,
      enum: ['reader', 'writer'],
      default: 'reader',
    },
  },
  {
    timestamps: true,
    collection: 'reader-user', // This is a new collection for readers
  }
);

// Check if the model already exists to prevent overwriting during hot reloads
export default mongoose.models.User || mongoose.model<UserDocument>('User', userSchema); 