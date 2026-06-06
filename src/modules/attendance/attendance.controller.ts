import { Body, Controller, Get, Param, Post } from '@nestjs/common';

import { AttendanceService } from './attendance.service';
import { MarkAttendanceInput } from './dto/attendance.dto';
import { CreateAttendanceSessionInput } from './dto/create-attendance-session.input';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('mark')
  markAttendance(@Body() body: MarkAttendanceInput) {
    if (
      !body ||
      !body.studentId ||
      !body.courseId ||
      !body.date ||
      !body.status
    ) {
      return {
        message: 'Invalid request body',
      };
    }

    return this.attendanceService.markAttendance(body);
  }

  @Post('session')
  createAttendanceSession(@Body() body: CreateAttendanceSessionInput) {
    if (
      !body ||
      !body.courseId ||
      !body.teacherId ||
      !body.title ||
      !body.date ||
      !body.startTime ||
      !body.endTime
    ) {
      return {
        message: 'Invalid request body',
      };
    }

    return this.attendanceService.createAttendanceSession(body);
  }

  @Get('student/:studentId/summary')
  getStudentSummary(@Param('studentId') studentId: string) {
    return this.attendanceService.getStudentSummary(studentId);
  }

  @Get('student/:studentId')
  getStudentAttendance(@Param('studentId') studentId: string) {
    return this.attendanceService.getStudentAttendance(studentId);
  }

  @Get('course/:courseId')
  getCourseAttendance(@Param('courseId') courseId: string) {
    return this.attendanceService.getCourseAttendance(courseId);
  }

  @Get('session/:sessionId')
  getSessionAttendance(@Param('sessionId') sessionId: string) {
    return this.attendanceService.getSessionAttendance(sessionId);
  }

  @Get('sessions/course/:courseId')
  getAttendanceSessionsByCourse(@Param('courseId') courseId: string) {
    return this.attendanceService.getAttendanceSessionsByCourse(courseId);
  }

  @Get('sessions/course/:courseId/active')
  getActiveAttendanceSessionsByCourse(@Param('courseId') courseId: string) {
    return this.attendanceService.getActiveAttendanceSessionsByCourse(courseId);
  }
}