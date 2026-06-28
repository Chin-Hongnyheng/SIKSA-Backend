import { Module } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CoursesResolver } from './courses.resolver';
import { MongooseModule } from '@nestjs/mongoose';
import { courseSchema } from './courses.schema';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from 'src/strategies/jwt-auth.strategy';
import { userSchema } from '../auth/users.schema';
import { scheduleSchema } from '../schedules/schedules.schema';
import { CoursesController } from './courses.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Course', schema: courseSchema },
      { name: 'User', schema: userSchema },
      { name: 'Schedule', schema: scheduleSchema },
    ]),
    JwtModule.register({
      secret: process.env.JWT_ACCESS_SECRET,
    }),
  ],
  controllers: [CoursesController],
  providers: [CoursesService, CoursesResolver, JwtStrategy],
  exports: [JwtModule],
})
export class CoursesModule {}
