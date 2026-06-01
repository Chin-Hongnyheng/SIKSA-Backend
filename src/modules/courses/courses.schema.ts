import mongoose from 'mongoose';

export interface CourseAttrs {
  courseName: string;
  courseCode: string;
  description: string;
  created_by: mongoose.Types.ObjectId;
}

export interface CourseDoc extends mongoose.Document {
  courseName: string;
  courseCode: string;
  description?: string;
  created_by: mongoose.Types.ObjectId;
  subscribers: mongoose.Types.ObjectId[];
  created_at: Date;
}

export interface CourseModel extends mongoose.Model<CourseDoc> {
  build(attrs: CourseAttrs): CourseDoc;
}

export const courseSchema = new mongoose.Schema({
  courseName: { type: String, required: true, unique: true },
  courseCode: { type: String, required: true, unique: true },
  description: { type: String, default: null },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  subscribers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: [],
    },
  ],
  created_at: { type: Date, default: Date.now },
});

courseSchema.statics.build = (attrs: CourseAttrs) => {
  return new Course(attrs);
};

export const Course = mongoose.model<CourseDoc, CourseModel>(
  'Course',
  courseSchema,
);
