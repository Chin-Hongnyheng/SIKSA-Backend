import mongoose from 'mongoose';

export interface AttendanceSessionAttrs {
  courseCode: string;
  createdBy: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  password: string;
  passwordExpiresAt: Date;
  passwordRefreshSeconds?: number;
  lateAfterMinutes?: number;
  isActive?: boolean;
}

export interface AttendanceSessionDoc extends mongoose.Document {
  courseCode: string;
  createdBy: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  password: string;
  passwordExpiresAt: Date;
  passwordRefreshSeconds: number;
  lateAfterMinutes: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AttendanceSessionModel extends mongoose.Model<AttendanceSessionDoc> {
  build(attrs: AttendanceSessionAttrs): AttendanceSessionDoc;
}

export const attendanceSessionSchema = new mongoose.Schema(
  {
    courseCode: { type: String, required: true },
    createdBy: { type: String, required: true },
    title: { type: String, required: true },
    date: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    password: { type: String, required: true },
    passwordExpiresAt: { type: Date, required: true },
    passwordRefreshSeconds: { type: Number, default: 60 },
    lateAfterMinutes: { type: Number, default: 15 },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    collection: 'attendance_sessions',
  },
);

attendanceSessionSchema.statics.build = (attrs: AttendanceSessionAttrs) => {
  return new AttendanceSession(attrs);
};

export const AttendanceSession = mongoose.model<
  AttendanceSessionDoc,
  AttendanceSessionModel
>('AttendanceSession', attendanceSessionSchema);

export const AttendanceSessionSchema = attendanceSessionSchema;
