import mongoose from 'mongoose';

export interface AssessmentFolderAttrs {
  name: string;
  colorHex: string;
  assessmentKeys?: string[];
  user: mongoose.Types.ObjectId;
  order?: number;
}

export interface AssessmentFolderDoc extends mongoose.Document {
  name: string;
  colorHex: string;
  assessmentKeys: string[];
  user: mongoose.Types.ObjectId;
  order: number;
  created_at: Date;
}

export interface AssessmentFolderModel extends mongoose.Model<AssessmentFolderDoc> {
  build(attrs: AssessmentFolderAttrs): AssessmentFolderDoc;
}

export const assessmentFolderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  colorHex: { type: String, required: true },
  assessmentKeys: { type: [String], default: [] },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  order: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now },
});

assessmentFolderSchema.statics.build = (attrs: AssessmentFolderAttrs) => {
  return new AssessmentFolder(attrs);
};

export const AssessmentFolder = mongoose.model<AssessmentFolderDoc, AssessmentFolderModel>(
  'AssessmentFolder',
  assessmentFolderSchema,
);
