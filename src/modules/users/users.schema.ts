import mongoose from 'mongoose';
import { randomUUID } from 'crypto';

// Create the data
export interface UserAttrs {
  userName: string;
  email: string;
  phone: number;
  password: string;
  role?: 'student' | 'teacher' | 'admin';

  dob?: Date;
  gender?: 'male' | 'female' | 'other';
  address?: string;
  photo_url?: string;
  year?: number;

  notification?: 'ON' | 'OFF';
  language?: string;
}

// Store the data
export interface UserDoc extends mongoose.Document {
  // userId: string;
  userName: string;
  email: string;
  phone: number;
  password: string;
  role: 'student' | 'teacher' | 'admin';
  dob?: Date;
  gender?: 'male' | 'female' | 'other';
  address?: string;
  photo_url?: string;
  year?: number;

  notification?: 'ON' | 'OFF';
  language?: string;
  created_at: Date;
}

export interface UserModel extends mongoose.Model<UserDoc> {
  build(attrs: UserAttrs): UserDoc;
}

// schema
export const userSchema = new mongoose.Schema({
  // userId: { type: String, default: () => randomUUID(), unique: true },
  userName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: Number, required: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['student', 'teacher', 'admin'],
    default: 'student'
  },
  dob: { type: Date, default: null },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], default: null },
  address: { type: String, default: null },
  photo_url: { type: String, default: null },
  year: { type: Number, default: null },
  notification: { type: String, enum: ['ON', 'OFF'], default: null },
  language: { type: String, default: null },

  created_at: { type: Date, default: Date.now }
});

// creates a new User document
userSchema.statics.build = (attrs: UserAttrs) => {
  return new User(attrs);
};

// creates the User model
export const User = mongoose.model<UserDoc, UserModel>(
  'User',
  userSchema
);