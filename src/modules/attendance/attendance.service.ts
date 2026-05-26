import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  Attendance,
  AttendanceDocument,
} from './schemas/attendance.schema';

import {
  AttendanceSession,
  AttendanceSessionDocument,
} from './schemas/attendance-session.schema';

import { MarkAttendanceInput } from './dto/attendance.dto';
import { CreateAttendanceSessionInput } from './dto/create-attendance-session.input';
import { AttendanceSummary } from './dto/attendance-summary.type';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectModel(Attendance.name)
    private readonly attendanceModel: Model<AttendanceDocument>,

    @InjectModel(AttendanceSession.name)
    private readonly attendanceSessionModel: Model<AttendanceSessionDocument>,
  ) {}

  private generateSixDigitPassword(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private getPasswordExpiry(seconds = 60): Date {
    return new Date(Date.now() + seconds * 1000);
  }

  private mapAttendanceDocument(doc: AttendanceDocument): Attendance {
    const obj: any = doc.toObject();

    return {
      id: obj._id.toString(),
      studentId: obj.studentId,
      courseId: obj.courseId ?? null,
      sessionId: obj.sessionId ?? null,
      date: obj.date ?? null,
      status: obj.status ?? null,
      checkIn: obj.checkIn ?? null,
      checkOut: obj.checkOut ?? null,
      type: obj.type ?? null,
      time: obj.time,
    };
  }

  private mapSessionDocument(
    doc: AttendanceSessionDocument,
  ): AttendanceSession {
    const obj: any = doc.toObject();

    return {
      id: obj._id.toString(),
      courseId: obj.courseId,
      teacherId: obj.teacherId,
      title: obj.title,
      date: obj.date,
      startTime: obj.startTime,
      endTime: obj.endTime ?? null,
      password: obj.password,
      passwordExpiresAt: obj.passwordExpiresAt,
      passwordRefreshSeconds: obj.passwordRefreshSeconds ?? 60,
      lateAfterMinutes: obj.lateAfterMinutes ?? 15,
      isActive: obj.isActive,
    };
  }

  async markAttendance(input: MarkAttendanceInput): Promise<Attendance> {
    const attendance = await this.attendanceModel.create({
      studentId: input.studentId,
      courseId: input.courseId,
      sessionId: input.sessionId ?? null,
      date: input.date,
      status: input.status,
      checkIn: input.checkIn ?? null,
      checkOut: input.checkOut ?? null,
      type: input.status,
      time: new Date(),
    });

    return this.mapAttendanceDocument(attendance);
  }

  async checkIn(studentId: string, time: string): Promise<Attendance> {
    const attendance = await this.attendanceModel.create({
      studentId,
      type: 'check-in',
      status: 'check-in',
      time: new Date(time),
    });

    return this.mapAttendanceDocument(attendance);
  }

  async checkOut(studentId: string, time: string): Promise<Attendance> {
    const attendance = await this.attendanceModel.create({
      studentId,
      type: 'check-out',
      status: 'check-out',
      time: new Date(time),
    });

    return this.mapAttendanceDocument(attendance);
  }

  async getStudentAttendance(studentId: string): Promise<Attendance[]> {
    const records = await this.attendanceModel
      .find({ studentId })
      .sort({ createdAt: -1 });

    return records.map((record) => this.mapAttendanceDocument(record));
  }

  async getCourseAttendance(courseId: string): Promise<Attendance[]> {
    const records = await this.attendanceModel
      .find({ courseId })
      .sort({ createdAt: -1 });

    return records.map((record) => this.mapAttendanceDocument(record));
  }

  async getSessionAttendance(sessionId: string): Promise<Attendance[]> {
    const records = await this.attendanceModel
      .find({ sessionId })
      .sort({ createdAt: -1 });

    return records.map((record) => this.mapAttendanceDocument(record));
  }

  async getStudentSummary(studentId: string): Promise<AttendanceSummary> {
    const records = await this.attendanceModel.find({ studentId });

    const summary: AttendanceSummary = {
      earlyLeave: 0,
      absents: 0,
      late: 0,
      permission: 0,
    };

    for (const record of records) {
      const status = record.status ?? record.type;

      if (status === 'early-leave') {
        summary.earlyLeave += 1;
      }

      if (status === 'absent') {
        summary.absents += 1;
      }

      if (status === 'late') {
        summary.late += 1;
      }

      if (status === 'permission') {
        summary.permission += 1;
      }
    }

    return summary;
  }

  async createAttendanceSession(
    input: CreateAttendanceSessionInput,
  ): Promise<AttendanceSession> {
    const refreshSeconds = input.passwordRefreshSeconds ?? 60;

    const session = await this.attendanceSessionModel.create({
      courseId: input.courseId,
      teacherId: input.teacherId,
      title: input.title,
      date: input.date,
      startTime: input.startTime,
      endTime: input.endTime ?? null,
      password: this.generateSixDigitPassword(),
      passwordExpiresAt: this.getPasswordExpiry(refreshSeconds),
      passwordRefreshSeconds: refreshSeconds,
      lateAfterMinutes: input.lateAfterMinutes ?? 15,
      isActive: true,
    });

    return this.mapSessionDocument(session);
  }

  async refreshAttendanceSessionPassword(
    sessionId: string,
  ): Promise<AttendanceSession> {
    const session = await this.attendanceSessionModel.findById(sessionId);

    if (!session) {
      throw new Error('Attendance session not found');
    }

    if (!session.isActive) {
      throw new Error('Attendance session is already closed');
    }

    session.password = this.generateSixDigitPassword();
    session.passwordExpiresAt = this.getPasswordExpiry(
      session.passwordRefreshSeconds ?? 60,
    );

    await session.save();

    return this.mapSessionDocument(session);
  }

  async getAttendanceSessionsByCourse(
    courseId: string,
  ): Promise<AttendanceSession[]> {
    const sessions = await this.attendanceSessionModel
      .find({ courseId })
      .sort({ createdAt: -1 });

    return sessions.map((session) => this.mapSessionDocument(session));
  }

  async getActiveAttendanceSessionsByCourse(
    courseId: string,
  ): Promise<AttendanceSession[]> {
    const sessions = await this.attendanceSessionModel
      .find({
        courseId,
        isActive: true,
      })
      .sort({ createdAt: -1 });

    return sessions.map((session) => this.mapSessionDocument(session));
  }

  async closeAttendanceSession(
    sessionId: string,
  ): Promise<AttendanceSession> {
    const session = await this.attendanceSessionModel.findByIdAndUpdate(
      sessionId,
      {
        isActive: false,
      },
      {
        new: true,
      },
    );

    if (!session) {
      throw new Error('Attendance session not found');
    }

    return this.mapSessionDocument(session);
  }

  async verifyAttendanceSessionPassword(
    sessionId: string,
    password: string,
  ): Promise<boolean> {
    const session = await this.attendanceSessionModel.findById(sessionId);

    if (!session) {
      return false;
    }

    if (!session.isActive) {
      return false;
    }

    if (new Date() > session.passwordExpiresAt) {
      return false;
    }

    return session.password === password;
  }

 async deleteAttendanceSession(sessionId: string): Promise<boolean> {
    const result = await this.attendanceSessionModel.findByIdAndDelete(sessionId);
    return result !== null;
  }
}