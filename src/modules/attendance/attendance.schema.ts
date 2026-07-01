import mongoose from 'mongoose';

export interface AttendanceAttrs {
  studentId: string;
  courseCode?: string | null;
  sessionId?: string | null;
  date?: string | null;
  status?: string | null;
  checkIn?: string | null;
  checkOut?: string | null;
  type?: string | null;
  time?: Date;
}

export interface AttendanceDoc extends mongoose.Document {
  studentId: string;
  courseCode?: string | null;
  sessionId?: string | null;
  date?: string | null;
  status?: string | null;
  checkIn?: string | null;
  checkOut?: string | null;
  type?: string | null;
  time?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AttendanceModel extends mongoose.Model<AttendanceDoc> {
  build(attrs: AttendanceAttrs): AttendanceDoc;
}

export const attendanceSchema = new mongoose.Schema(
  {
    studentId: { type: String, required: true },
    courseCode: { type: String, default: null },
    sessionId: { type: String, default: null },
    date: { type: String, default: null },
    status: { type: String, default: null },
    checkIn: { type: String, default: null },
    checkOut: { type: String, default: null },
    type: { type: String, default: null },
    time: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    collection: 'attendance',
  },
);

attendanceSchema.statics.build = (attrs: AttendanceAttrs) => {
  return new Attendance(attrs);
};

export const Attendance = mongoose.model<AttendanceDoc, AttendanceModel>(
  'Attendance',
  attendanceSchema,
);

// Required by NestJS MongooseModule.forFeature and @InjectModel
export const AttendanceSchema = attendanceSchema;
