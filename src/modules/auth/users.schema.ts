import mongoose from 'mongoose';
import { randomUUID } from 'crypto';

// Create the data
export interface UserAttrs {
  userName: string;
  email: string;
  phone?: number;
  password: string;
  role?: 'User' | 'Admin';

  dob?: Date;
  gender?: 'Male' | 'Female' | 'Other';
  address?: string;
  photo_url?: string;
  fcmToken?: string;

  // notification?: 'ON' | 'OFF';
  // language?: 'ENGLISH' | 'KHMER';
}

// Store the data
export interface UserDoc extends mongoose.Document {
  // userId: string;
  userName: string;
  email: string;
  phone: number;
  password: string;
  role: 'User' | 'Admin';
  dob?: Date;
  gender?: 'Male' | 'Female' | 'Other';
  address?: string;
  photo_url?: string;
  fcmToken?: string | null;

  // notification?: 'ON' | 'OFF';
  // language?: 'ENGLISH' | 'KHMER';
  created_at: Date;
}

export interface UserModel extends mongoose.Model<UserDoc> {
  build(attrs: UserAttrs): UserDoc;
}

// schema
export const userSchema = new mongoose.Schema({
  userName: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  phone: { type: Number, required: false, unique: true, sparse: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['User', 'Admin'],
    default: 'User',
  },
  dob: { type: Date, default: null },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other', null, ''],
    default: null,
  },
  address: { type: String, default: null },
  photo_url: { type: String, default: null },
  fcmToken: { type: String, default: null },
  // notification: { type: String, enum: ['ON', 'OFF'], default: 'ON' },
  // language: { type: String, enum: ['ENGLISH', 'KHMER'], default: 'ENGLISH' },

  created_at: { type: Date, default: Date.now },
});

// creates a new User document
userSchema.statics.build = (attrs: UserAttrs) => {
  return new User(attrs);
};

// creates the User model
export const User = mongoose.model<UserDoc, UserModel>('User', userSchema);
