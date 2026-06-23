import mongoose from 'mongoose';

export interface GradeAttrs {
  studentId: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  assessmentName: string;
  score: number;
  maxScore: number;
  gradedBy: mongoose.Types.ObjectId;
}

export interface GradeDoc extends mongoose.Document {
  studentId: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  assessmentName: string;
  score: number;
  maxScore: number;
  gradedBy: mongoose.Types.ObjectId;
  gradedAt: Date;
}

export interface GradeModel extends mongoose.Model<GradeDoc> {
  build(attrs: GradeAttrs): GradeDoc;
}

export const gradeSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  assessmentName: { type: String, required: true },
  score: { type: Number, required: true, min: 0 },
  maxScore: { type: Number, required: true, default: 100, min: 1 },
  gradedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  gradedAt: { type: Date, default: Date.now },
});

gradeSchema.statics.build = (attrs: GradeAttrs) => {
  return new Grade(attrs);
};

// One grade per student per assessment per course
gradeSchema.index(
  { studentId: 1, course: 1, assessmentName: 1 },
  { unique: true },
);

export const Grade = mongoose.model<GradeDoc, GradeModel>(
  'Grade',
  gradeSchema,
);
