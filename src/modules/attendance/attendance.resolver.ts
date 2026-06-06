import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { AttendanceService } from './attendance.service';

import { Attendance } from './schemas/attendance.schema';
import { AttendanceSession } from './schemas/attendance-session.schema';

import { MarkAttendanceInput } from './dto/attendance.dto';
import { CreateAttendanceSessionInput } from './dto/create-attendance-session.input';
import { AttendanceSummary } from './dto/attendance-summary.type';

@Resolver(() => Attendance)
export class AttendanceResolver {
  constructor(private readonly attendanceService: AttendanceService) {}

  // =========================
  // ATTENDANCE RECORD QUERIES
  // =========================

  @Query(() => [Attendance])
  studentAttendance(
    @Args('studentId', { type: () => String }) studentId: string,
  ) {
    return this.attendanceService.getStudentAttendance(studentId);
  }

  @Query(() => [Attendance])
  courseAttendance(
    @Args('courseId', { type: () => String }) courseId: string,
  ) {
    return this.attendanceService.getCourseAttendance(courseId);
  }

  @Query(() => [Attendance])
  sessionAttendance(
    @Args('sessionId', { type: () => String }) sessionId: string,
  ) {
    return this.attendanceService.getSessionAttendance(sessionId);
  }

  @Query(() => AttendanceSummary)
  studentAttendanceSummary(
    @Args('studentId', { type: () => String }) studentId: string,
  ) {
    return this.attendanceService.getStudentSummary(studentId);
  }

  // =========================
  // ATTENDANCE RECORD MUTATION
  // =========================

  @Mutation(() => Attendance)
  markAttendance(
    @Args('input', { type: () => MarkAttendanceInput })
    input: MarkAttendanceInput,
  ) {
    return this.attendanceService.markAttendance(input);
  }

  // =========================
  // ATTENDANCE SESSION MUTATIONS
  // =========================

  @Mutation(() => AttendanceSession)
  createAttendanceSession(
    @Args('input', { type: () => CreateAttendanceSessionInput })
    input: CreateAttendanceSessionInput,
  ) {
    return this.attendanceService.createAttendanceSession(input);
  }

  @Mutation(() => AttendanceSession)
  refreshAttendanceSessionPassword(
    @Args('sessionId', { type: () => String }) sessionId: string,
  ) {
    return this.attendanceService.refreshAttendanceSessionPassword(sessionId);
  }

  @Mutation(() => AttendanceSession)
  closeAttendanceSession(
    @Args('sessionId', { type: () => String }) sessionId: string,
  ) {
    return this.attendanceService.closeAttendanceSession(sessionId);
  }

  @Mutation(() => Boolean)
  deleteAttendanceSession(
    @Args('sessionId', { type: () => String }) sessionId: string,
  ) {
    return this.attendanceService.deleteAttendanceSession(sessionId);
  }

  // =========================
  // ATTENDANCE SESSION QUERIES
  // =========================

  @Query(() => [AttendanceSession])
  attendanceSessionsByCourse(
    @Args('courseId', { type: () => String }) courseId: string,
  ) {
    return this.attendanceService.getAttendanceSessionsByCourse(courseId);
  }

  @Query(() => [AttendanceSession])
  activeAttendanceSessionsByCourse(
    @Args('courseId', { type: () => String }) courseId: string,
  ) {
    return this.attendanceService.getActiveAttendanceSessionsByCourse(courseId);
  }

  @Query(() => Boolean)
  verifyAttendanceSessionPassword(
    @Args('sessionId', { type: () => String }) sessionId: string,
    @Args('password', { type: () => String }) password: string,
  ) {
    return this.attendanceService.verifyAttendanceSessionPassword(
      sessionId,
      password,
    );
  }
}