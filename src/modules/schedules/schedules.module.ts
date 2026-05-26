import { Module } from '@nestjs/common';
import { SchedulesResolver } from './schedules.resolver';
import { SchedulesService } from './schedules.service';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtStrategy } from 'src/strategies/jwt-auth.strategy';
import { scheduleSchema } from './schedules.schema';
import { assessmentSchema } from '../assessments/assessments.schema';
import { courseSchema } from '../courses/courses.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Schedule', schema: scheduleSchema },
      { name: 'Course', schema: courseSchema },
      { name: 'Assessment', schema: assessmentSchema },
    ]),
    JwtModule.register({
      secret: process.env.JWT_ACCESS_SECRET,
    }),
  ],
  exports: [JwtModule],
  providers: [SchedulesResolver, SchedulesService, JwtStrategy],
})
export class SchedulesModule {}
