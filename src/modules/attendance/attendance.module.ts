import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from 'src/strategies/jwt-auth.strategy';
import { AttendanceResolver } from './attendance.resolver';
import { AttendanceService } from './attendance.service';
import { Attendance, AttendanceSchema } from './attendance.schema';
import {
  AttendanceSession,
  AttendanceSessionSchema,
} from './attendance_session.schema';
import { courseSchema } from '../courses/courses.schema';
import { scheduleSchema } from '../schedules/schedules.schema';
import { NotificationsModule } from '../../notifications/notifications.module';
import { userSchema } from '../auth/users.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Attendance.modelName,
        schema: AttendanceSchema,
      },
      {
        name: AttendanceSession.modelName,
        schema: AttendanceSessionSchema,
      },
      {
        name: 'Course',
        schema: courseSchema,
      },
      {
        name: 'Schedule',
        schema: scheduleSchema,
      },
      { name: 'User', schema: userSchema },
    ]),
    JwtModule.register({
      secret: process.env.JWT_ACCESS_SECRET,
    }),
    NotificationsModule,
  ],
  providers: [AttendanceService, AttendanceResolver, JwtStrategy],
  exports: [AttendanceService],
})
export class AttendanceModule {}
