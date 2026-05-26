import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AttendanceController } from './attendance.controller';
import { AttendanceResolver } from './attendance.resolver';
import { AttendanceService } from './attendance.service';

import { Attendance, AttendanceSchema } from './schemas/attendance.schema';
import {
  AttendanceSession,
  AttendanceSessionSchema,
} from './schemas/attendance-session.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Attendance.name,
        schema: AttendanceSchema,
      },
      {
        name: AttendanceSession.name,
        schema: AttendanceSessionSchema,
      },
    ]),
  ],
  controllers: [AttendanceController],
  providers: [AttendanceService, AttendanceResolver],
  exports: [AttendanceService],
})
export class AttendanceModule {}