import { Module } from '@nestjs/common';
import { GradesResolver } from './grades.resolver';
import { GradesService } from './grades.service';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from 'src/strategies/jwt-auth.strategy';
import { gradeSchema } from './grades.schema';
import { courseSchema } from '../courses/courses.schema';
import { userSchema } from '../auth/users.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Grade', schema: gradeSchema },
      { name: 'Course', schema: courseSchema },
      { name: 'User', schema: userSchema },
    ]),
    JwtModule.register({
      secret: process.env.JWT_ACCESS_SECRET,
    }),
  ],
  providers: [GradesResolver, GradesService, JwtStrategy],
  exports: [JwtModule],
})
export class GradesModule { }
