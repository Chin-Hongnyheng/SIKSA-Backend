import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Attendance, AttendanceDoc } from './attendance.schema';
import { ScheduleDoc } from '../schedules/schedules.schema';
import {
  AttendanceSession,
  AttendanceSessionDoc,
} from './attendance_session.schema';

import { MarkAttendanceInput } from './dto/attendance.dto';
import { CreateAttendanceSessionInput } from './dto/create-attendance-session.input';
import { AttendanceSummary } from './dto/attendance-summary.type';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectModel(Attendance.modelName)
    private readonly attendanceModel: Model<AttendanceDoc>,

    @InjectModel(AttendanceSession.modelName)
    private readonly attendanceSessionModel: Model<AttendanceSessionDoc>,

    @InjectModel('Schedule')
    private readonly scheduleModel: Model<ScheduleDoc>,

    @InjectModel('Course')
    private readonly courseModel: Model<any>,
  ) {}

  // ─── Private Helpers ──────────────────────────────────────────────────────

  private generateSixDigitPassword(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private getPasswordExpiry(seconds = 60): Date {
    return new Date(Date.now() + seconds * 1000);
  }

  private parseLocalDate(dateStr: string): Date {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  private toMinutes(time: string): number {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  }

  private extractTimeString(value: Date | string): string {
    if (value instanceof Date) {
      const h = String(value.getHours()).padStart(2, '0');
      const m = String(value.getMinutes()).padStart(2, '0');
      return `${h}:${m}`;
    }
    return value;
  }

  private mapAttendanceDocument(doc: AttendanceDoc): any {
    const obj: any = doc.toObject();
    return {
      id: obj._id.toString(),
      studentId: obj.studentId,
      courseCode: obj.courseCode ?? null,
      sessionId: obj.sessionId ?? null,
      date: obj.date ?? null,
      status: obj.status ?? null,
      checkIn: obj.checkIn ?? null,
      checkOut: obj.checkOut ?? null,
      type: obj.type ?? null,
      time: obj.time,
    };
  }

  private mapSessionDocument(doc: AttendanceSessionDoc): any {
    const obj: any = doc.toObject();
    return {
      id: obj._id.toString(),
      courseCode: obj.courseCode,
      createdBy: obj.createdBy,
      title: obj.title,
      date: obj.date,
      startTime: obj.startTime,
      endTime: obj.endTime,
      password: obj.password,
      passwordExpiresAt: obj.passwordExpiresAt,
      passwordRefreshSeconds: obj.passwordRefreshSeconds ?? 60,
      lateAfterMinutes: obj.lateAfterMinutes ?? 15,
      isActive: obj.isActive,
    };
  }

  private scheduleCoversDate(
    schedule: ScheduleDoc,
    targetDate: string,
  ): boolean {
    const target = this.parseLocalDate(targetDate);
    const recurrence = schedule.recurrence_type?.toUpperCase();

    if (recurrence === 'NONE') {
      const schedDate =
        schedule.date instanceof Date
          ? schedule.date
          : this.parseLocalDate(schedule.date!);
      return schedDate.toDateString() === target.toDateString();
    }

    if (recurrence === 'DAILY') {
      const start =
        schedule.startDate instanceof Date
          ? schedule.startDate
          : this.parseLocalDate(schedule.startDate!);
      const end =
        schedule.endDate instanceof Date
          ? schedule.endDate
          : this.parseLocalDate(schedule.endDate!);
      return target >= start && target <= end;
    }

    if (recurrence === 'WEEKLY') {
      const start =
        schedule.startDate instanceof Date
          ? schedule.startDate
          : this.parseLocalDate(schedule.startDate!);
      const end =
        schedule.endDate instanceof Date
          ? schedule.endDate
          : this.parseLocalDate(schedule.endDate!);
      const dayName = target.toLocaleDateString('en-US', { weekday: 'long' });
      return (
        target >= start &&
        target <= end &&
        (schedule.selectedDays ?? []).includes(dayName)
      );
    }

    if (recurrence === 'MONTHLY') {
      const start =
        schedule.startDate instanceof Date
          ? schedule.startDate
          : this.parseLocalDate(schedule.startDate!);
      const end =
        schedule.endDate instanceof Date
          ? schedule.endDate
          : this.parseLocalDate(schedule.endDate!);
      return (
        target >= start && target <= end && target.getDate() === start.getDate()
      );
    }

    return false;
  }

  // ─── Session CRUD ─────────────────────────────────────────────────────────

  async createAttendanceSession(
    input: CreateAttendanceSessionInput & { createdBy: string },
  ): Promise<any> {
    const course = await this.courseModel.findOne({
      courseCode: input.courseCode,
    });
    if (!course) {
      throw new NotFoundException(`Course "${input.courseCode}" not found`);
    }

    const schedules = await this.scheduleModel.find({
      course: course._id,
      created_by: input.createdBy,
    });

    if (schedules.length === 0) {
      throw new BadRequestException(
        `No schedules found for course "${input.courseCode}". Create a schedule first.`,
      );
    }

    const matchingSchedule = schedules.find((s) =>
      this.scheduleCoversDate(s, input.date),
    );

    if (!matchingSchedule) {
      throw new BadRequestException(
        `No schedule found for course "${input.courseCode}" on ${input.date}. ` +
          `Check your schedule dates and recurrence settings.`,
      );
    }

    const scheduleStart = this.extractTimeString(matchingSchedule.start_time);
    const scheduleEnd = this.extractTimeString(matchingSchedule.end_time);

    const scheduleStartMin = this.toMinutes(scheduleStart);
    const scheduleEndMin = this.toMinutes(scheduleEnd);
    const sessionStartMin = this.toMinutes(input.startTime);
    const sessionEndMin = this.toMinutes(input.endTime);

    if (sessionStartMin < scheduleStartMin || sessionEndMin > scheduleEndMin) {
      throw new BadRequestException(
        `Session time ${input.startTime}–${input.endTime} must be within ` +
          `the scheduled window ${scheduleStart}–${scheduleEnd}.`,
      );
    }

    const refreshSeconds = input.passwordRefreshSeconds ?? 60;

    const session = await this.attendanceSessionModel.create({
      courseCode: input.courseCode,
      createdBy: input.createdBy,
      title: input.title,
      date: input.date,
      startTime: input.startTime,
      endTime: input.endTime,
      password: this.generateSixDigitPassword(),
      passwordExpiresAt: this.getPasswordExpiry(refreshSeconds),
      passwordRefreshSeconds: refreshSeconds,
      lateAfterMinutes: input.lateAfterMinutes ?? 15,
      isActive: true,
    });

    return this.mapSessionDocument(session);
  }

  async refreshAttendanceSessionPassword(sessionId: string): Promise<any> {
    const session = await this.attendanceSessionModel.findById(sessionId);

    if (!session) {
      throw new NotFoundException('Attendance session not found');
    }
    if (!session.isActive) {
      throw new BadRequestException('Attendance session is already closed');
    }

    session.password = this.generateSixDigitPassword();
    session.passwordExpiresAt = this.getPasswordExpiry(
      session.passwordRefreshSeconds ?? 60,
    );

    await session.save();
    return this.mapSessionDocument(session);
  }

  async getAttendanceSessionsByCourse(courseCode: string): Promise<any[]> {
    const sessions = await this.attendanceSessionModel
      .find({ courseCode })
      .sort({ date: -1, createdAt: -1 });

    return sessions.map((s) => this.mapSessionDocument(s));
  }

  async getActiveAttendanceSessionsByCourse(
    courseCode: string,
  ): Promise<any[]> {
    const sessions = await this.attendanceSessionModel
      .find({ courseCode, isActive: true })
      .sort({ date: -1, createdAt: -1 });

    return sessions.map((s) => this.mapSessionDocument(s));
  }

  async closeAttendanceSession(sessionId: string): Promise<any> {
    const session = await this.attendanceSessionModel.findByIdAndUpdate(
      sessionId,
      { isActive: false },
      { new: true },
    );

    if (!session) {
      throw new NotFoundException('Attendance session not found');
    }

    return this.mapSessionDocument(session);
  }

  async deleteAttendanceSession(sessionId: string): Promise<boolean> {
    await this.attendanceModel.deleteMany({ sessionId }).exec();

    const result = await this.attendanceSessionModel
      .deleteOne({ _id: sessionId })
      .exec();

    return result.deletedCount > 0;
  }

  // ─── Attendance Records ───────────────────────────────────────────────────

  async markAttendance(input: MarkAttendanceInput): Promise<any> {
    // 1. Verify course and enrollment
    const course = await this.courseModel.findOne({
      courseCode: input.courseCode,
    });
    if (!course) {
      throw new NotFoundException(`Course "${input.courseCode}" not found`);
    }

    const isSubscribed = (course.subscribers ?? [])
      .map((s: any) => s.toString())
      .includes(input.studentId);

    if (!isSubscribed) {
      throw new ForbiddenException(
        `Student is not enrolled in course "${input.courseCode}"`,
      );
    }

    // 2. Validate session exists and belongs to this course
    //    Note: we allow marking even on closed sessions so teachers
    //    can manually correct records after a session ends.
    let session: AttendanceSessionDoc | null = null;

    if (input.sessionId) {
      session = await this.attendanceSessionModel.findById(input.sessionId);

      if (!session) {
        throw new NotFoundException('Attendance session not found');
      }
      if (session.courseCode !== input.courseCode) {
        throw new ForbiddenException('Session does not belong to this course');
      }
      // Intentionally NOT checking session.isActive here so teachers
      // can override / correct attendance after the session closes.
    }

    // 3. Determine final status
    const manualStatuses = ['absent', 'permission', 'present', 'late'];
    const isManualOverride =
      input.status && manualStatuses.includes(input.status) && !input.checkIn;

    let status: string;

    if (isManualOverride) {
      // Teacher manually setting status without a checkIn time
      status = input.status!;
    } else if (input.status === 'absent' || input.status === 'permission') {
      status = input.status;
    } else {
      // Derive present/late from checkIn time
      if (!session) {
        throw new BadRequestException(
          'A sessionId is required to mark present or late',
        );
      }
      if (!input.checkIn) {
        throw new BadRequestException(
          'checkIn time is required to mark present or late',
        );
      }

      const sessionStartMin = this.toMinutes(session.startTime);
      const sessionEndMin = this.toMinutes(session.endTime);
      const checkInMin = this.toMinutes(input.checkIn);

      if (checkInMin < sessionStartMin || checkInMin > sessionEndMin) {
        throw new BadRequestException(
          `Check-in time ${input.checkIn} is outside the session window ` +
            `${session.startTime}–${session.endTime}`,
        );
      }

      const lateAfter = session.lateAfterMinutes ?? 15;
      status = checkInMin <= sessionStartMin + lateAfter ? 'present' : 'late';
    }

    // 4. Upsert — always overwrite so teacher can correct any record
    const filter = {
      studentId: input.studentId,
      sessionId: input.sessionId ?? null,
    };

    const update = {
      $set: {
        courseCode: input.courseCode,
        sessionId: input.sessionId ?? null,
        date: input.date,
        status,
        type: status,
        checkIn:
          input.status === 'absent' || input.status === 'permission'
            ? null
            : (input.checkIn ?? null),
        checkOut:
          input.status === 'absent' || input.status === 'permission'
            ? null
            : (session?.endTime ?? null),
        time: new Date(),
      },
    };

    const record = await this.attendanceModel.findOneAndUpdate(filter, update, {
      new: true,
      upsert: true,
    });

    return this.mapAttendanceDocument(record);
  }

  async getStudentAttendance(studentId: string): Promise<any[]> {
    const records = await this.attendanceModel
      .find({ studentId })
      .sort({ date: -1, createdAt: -1 });

    return records.map((r) => this.mapAttendanceDocument(r));
  }

  async getCourseAttendance(courseCode: string): Promise<any[]> {
    const records = await this.attendanceModel
      .find({ courseCode })
      .sort({ date: -1, createdAt: -1 });

    return records.map((r) => this.mapAttendanceDocument(r));
  }

  async getSessionAttendance(sessionId: string): Promise<any[]> {
    const records = await this.attendanceModel
      .find({ sessionId })
      .sort({ createdAt: -1 });

    return records.map((r) => this.mapAttendanceDocument(r));
  }

  async getStudentSummary(studentId: string): Promise<AttendanceSummary> {
    const records = await this.attendanceModel.find({ studentId });

    const summary: AttendanceSummary = {
      present: 0,
      late: 0,
      absent: 0,
      permission: 0,
    };

    for (const record of records) {
      const status = record.status ?? record.type;
      if (status === 'present') summary.present += 1;
      if (status === 'late') summary.late += 1;
      if (status === 'absent') summary.absent += 1;
      if (status === 'permission') summary.permission += 1;
    }

    return summary;
  }

  async verifyAttendanceSessionPassword(
    sessionId: string,
    password: string,
  ): Promise<boolean> {
    const session = await this.attendanceSessionModel.findById(sessionId);

    if (!session) return false;
    if (!session.isActive) return false;
    if (new Date() > session.passwordExpiresAt) return false;

    return session.password === password;
  }

  async getSessionById(sessionId: string): Promise<any> {
    const session = await this.attendanceSessionModel.findById(sessionId);
    if (!session) {
      throw new NotFoundException('Attendance session not found');
    }
    return this.mapSessionDocument(session);
  }
}
