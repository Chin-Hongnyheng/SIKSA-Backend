import mongoose from 'mongoose';

export interface ScheduleAttrs {
  course: mongoose.Types.ObjectId;
  created_by: mongoose.Types.ObjectId;
  location: string;
  start_time: Date;
  end_time: Date;
  color: string;
  reminder: number;
  recurrence_type: string;
  date: Date;
  startDate: Date;
  endDate: Date;
  selectedDays: string[];
}

export interface ScheduleDoc extends mongoose.Document {
  course: mongoose.Types.ObjectId;
  created_by: mongoose.Types.ObjectId;
  location: string;
  start_time: Date;
  end_time: Date;
  color: string;
  reminder: number;
  recurrence_type: string;
  date: Date;
  startDate: Date;
  endDate: Date;
  selectedDays: string[];
  created_at: Date;
}

export interface ScheduleModel extends mongoose.Model<ScheduleDoc> {
  build(attrs: ScheduleAttrs): ScheduleDoc;
}

export const scheduleSchema = new mongoose.Schema({
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
  location: { type: String, default: null },
  start_time: { type: Date, required: true },
  end_time: { type: Date, required: true },
  color: { type: String, default: '#2E7D32' },
  reminder: { type: Number, default: 0 },
  recurrence_type: {
    type: String,
    required: true,
    enum: ['NONE', 'DAILY', 'WEEKLY', 'MONTHLY'],
  },
  date: { type: Date, default: null },
  startDate: { type: Date, default: null },
  endDate: { type: Date, default: null },
  selectedDays: { type: [String], default: [] },
  created_at: { type: Date, default: Date.now },
});

export const Schedule = mongoose.model<ScheduleDoc, ScheduleModel>(
  'Schedule',
  scheduleSchema,
);

scheduleSchema.statics.build = (attrs: ScheduleAttrs) => {
  return new Schedule(attrs);
};
