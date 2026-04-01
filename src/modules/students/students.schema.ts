import mongoose from 'mongoose';
import { randomUUID } from 'crypto';

export interface StudentAttrs {
  studentName: string;
  email: string;
  phone: number;
  courseId?: string;
  gender?: 'male' | 'female' | 'other';
  address?: string;
  photo_url?: string;
  year?: number;
  idCard?: string;
  dob?: Date;
  academicTranscript?: string;
  notification?: 'ON' | 'OFF';
  Language?: string;
  enrollment_status?: 'Active' | 'Graduated' | 'Suspended';
}

export interface StudentDoc extends mongoose.Document {
  studentId: string;
  studentName: string;
  email: string;
  phone: number;
  courseId?: string;
  gender?: 'male' | 'female' | 'other';
  address?: string;
  photo_url?: string;
  year?: number;
  idCard?: string;
  dob?: Date;
  academicTranscript?: string;
  notification?: 'ON' | 'OFF';
  Language?: string;
  created_at: Date;
  enrollment_status: 'Active' | 'Graduated' | 'Suspended';
}

export interface StudentModel extends mongoose.Model<StudentDoc> {
  build(attrs: StudentAttrs): StudentDoc;
}

export const studentSchema = new mongoose.Schema({
  studentId: { type: String, default: () => randomUUID(), unique: true },
  studentName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: Number, required: true },
  courseId: { type: String }, // Can be ObjectId if Course schema uses OjbectId, here it's String as per spec
  gender: { type: String, enum: ['male', 'female', 'other'] },
  address: { type: String },
  photo_url: { type: String },
  year: { type: Number },
  idCard: { type: String },
  dob: { type: Date },
  academicTranscript: { type: String },
  notification: { type: String, enum: ['ON', 'OFF'] },
  Language: { type: String },
  created_at: { type: Date, default: Date.now },
  enrollment_status: { 
    type: String, 
    enum: ['Active', 'Graduated', 'Suspended'],
    default: 'Active'
  }
});

// creates a new Student document
studentSchema.statics.build = (attrs: StudentAttrs) => {
  return new Student(attrs);
};

// creates the Student model
export const Student = mongoose.model<StudentDoc, StudentModel>(
  'Student',
  studentSchema
);
