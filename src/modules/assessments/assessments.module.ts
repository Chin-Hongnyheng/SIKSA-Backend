import { Module } from '@nestjs/common';
import { AssessmentsResolver } from './assessments.resolver';
import { AssessmentsService } from './assessments.service';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from 'src/strategies/jwt-auth.strategy';
import { assessmentSchema } from './assessments.schema';
import { courseSchema } from '../courses/courses.schema';
import { gradeSchema } from '../grades/grades.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Assessment', schema: assessmentSchema },
      { name: 'Course', schema: courseSchema },
      { name: 'Grade', schema: gradeSchema },
    ]),
    JwtModule.register({
      secret: process.env.JWT_ACCESS_SECRET,
    }),
  ],
  providers: [AssessmentsResolver, AssessmentsService, JwtStrategy],
  exports: [JwtModule],
})
export class AssessmentsModule { }
