import { Args, Mutation, Query, Resolver, Context } from '@nestjs/graphql';
import { UseGuards, ForbiddenException } from '@nestjs/common';

import { AttendanceService } from './attendance.service';
import { AttendanceType } from './dto/attendance.type';
import { AttendanceSessionType } from './dto/attendance-session.type';
import { MarkAttendanceInput } from './dto/attendance.dto';
import { CreateAttendanceSessionInput } from './dto/create-attendance-session.input';
import { AttendanceSummary } from './dto/attendance-summary.type';

import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { PermissionsGuard } from '../../guards/permissions.guard';
import { Roles } from '../../decorators/roles.decorator';
import { Permissions } from '../../decorators/permissions.decorator';

function extractUserId(context: any): string {
  const userId = context?.req?.user?.userId;
  if (!userId) {
    throw new ForbiddenException(
      'You must be logged in to perform this action',
    );
  }
  return userId;
}

function extractUserRole(context: any): string | undefined {
  return context?.req?.user?.role;
}

@Resolver()
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class AttendanceResolver {
  constructor(private readonly attendanceService: AttendanceService) {}

  // ─── Attendance Record Queries ────────────────────────────────────────────

  @Roles('User', 'Admin')
  @Permissions('attendance:view')
  @Query(() => [AttendanceType])
  studentAttendance(
    @Args('studentId', { type: () => String }) studentId: string,
  ) {
    return this.attendanceService.getStudentAttendance(studentId);
  }

  @Roles('User', 'Admin')
  @Permissions('attendance:view')
  @Query(() => [AttendanceType])
  courseAttendance(
    @Args('courseCode', { type: () => String }) courseCode: string,
  ) {
    return this.attendanceService.getCourseAttendance(courseCode);
  }

  @Roles('User', 'Admin')
  @Permissions('attendance:view')
  @Query(() => [AttendanceType])
  sessionAttendance(
    @Args('sessionId', { type: () => String }) sessionId: string,
  ) {
    return this.attendanceService.getSessionAttendance(sessionId);
  }

  @Roles('User', 'Admin')
  @Permissions('attendance:view')
  @Query(() => AttendanceSummary)
  studentAttendanceSummary(
    @Args('studentId', { type: () => String }) studentId: string,
  ) {
    return this.attendanceService.getStudentSummary(studentId);
  }

  // ─── Attendance Record Mutations ──────────────────────────────────────────

  /**
   * Students mark their own attendance by submitting the session password.
   * Teachers/Admins can mark on behalf of any enrolled student.
   *
   * The service enforces:
   *  - Student must be subscribed to the course.
   *  - Session (if provided) must belong to the same course and be active.
   */
  @Roles('User', 'Admin')
  @Permissions('attendance:mark')
  @Mutation(() => AttendanceType)
  markAttendance(
    @Args('input', { type: () => MarkAttendanceInput })
    input: MarkAttendanceInput,
    @Context() context: any,
  ) {
    const callerId = extractUserId(context);
    const callerRole = extractUserRole(context);

    // Students can only mark their own attendance
    if (callerRole === 'User' && input.studentId !== callerId) {
      throw new ForbiddenException('Users can only mark their own attendance');
    }

    return this.attendanceService.markAttendance(input);
  }

  // ─── Attendance Session Mutations ─────────────────────────────────────────

  @Roles('User', 'Admin')
  @Permissions('attendance:manage')
  @Mutation(() => AttendanceSessionType)
  createAttendanceSession(
    @Args('input', { type: () => CreateAttendanceSessionInput })
    input: CreateAttendanceSessionInput,
    @Context() context: any,
  ) {
    const userId = extractUserId(context);
    return this.attendanceService.createAttendanceSession({
      ...input,
      createdBy: userId,
    });
  }

  @Roles('User', 'Admin')
  @Permissions('attendance:manage')
  @Mutation(() => AttendanceSessionType)
  refreshAttendanceSessionPassword(
    @Args('sessionId', { type: () => String }) sessionId: string,
  ) {
    return this.attendanceService.refreshAttendanceSessionPassword(sessionId);
  }

  @Roles('User', 'Admin')
  @Permissions('attendance:manage')
  @Mutation(() => AttendanceSessionType)
  closeAttendanceSession(
    @Args('sessionId', { type: () => String }) sessionId: string,
  ) {
    return this.attendanceService.closeAttendanceSession(sessionId);
  }

  @Roles('User', 'Admin')
  @Permissions('attendance:manage')
  @Mutation(() => Boolean)
  deleteAttendanceSession(
    @Args('sessionId', { type: () => String }) sessionId: string,
  ) {
    return this.attendanceService.deleteAttendanceSession(sessionId);
  }

  // ─── Attendance Session Queries ───────────────────────────────────────────

  @Roles('User', 'Admin')
  @Permissions('attendance:view')
  @Query(() => [AttendanceSessionType])
  attendanceSessionsByCourse(
    @Args('courseCode', { type: () => String }) courseCode: string,
  ) {
    return this.attendanceService.getAttendanceSessionsByCourse(courseCode);
  }

  @Roles('User', 'Admin')
  @Permissions('attendance:view')
  @Query(() => [AttendanceSessionType])
  activeAttendanceSessionsByCourse(
    @Args('courseCode', { type: () => String }) courseCode: string,
  ) {
    return this.attendanceService.getActiveAttendanceSessionsByCourse(
      courseCode,
    );
  }

  @Roles('User', 'Admin')
  @Permissions('attendance:view')
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

  @Roles('User', 'Admin')
  @Permissions('attendance:view')
  @Query(() => AttendanceSessionType)
  attendanceSession(
    @Args('sessionId', { type: () => String }) sessionId: string,
  ) {
    return this.attendanceService.getSessionById(sessionId);
  }
}
