import { Module } from '@nestjs/common';
import { AssessmentsResolver } from './assessments.resolver';
import { AssessmentsService } from './assessments.service';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from 'src/strategies/jwt-auth.strategy';
import { assessmentSchema } from './assessments.schema';
import { courseSchema } from '../courses/courses.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Assessment', schema: assessmentSchema },
      { name: 'Course', schema: courseSchema },
    ]),
    JwtModule.register({
      secret: process.env.JWT_ACCESS_SECRET,
      signOptions: { expiresIn: '15m' },
    }),
  ],
  providers: [AssessmentsResolver, AssessmentsService, JwtStrategy],
  exports: [JwtModule],
})
export class AssessmentsModule {}
