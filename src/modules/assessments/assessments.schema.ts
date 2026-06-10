import mongoose from 'mongoose';

export interface AssessmentAttrs {
  assessmentName: string;
  guide?: string;
  course: mongoose.Types.ObjectId;
  created_by: mongoose.Types.ObjectId;
}

export interface AssessmentDoc extends mongoose.Document {
  assessmentName: string;
  guide?: string;
  course: mongoose.Types.ObjectId;
  created_by: mongoose.Types.ObjectId;
  created_at: Date;
}

export interface AssessmentModel extends mongoose.Model<AssessmentDoc> {
  build(attrs: AssessmentAttrs): AssessmentDoc;
}

export const assessmentSchema = new mongoose.Schema({
  assessmentName: { type: String, required: true },
  guide: { type: String, default: null },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  created_at: { type: Date, default: Date.now },
});

assessmentSchema.statics.build = (attrs: AssessmentAttrs) => {
  return new Assessment(attrs);
};

assessmentSchema.index({ assessmentName: 1, course: 1 }, { unique: true });

export const Assessment = mongoose.model<AssessmentDoc, AssessmentModel>(
  'Assessment',
  assessmentSchema,
);
