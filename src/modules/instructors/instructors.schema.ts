import mongoose from 'mongoose';
import { randomUUID } from 'crypto';

export interface InstructorAttrs {
  instructorName: string;
  email: string;
  phone: number;
  password: string;
  dob?: Date;
  gender?: 'male' | 'female' | 'other';
  address?: string;
  photo_url?: string;
  year?: number;
}

export interface InstructorDoc extends mongoose.Document {
  instructorId: string;
  instructorName: string;
  email: string;
  phone: number;
  password: string;
  dob?: Date;
  gender?: 'male' | 'female' | 'other';
  address?: string;
  photo_url?: string;
  year?: number;
  created_at: Date;
}

export interface InstructorModel extends mongoose.Model<InstructorDoc> {
  build(attrs: InstructorAttrs): InstructorDoc;
}

// schema
export const instructorSchema = new mongoose.Schema({
  instructorId: { type: String, default: () => randomUUID(), unique: true },
  instructorName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: Number, required: true },
  password: { type: String, required: true },
  dob: { type: Date, default: null },
  gender: { type: String, enum: ['Male', 'Female', 'Other'] , default: null},
  address: { type: String , default: null},
  photo_url: { type: String, default: null },
  year: { type: Number, default: null},
  created_at: { type: Date, default: Date.now }
});

// creates a new Instructor document
instructorSchema.statics.build = (attrs: InstructorAttrs) => {
  return new Instructor(attrs);
};

// creates the Instructor model
export const Instructor = mongoose.model<InstructorDoc, InstructorModel>(
  'Instructor',
  instructorSchema
);